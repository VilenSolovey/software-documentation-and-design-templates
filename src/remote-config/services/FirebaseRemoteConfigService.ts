import * as crypto from "crypto";
import * as fs from "fs";
import * as https from "https";
import { FirebaseRemoteConfigSettings } from "../types";

const REMOTE_CONFIG_SCOPE = "https://www.googleapis.com/auth/firebase.remoteconfig";
const GOOGLE_TOKEN_HOSTNAME = "oauth2.googleapis.com";
const GOOGLE_TOKEN_PATH = "/token";
const GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface AccessTokenResponse {
  access_token: string;
}

interface RemoteConfigValue {
  value?: string;
  useInAppDefault?: boolean;
}

interface RemoteConfigParameter {
  defaultValue?: RemoteConfigValue;
}

interface RemoteConfigTemplate {
  parameters?: Record<string, RemoteConfigParameter>;
}

export class FirebaseRemoteConfigService {
  constructor(private readonly settings: FirebaseRemoteConfigSettings) {}

  async getStringParameter(): Promise<string> {
    const credentials = this.loadServiceAccount();
    const accessToken = await this.fetchAccessToken(credentials);
    const template = await this.fetchRemoteConfigTemplate(accessToken);
    const parameter = template.parameters?.[this.settings.parameterKey];
    const parameterValue = parameter?.defaultValue?.value;

    if (!parameterValue) {
      throw new Error(
        `Remote Config parameter "${this.settings.parameterKey}" is missing or has no default value.`,
      );
    }

    return parameterValue;
  }

  private loadServiceAccount(): ServiceAccountCredentials {
    if (!fs.existsSync(this.settings.serviceAccountPath)) {
      throw new Error(
        `Firebase service account file not found: ${this.settings.serviceAccountPath}.`,
      );
    }

    const raw = JSON.parse(fs.readFileSync(this.settings.serviceAccountPath, "utf-8")) as Partial<ServiceAccountCredentials>;

    if (!raw.client_email || !raw.private_key) {
      throw new Error("Firebase service account JSON must contain client_email and private_key.");
    }

    return {
      client_email: raw.client_email,
      private_key: raw.private_key,
      token_uri: raw.token_uri ?? GOOGLE_TOKEN_URI,
    };
  }

  private async fetchAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const header = this.encodeBase64Url({ alg: "RS256", typ: "JWT" });
    const payload = this.encodeBase64Url({
      iss: credentials.client_email,
      scope: REMOTE_CONFIG_SCOPE,
      aud: credentials.token_uri ?? GOOGLE_TOKEN_URI,
      iat: nowInSeconds,
      exp: nowInSeconds + 3600,
    });
    const unsignedJwt = `${header}.${payload}`;
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(unsignedJwt);
    signer.end();
    const signature = signer.sign(credentials.private_key).toString("base64url");
    const assertion = `${unsignedJwt}.${signature}`;

    const tokenResponse = await this.requestJson<AccessTokenResponse>(
      {
        hostname: GOOGLE_TOKEN_HOSTNAME,
        path: GOOGLE_TOKEN_PATH,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }).toString(),
    );

    if (!tokenResponse.access_token) {
      throw new Error("Failed to obtain Firebase Remote Config access token.");
    }

    return tokenResponse.access_token;
  }

  private async fetchRemoteConfigTemplate(accessToken: string): Promise<RemoteConfigTemplate> {
    return this.requestJson<RemoteConfigTemplate>(
      {
        hostname: "firebaseremoteconfig.googleapis.com",
        path: `/v1/projects/${encodeURIComponent(this.settings.projectId)}/remoteConfig`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }

  private encodeBase64Url(value: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
  }

  private async requestJson<T>(options: https.RequestOptions, body?: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request = https.request(options, (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf-8");
          const statusCode = response.statusCode ?? 0;

          if (statusCode < 200 || statusCode >= 300) {
            reject(
              new Error(
                `Firebase Remote Config request failed with status ${statusCode}. Response: ${responseBody || "<empty>"}`,
              ),
            );
            return;
          }

          if (!responseBody) {
            reject(new Error("Firebase Remote Config response was empty."));
            return;
          }

          resolve(JSON.parse(responseBody) as T);
        });
      });

      request.on("error", reject);

      if (body) {
        request.write(body);
      }

      request.end();
    });
  }
}

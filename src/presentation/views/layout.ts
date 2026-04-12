interface LayoutOptions {
  title: string;
  subtitle: string;
  body: string;
}

export function renderLayout(options: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(options.title)}</title>
    <style>
      :root {
        --paper: #f7f1e5;
        --surface: rgba(255, 252, 246, 0.9);
        --surface-strong: #fffdf8;
        --ink: #1d2935;
        --muted: #5a6c7d;
        --accent: #9d3c28;
        --accent-soft: #edd2c7;
        --border: rgba(29, 41, 53, 0.12);
        --shadow: 0 24px 60px rgba(43, 26, 17, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Avenir Next", "Trebuchet MS", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top right, rgba(157, 60, 40, 0.18), transparent 32%),
          radial-gradient(circle at bottom left, rgba(44, 93, 124, 0.18), transparent 28%),
          linear-gradient(145deg, #f0e6d4 0%, var(--paper) 55%, #efe5d8 100%);
        min-height: 100vh;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .shell {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto;
        padding: 28px 0 48px;
      }

      .hero {
        background: linear-gradient(135deg, rgba(255, 253, 248, 0.9), rgba(245, 231, 222, 0.92));
        border: 1px solid rgba(157, 60, 40, 0.15);
        border-radius: 28px;
        padding: 28px;
        box-shadow: var(--shadow);
        margin-bottom: 24px;
      }

      .hero h1 {
        margin: 0 0 10px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(2rem, 4vw, 3.4rem);
        line-height: 1;
      }

      .hero p {
        margin: 0;
        max-width: 700px;
        color: var(--muted);
        font-size: 1rem;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 20px;
      }

      .button,
      button,
      select,
      input,
      textarea {
        font: inherit;
      }

      .button,
      button {
        border: none;
        border-radius: 999px;
        padding: 12px 18px;
        cursor: pointer;
        transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
      }

      .button:hover,
      button:hover {
        transform: translateY(-1px);
      }

      .button.primary,
      button.primary {
        background: var(--accent);
        color: #fff;
        box-shadow: 0 14px 24px rgba(157, 60, 40, 0.24);
      }

      .button.secondary,
      button.secondary {
        background: var(--surface-strong);
        border: 1px solid var(--border);
        color: var(--ink);
      }

      .button.danger,
      button.danger {
        background: #c44a3c;
        color: #fff;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 14px;
        margin-bottom: 18px;
      }

      .stat {
        background: rgba(255, 255, 255, 0.65);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 16px;
      }

      .stat strong {
        display: block;
        font-size: 1.7rem;
        margin-bottom: 6px;
      }

      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 24px;
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .card-body {
        padding: 22px;
      }

      .message {
        border-radius: 18px;
        padding: 14px 16px;
        margin-bottom: 16px;
      }

      .message.success {
        background: rgba(65, 131, 97, 0.14);
        border: 1px solid rgba(65, 131, 97, 0.28);
      }

      .message.error {
        background: rgba(196, 74, 60, 0.12);
        border: 1px solid rgba(196, 74, 60, 0.24);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        vertical-align: top;
      }

      th {
        color: var(--muted);
        font-size: 0.86rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      tr:last-child td {
        border-bottom: none;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: #5f2518;
        font-size: 0.9rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
      }

      input,
      select {
        width: 100%;
        padding: 12px 14px;
        border-radius: 16px;
        border: 1px solid rgba(29, 41, 53, 0.16);
        background: rgba(255, 255, 255, 0.88);
      }

      .field-note {
        margin-top: 7px;
        color: var(--muted);
        font-size: 0.88rem;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 22px;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .detail {
        padding: 16px;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.6);
      }

      .detail span {
        display: block;
        margin-bottom: 8px;
        color: var(--muted);
        font-size: 0.86rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .inline-form {
        display: inline;
      }

      .muted {
        color: var(--muted);
      }

      @media (max-width: 720px) {
        .shell {
          width: min(100% - 18px, 100%);
          padding-top: 18px;
        }

        .hero,
        .card-body {
          padding: 18px;
        }

        table,
        thead,
        tbody,
        th,
        td,
        tr {
          display: block;
        }

        thead {
          display: none;
        }

        tr {
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }

        td {
          border-bottom: none;
          padding: 8px 0;
        }

        td::before {
          content: attr(data-label);
          display: block;
          color: var(--muted);
          font-size: 0.8rem;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <h1>${escapeHtml(options.title)}</h1>
        <p>${escapeHtml(options.subtitle)}</p>
        <div class="toolbar">
          <a class="button secondary" href="/examinations">Список обстежень</a>
          <a class="button primary" href="/examinations/new">Додати обстеження</a>
        </div>
      </section>
      ${options.body}
    </main>
  </body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

# Strategy Export Labs

TypeScript application with two parallel Strategy-based export scenarios:

- `payroll-export`:
  external NYC payroll CSV dataset with `console`, `kafka`, `redis`
- `medical-export`:
  local `medical.db` export back into `CSV file`

## Payroll Commands

```bash
npm run payroll:download -- payroll-export/console.config.json
npm run payroll:run -- payroll-export/console.config.json
npm run payroll:infra:up
npm run payroll:run -- payroll-export/kafka.config.json
npm run payroll:run -- payroll-export/redis.config.json
npm run payroll:infra:down
```

## Medical Commands

```bash
npm run medical-export:run -- medical-export/file.config.json
```

## Remote Config Command

```bash
npm run export:remote -- remote-config/firebase.config.json
```

This command reads `export_mode` from Firebase Remote Config and dispatches to:

- `console` -> `payroll-export/console.config.json`
- `kafka` -> `payroll-export/kafka.config.json`
- `redis` -> `payroll-export/redis.config.json`
- `medical_db_csv` -> `medical-export/file.config.json`

The output backend is selected through JSON configuration or Firebase Remote Config.

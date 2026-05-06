# Payroll Export Strategy

TypeScript application for reading NYC Citywide Payroll CSV data and exporting formatted rows through configurable output strategies.

## Commands

```bash
npm run payroll:download -- payroll-export/console.config.json
npm run payroll:run -- payroll-export/console.config.json
npm run payroll:infra:up
npm run payroll:run -- payroll-export/kafka.config.json
npm run payroll:run -- payroll-export/redis.config.json
npm run payroll:infra:down
```

The output backend is selected only through JSON configuration: `console`, `kafka`, or `redis`.

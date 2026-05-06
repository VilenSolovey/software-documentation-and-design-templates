# Payroll Export Strategy

## Purpose

This module reads NYC Citywide Payroll data from a CSV file, writes formatted records to a local text file, and sends the same records to a configurable output backend.

The output logic uses the GoF `Strategy` pattern, so switching between console, Kafka, and Redis requires only a different JSON config file.

## Dataset

`Citywide Payroll Data (Fiscal Year)` from NYC Open Data:

- dataset page: `https://data.cityofnewyork.us/City-Government/Citywide-Payroll-Data-Fiscal-Year-/k397-673e/about_data`
- CSV endpoint in configs: `https://data.cityofnewyork.us/resource/k397-673e.csv?$limit=20`

## Design

1. `downloadPayrollDataset.ts` downloads the CSV dataset to a local file.
2. `PayrollCsvReader` reads the local CSV file.
3. `PayrollExportService` formats dataset rows, writes them to a local file, and delegates output to the selected strategy.
4. The output strategy is selected from JSON configuration without changing application code.

## Strategy Pattern

- `IOutputStrategy` - strategy interface
- `ConsoleOutputStrategy` - console output strategy
- `KafkaOutputStrategy` - Kafka output strategy
- `RedisOutputStrategy` - Redis output strategy
- `createOutputStrategy(...)` - factory that creates the selected strategy from config
- `PayrollExportService` - context that uses the strategy through the common interface

## Config Files

- `payroll-export/console.config.json`
- `payroll-export/kafka.config.json`
- `payroll-export/redis.config.json`

## Run

Download the CSV dataset:

```bash
npm run payroll:download -- payroll-export/console.config.json
```

Console output:

```bash
npm run payroll:run -- payroll-export/console.config.json
```

Start Kafka and Redis:

```bash
npm run payroll:infra:up
```

Kafka output:

```bash
npm run payroll:run -- payroll-export/kafka.config.json
```

Check Kafka messages:

```bash
docker exec -it payroll-kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic citywide-payroll --from-beginning --timeout-ms 5000
```

Redis output:

```bash
docker exec -it payroll-redis redis-cli DEL citywide-payroll:rows
npm run payroll:run -- payroll-export/redis.config.json
docker exec -it payroll-redis redis-cli LRANGE citywide-payroll:rows 0 -1
```

Stop infrastructure:

```bash
npm run payroll:infra:down
```

## Result Files

- raw CSV: `data/payroll-export/citywide-payroll.csv`
- formatted records: `data/payroll-export/processed-payroll-lines.txt`

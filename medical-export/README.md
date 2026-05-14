# Medical Export Strategy

## Purpose

This module reads medical examination data from the local SQLite database created in the previous labs and exports it using the GoF `Strategy` pattern.

In this scenario the final output is a CSV file generated from the local database.

## Data Source

The source is the local database:

- `data/medical.db`

The exported CSV schema matches the medical CSV structure used earlier in the project:

- patient / doctor / record / examination / result fields

## Config Files

- `medical-export/file.config.json`

CSV file:

```bash
npm run medical-export:run -- medical-export/file.config.json
```

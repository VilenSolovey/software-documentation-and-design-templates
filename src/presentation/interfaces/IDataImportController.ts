export interface IDataImportController {
  handleImport(csvFilePath: string): Promise<void>;
}

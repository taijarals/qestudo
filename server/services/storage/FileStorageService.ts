export interface FileStorageService {
  save(buffer: Buffer, path: string, mimeType: string): Promise<string>;
  get(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
}

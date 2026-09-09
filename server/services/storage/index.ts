import { SupabaseFileStorageService } from './SupabaseFileStorageService';
import { LocalFileStorageService } from './LocalFileStorageService';
import { FileStorageService } from './FileStorageService';

let storageService: FileStorageService;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  storageService = new SupabaseFileStorageService();
} else {
  console.warn("Supabase credentials not found. Falling back to LocalFileStorageService for development.");
  storageService = new LocalFileStorageService();
}

export { storageService };
export * from './FileStorageService';

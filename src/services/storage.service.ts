export class StorageService {
  private dbName = 'MahjongDB';
  private dbVersion = 2; // Increment version to add new object store
  private db: IDBDatabase | null = null;
  private dbReadyPromise: Promise<boolean>;

  constructor() {
    this.dbReadyPromise = this.initializeDB();
  }

  private async initializeDB(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(true);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        this.db = db;

        // Create object stores
        if (!db.objectStoreNames.contains('gameStates')) {
          const gameStore = db.createObjectStore('gameStates', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          gameStore.createIndex('layout', 'layout', { unique: false });
          gameStore.createIndex('completed', 'completed', { unique: false });
          gameStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('statistics')) {
          db.createObjectStore('statistics', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('currentGame')) {
          db.createObjectStore('currentGame', { keyPath: 'id' });
        }
      };
    });
  }

  public async save(storeName: string, data: any): Promise<any> {
    await this.dbReadyPromise;
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async get(storeName: string, key: any): Promise<any> {
    await this.dbReadyPromise;
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async getAll(storeName: string): Promise<any[]> {
    await this.dbReadyPromise;
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async delete(storeName: string, key: any): Promise<void> {
    await this.dbReadyPromise;
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async query(storeName: string, indexName: string, query: IDBKeyRange): Promise<any[]> {
    await this.dbReadyPromise;
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(query);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Export singleton instance
export const storageService = new StorageService();
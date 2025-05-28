import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

@Injectable()
export class StorageService {
  private dbName = 'MahjongDB';
  private dbVersion = 1;
  private db: IDBDatabase;
  private dbReady$ = new Subject<boolean>();

  constructor() {
    this.initializeDB();
  }

  private initializeDB(): void {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onerror = () => {
      console.error('Failed to open IndexedDB');
      this.dbReady$.next(false);
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      this.dbReady$.next(true);
    };

    request.onupgradeneeded = (event: any) => {
      this.db = event.target.result;

      // Create object stores
      if (!this.db.objectStoreNames.contains('gameStates')) {
        const gameStore = this.db.createObjectStore('gameStates', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        gameStore.createIndex('layout', 'layout', { unique: false });
        gameStore.createIndex('completed', 'completed', { unique: false });
        gameStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!this.db.objectStoreNames.contains('statistics')) {
        this.db.createObjectStore('statistics', { keyPath: 'id' });
      }

      if (!this.db.objectStoreNames.contains('preferences')) {
        this.db.createObjectStore('preferences', { keyPath: 'key' });
      }
    };
  }

  public save(storeName: string, data: any): Observable<any> {
    return Observable.create((observer: any) => {
      this.dbReady$.subscribe(ready => {
        if (!ready) {
          observer.error('Database not ready');
          return;
        }

        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => {
          observer.next(request.result);
          observer.complete();
        };

        request.onerror = () => {
          observer.error(request.error);
        };
      });
    });
  }

  public get(storeName: string, key: any): Observable<any> {
    return Observable.create((observer: any) => {
      this.dbReady$.subscribe(ready => {
        if (!ready) {
          observer.error('Database not ready');
          return;
        }

        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          observer.next(request.result);
          observer.complete();
        };

        request.onerror = () => {
          observer.error(request.error);
        };
      });
    });
  }

  public getAll(storeName: string): Observable<any[]> {
    return Observable.create((observer: any) => {
      this.dbReady$.subscribe(ready => {
        if (!ready) {
          observer.error('Database not ready');
          return;
        }

        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          observer.next(request.result);
          observer.complete();
        };

        request.onerror = () => {
          observer.error(request.error);
        };
      });
    });
  }

  public delete(storeName: string, key: any): Observable<void> {
    return Observable.create((observer: any) => {
      this.dbReady$.subscribe(ready => {
        if (!ready) {
          observer.error('Database not ready');
          return;
        }

        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          observer.next();
          observer.complete();
        };

        request.onerror = () => {
          observer.error(request.error);
        };
      });
    });
  }

  public query(storeName: string, indexName: string, query: IDBKeyRange): Observable<any[]> {
    return Observable.create((observer: any) => {
      this.dbReady$.subscribe(ready => {
        if (!ready) {
          observer.error('Database not ready');
          return;
        }

        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(query);

        request.onsuccess = () => {
          observer.next(request.result);
          observer.complete();
        };

        request.onerror = () => {
          observer.error(request.error);
        };
      });
    });
  }
}
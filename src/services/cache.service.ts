interface CacheEntry {
  data: any;
  expiry: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private inFlightPromises = new Map<string, Promise<any>>();
  private cleanupInterval: number;

  constructor() {
    // Clean expired entries every 5 minutes
    this.cleanupInterval = window.setInterval(() => this.cleanExpiredEntries(), 5 * 60 * 1000);
  }

  public async get<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl: number = 60000 // Default TTL: 1 minute
  ): Promise<T> {
    // Check if we have a valid cached value
    if (this.has(key)) {
      return this.getCached(key);
    }

    // Check if the same request is already in flight
    if (this.inFlightPromises.has(key)) {
      return this.inFlightPromises.get(key)!;
    }

    // Create new request and cache it
    const promise = fallback()
      .then(data => {
        this.set(key, data, ttl);
        this.inFlightPromises.delete(key);
        return data;
      })
      .catch(error => {
        this.inFlightPromises.delete(key);
        throw error;
      });

    this.inFlightPromises.set(key, promise);
    return promise;
  }

  public set(key: string, data: any, ttl: number = 60000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  public getCached(key: string): any {
    const entry = this.cache.get(key);
    return entry ? entry.data : null;
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.inFlightPromises.clear();
  }

  public clearPattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (entry.expiry < now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Export singleton instance
export const cacheService = new CacheService();
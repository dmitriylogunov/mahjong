import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

interface CacheEntry {
  data: any;
  expiry: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private inFlightObservables = new Map<string, Observable<any>>();

  constructor() {
    // Clean expired entries every 5 minutes
    setInterval(() => this.cleanExpiredEntries(), 5 * 60 * 1000);
  }

  public get(
    key: string,
    fallback: Observable<any>,
    ttl: number = 60000 // Default TTL: 1 minute
  ): Observable<any> {
    // Check if we have a valid cached value
    if (this.has(key)) {
      return Observable.of(this.getCached(key));
    }

    // Check if the same request is already in flight
    if (this.inFlightObservables.has(key)) {
      return this.inFlightObservables.get(key)!;
    }

    // Create new request and cache it
    const shared = fallback
      .do(data => {
        this.set(key, data, ttl);
        this.inFlightObservables.delete(key);
      })
      .share();

    this.inFlightObservables.set(key, shared);
    return shared;
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
    this.inFlightObservables.clear();
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
}
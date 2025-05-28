import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { StorageService } from '../services/storage.service';
import { CacheService } from '../services/cache.service';
import { GameState, GameStatistics } from '../models/game-state.model';
import { GameStateValidator } from '../validators/game-state.validator';

@Injectable()
export class GameRepository {
  private readonly GAME_STORE = 'gameStates';
  private readonly STATS_STORE = 'statistics';
  private readonly STATS_KEY = 'global_stats';

  constructor(
    private storage: StorageService,
    private cache: CacheService
  ) {}

  public saveGameState(gameState: GameState): Observable<GameState> {
    // Validate game state
    const validation = GameStateValidator.validate(gameState);
    if (!validation.valid) {
      return Observable.throw(new Error(`Invalid game state: ${validation.errors.join(', ')}`));
    }

    // Add timestamps
    const now = new Date();
    if (!gameState.createdAt) {
      gameState.createdAt = now;
    }
    gameState.updatedAt = now;

    // Save to storage
    return this.storage.save(this.GAME_STORE, gameState)
      .map(id => {
        gameState.id = id;
        // Invalidate cache
        this.cache.clearPattern(/^game_/);
        return gameState;
      })
      .catch(error => {
        console.error('Failed to save game state:', error);
        return Observable.throw(error);
      });
  }

  public getGameState(id: string): Observable<GameState> {
    const cacheKey = `game_${id}`;
    
    return this.cache.get(
      cacheKey,
      this.storage.get(this.GAME_STORE, id),
      300000 // 5 minutes TTL
    );
  }

  public getActiveGames(): Observable<GameState[]> {
    const cacheKey = 'active_games';
    
    return this.cache.get(
      cacheKey,
      this.storage.query(
        this.GAME_STORE,
        'completed',
        IDBKeyRange.only(false)
      ),
      60000 // 1 minute TTL
    );
  }

  public getCompletedGames(limit: number = 10): Observable<GameState[]> {
    return this.storage.query(
      this.GAME_STORE,
      'completed',
      IDBKeyRange.only(true)
    ).map(games => {
      // Sort by date and limit
      return games
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    });
  }

  public deleteGameState(id: string): Observable<void> {
    return this.storage.delete(this.GAME_STORE, id)
      .do(() => {
        // Invalidate cache
        this.cache.delete(`game_${id}`);
        this.cache.delete('active_games');
      });
  }

  public getStatistics(): Observable<GameStatistics> {
    const cacheKey = 'game_statistics';
    
    return this.cache.get(
      cacheKey,
      this.storage.get(this.STATS_STORE, this.STATS_KEY)
        .map(stats => stats || this.getDefaultStatistics()),
      600000 // 10 minutes TTL
    );
  }

  public updateStatistics(update: Partial<GameStatistics>): Observable<GameStatistics> {
    return this.getStatistics()
      .switchMap(stats => {
        const updated = { ...stats, ...update, id: this.STATS_KEY };
        return this.storage.save(this.STATS_STORE, updated);
      })
      .do(() => {
        // Invalidate cache
        this.cache.delete('game_statistics');
      })
      .switchMap(() => this.getStatistics());
  }

  public getGamesByLayout(layout: string): Observable<GameState[]> {
    const cacheKey = `games_layout_${layout}`;
    
    return this.cache.get(
      cacheKey,
      this.storage.query(
        this.GAME_STORE,
        'layout',
        IDBKeyRange.only(layout)
      ),
      120000 // 2 minutes TTL
    );
  }

  private getDefaultStatistics(): GameStatistics {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      bestScore: 0,
      averageTime: 0,
      fastestWin: Infinity
    };
  }
}
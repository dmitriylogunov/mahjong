import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GameRepository } from '../../core/repositories/game.repository';
import { GameState, GameStatistics, Move, TilePosition } from '../../core/models/game-state.model';
import { MjTile } from '../../../classes/mj.tile';
import { MjTileCollection } from '../../../classes/mj.tile.collection';

@Injectable()
export class GamePersistenceService {
  private currentGameId: string | null = null;

  constructor(private gameRepository: GameRepository) {}

  public startNewGame(layout: string, tiles: MjTileCollection): Observable<GameState> {
    const gameState: GameState = {
      layout: layout,
      score: 0,
      timer: 0,
      moves: [],
      remainingTiles: this.tilesToPositions(tiles.getAllTiles()),
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      seed: Math.floor(Math.random() * 1000000)
    };

    return this.gameRepository.saveGameState(gameState)
      .do(saved => {
        this.currentGameId = saved.id!;
      });
  }

  public saveMove(tile1: MjTile, tile2: MjTile): Observable<void> {
    if (!this.currentGameId) {
      return Observable.throw(new Error('No active game'));
    }

    return this.gameRepository.getGameState(this.currentGameId)
      .switchMap(gameState => {
        const move: Move = {
          tile1: this.tileToPosition(tile1),
          tile2: this.tileToPosition(tile2),
          timestamp: Date.now()
        };

        gameState.moves.push(move);
        
        // Remove tiles from remaining tiles
        gameState.remainingTiles = gameState.remainingTiles.filter(
          t => !this.isSameTilePosition(t, move.tile1) && 
               !this.isSameTilePosition(t, move.tile2)
        );

        return this.gameRepository.saveGameState(gameState);
      })
      .map(() => void 0);
  }

  public saveGameProgress(score: number, timer: number): Observable<void> {
    if (!this.currentGameId) {
      return Observable.throw(new Error('No active game'));
    }

    return this.gameRepository.getGameState(this.currentGameId)
      .switchMap(gameState => {
        gameState.score = score;
        gameState.timer = timer;
        return this.gameRepository.saveGameState(gameState);
      })
      .map(() => void 0);
  }

  public completeGame(score: number, timer: number, won: boolean): Observable<void> {
    if (!this.currentGameId) {
      return Observable.throw(new Error('No active game'));
    }

    return this.gameRepository.getGameState(this.currentGameId)
      .switchMap(gameState => {
        gameState.score = score;
        gameState.timer = timer;
        gameState.completed = true;
        return this.gameRepository.saveGameState(gameState);
      })
      .switchMap(() => this.updateStatistics(score, timer, won))
      .do(() => {
        this.currentGameId = null;
      })
      .map(() => void 0);
  }

  public loadGame(gameId: string): Observable<GameState> {
    return this.gameRepository.getGameState(gameId)
      .do(gameState => {
        if (!gameState.completed) {
          this.currentGameId = gameId;
        }
      });
  }

  public getActiveGames(): Observable<GameState[]> {
    return this.gameRepository.getActiveGames();
  }

  public getStatistics(): Observable<GameStatistics> {
    return this.gameRepository.getStatistics();
  }

  private updateStatistics(score: number, timer: number, won: boolean): Observable<GameStatistics> {
    return this.gameRepository.getStatistics()
      .switchMap(stats => {
        const updates: Partial<GameStatistics> = {
          gamesPlayed: stats.gamesPlayed + 1,
          totalScore: stats.totalScore + score
        };

        if (won) {
          updates.gamesWon = stats.gamesWon + 1;
          updates.fastestWin = Math.min(stats.fastestWin, timer);
        }

        if (score > stats.bestScore) {
          updates.bestScore = score;
        }

        // Calculate new average time
        const totalGames = stats.gamesPlayed + 1;
        updates.averageTime = ((stats.averageTime * stats.gamesPlayed) + timer) / totalGames;

        return this.gameRepository.updateStatistics(updates);
      });
  }

  private tileToPosition(tile: MjTile): TilePosition {
    return {
      x: tile.boardX,
      y: tile.boardY,
      z: tile.boardZ,
      typeGroup: tile.tileType.group,
      typeIndex: tile.tileType.index
    };
  }

  private tilesToPositions(tiles: MjTile[]): TilePosition[] {
    return tiles.map(tile => this.tileToPosition(tile));
  }

  private isSameTilePosition(pos1: TilePosition, pos2: TilePosition): boolean {
    return pos1.x === pos2.x && 
           pos1.y === pos2.y && 
           pos1.z === pos2.z;
  }
}
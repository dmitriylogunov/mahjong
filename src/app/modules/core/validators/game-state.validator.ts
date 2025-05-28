import { GameState, Move, TilePosition } from '../models/game-state.model';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class GameStateValidator {
  public static validate(gameState: GameState): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!gameState.layout) {
      errors.push('Layout is required');
    }

    if (gameState.score < 0) {
      errors.push('Score cannot be negative');
    }

    if (gameState.timer < 0) {
      errors.push('Timer cannot be negative');
    }

    // Validate moves
    if (gameState.moves && !Array.isArray(gameState.moves)) {
      errors.push('Moves must be an array');
    } else if (gameState.moves) {
      gameState.moves.forEach((move, index) => {
        const moveErrors = this.validateMove(move);
        if (moveErrors.length > 0) {
          errors.push(`Move ${index}: ${moveErrors.join(', ')}`);
        }
      });
    }

    // Validate remaining tiles
    if (gameState.remainingTiles && !Array.isArray(gameState.remainingTiles)) {
      errors.push('Remaining tiles must be an array');
    } else if (gameState.remainingTiles) {
      gameState.remainingTiles.forEach((tile, index) => {
        const tileErrors = this.validateTilePosition(tile);
        if (tileErrors.length > 0) {
          errors.push(`Tile ${index}: ${tileErrors.join(', ')}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static validateMove(move: Move): string[] {
    const errors: string[] = [];

    if (!move.tile1 || !move.tile2) {
      errors.push('Both tiles are required for a move');
    }

    if (move.timestamp < 0) {
      errors.push('Timestamp cannot be negative');
    }

    if (move.tile1) {
      const tile1Errors = this.validateTilePosition(move.tile1);
      if (tile1Errors.length > 0) {
        errors.push(`Tile1: ${tile1Errors.join(', ')}`);
      }
    }

    if (move.tile2) {
      const tile2Errors = this.validateTilePosition(move.tile2);
      if (tile2Errors.length > 0) {
        errors.push(`Tile2: ${tile2Errors.join(', ')}`);
      }
    }

    return errors;
  }

  private static validateTilePosition(tile: TilePosition): string[] {
    const errors: string[] = [];

    if (tile.x < 0 || tile.x > 30) {
      errors.push('X coordinate out of range');
    }

    if (tile.y < 0 || tile.y > 16) {
      errors.push('Y coordinate out of range');
    }

    if (tile.z < 0 || tile.z > 7) {
      errors.push('Z coordinate out of range');
    }

    if (!tile.typeGroup) {
      errors.push('Type group is required');
    }

    if (tile.typeIndex < 0) {
      errors.push('Type index cannot be negative');
    }

    const validGroups = ['ball', 'bamboo', 'number', 'wind', 'dragon', 'flower', 'season'];
    if (tile.typeGroup && !validGroups.includes(tile.typeGroup)) {
      errors.push(`Invalid type group: ${tile.typeGroup}`);
    }

    return errors;
  }

  public static sanitize(gameState: GameState): GameState {
    // Create a deep copy to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(gameState));

    // Ensure score and timer are non-negative
    sanitized.score = Math.max(0, sanitized.score || 0);
    sanitized.timer = Math.max(0, sanitized.timer || 0);

    // Ensure arrays exist
    sanitized.moves = sanitized.moves || [];
    sanitized.remainingTiles = sanitized.remainingTiles || [];

    // Ensure boolean values
    sanitized.completed = !!sanitized.completed;

    return sanitized;
  }
}
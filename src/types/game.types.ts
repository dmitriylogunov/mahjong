export interface GameState {
  id?: string;
  layout: string;
  score: number;
  timer: number;
  moves: Move[];
  remainingTiles: TilePosition[];
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  seed?: number;
}

export interface Move {
  tile1: TilePosition;
  tile2: TilePosition;
  timestamp: number;
}

export interface TilePosition {
  x: number;
  y: number;
  z: number;
  typeGroup: string;
  typeIndex: number;
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestScore: number;
  averageTime: number;
  fastestWin: number;
}

export interface TileCharacters {
  [group: string]: string[][];
}
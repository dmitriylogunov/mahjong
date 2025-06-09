// Layout structure for Mahjong solitaire
// Each layout is defined as layers of tile positions
// Coordinates are in grid units where each tile occupies 2x2 units
// Origin (0,0) is at top-left corner

export interface TilePosition {
  x: number;
  y: number;
  z: number;
}

export interface Layout {
  name: string;
  description: string;
  positions: TilePosition[];
}

// Helper function to create tile positions for a layer
function createLayer(positions: number[][], z: number): TilePosition[] {
  return positions.map(([x, y]) => ({ x, y, z }));
}

// Turtle layout - classic Mahjong solitaire layout
const turtlePositions: TilePosition[] = [
  // Layer 0 - Base layer (88 tiles)
  ...createLayer([
    // Row 0 (y=0) - 12 tiles
    [2,0], [4,0], [6,0], [8,0], [10,0], [12,0], [14,0], [16,0], [18,0], [20,0], [22,0], [24,0],
    // Row 1 (y=2) - 14 tiles  
    [0,2], [2,2], [4,2], [6,2], [8,2], [10,2], [12,2], [14,2], [16,2], [18,2], [20,2], [22,2], [24,2], [26,2],
    // Row 2 (y=4) - 14 tiles
    [0,4], [2,4], [4,4], [6,4], [8,4], [10,4], [12,4], [14,4], [16,4], [18,4], [20,4], [22,4], [24,4], [26,4],
    // Row 3 (y=6) - 16 tiles (includes special tiles on the right)
    [0,6], [2,6], [4,6], [6,6], [8,6], [10,6], [12,6], [14,6], [16,6], [18,6], [20,6], [22,6], [24,6], [26,6], [28,6], [30,6],
    // Row 4 (y=8) - 12 tiles
    [2,8], [4,8], [6,8], [8,8], [10,8], [12,8], [14,8], [16,8], [18,8], [20,8], [22,8], [24,8],
    // Row 5 (y=10) - 10 tiles
    [4,10], [6,10], [8,10], [10,10], [12,10], [14,10], [16,10], [18,10], [20,10], [22,10],
    // Row 6 (y=12) - 8 tiles
    [6,12], [8,12], [10,12], [12,12], [14,12], [16,12], [18,12], [20,12],
  ], 0),
  
  // Layer 1 - Second layer (42 tiles)
  ...createLayer([
    // Row 1 (y=2) - 8 tiles
    [6,2], [8,2], [10,2], [12,2], [14,2], [16,2], [18,2], [20,2],
    // Row 2 (y=4) - 10 tiles
    [4,4], [6,4], [8,4], [10,4], [12,4], [14,4], [16,4], [18,4], [20,4], [22,4],
    // Row 3 (y=6) - 10 tiles
    [4,6], [6,6], [8,6], [10,6], [12,6], [14,6], [16,6], [18,6], [20,6], [22,6],
    // Row 4 (y=8) - 8 tiles
    [6,8], [8,8], [10,8], [12,8], [14,8], [16,8], [18,8], [20,8],
    // Row 5 (y=10) - 6 tiles
    [8,10], [10,10], [12,10], [14,10], [16,10], [18,10],
  ], 1),
  
  // Layer 2 - Third layer (16 tiles)
  ...createLayer([
    // Row 2 (y=4) - 6 tiles
    [8,4], [10,4], [12,4], [14,4], [16,4], [18,4],
    // Row 3 (y=6) - 6 tiles
    [8,6], [10,6], [12,6], [14,6], [16,6], [18,6],
    // Row 4 (y=8) - 4 tiles
    [10,8], [12,8], [14,8], [16,8],
  ], 2),
  
  // Layer 3 - Fourth layer (8 tiles)
  ...createLayer([
    // Row 2 (y=4) - 4 tiles
    [10,4], [12,4], [14,4], [16,4],
    // Row 3 (y=6) - 4 tiles
    [10,6], [12,6], [14,6], [16,6],
  ], 3),
  
  // Layer 4 - Top layer (4 tiles)
  ...createLayer([
    // Row 2 (y=4) - 2 tiles
    [12,4], [14,4],
    // Row 3 (y=6) - 2 tiles
    [12,6], [14,6],
  ], 4),
  
  // Special position - "flower on top" (1 tile)
  { x: 13, y: 5, z: 5 }
];

export const turtleLayout: Layout = {
  name: 'turtle',
  description: 'Classic Mahjong solitaire turtle layout with 144 tiles',
  positions: turtlePositions
};

// Export for backward compatibility
export const layouts = {
  turtle: turtleLayout.positions.map(p => [p.x, p.y])
};
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
// Originally called "Dragon layout" in the pre-Vue version
const turtlePositions: TilePosition[] = [
  // Layer 0 - Base layer (87 tiles)
  ...createLayer([
    [2,0], [4,0], [6,0], [8,0], [10,0], [12,0], [14,0], [16,0], [18,0], [20,0], [22,0], [24,0],
    [6,2], [8,2], [10,2], [12,2], [14,2], [16,2], [18,2], [20,2],
    [4,4], [6,4], [8,4], [10,4], [12,4], [14,4], [16,4], [18,4], [20,4], [22,4],
    [2,6], [4,6], [6,6], [8,6], [10,6], [12,6], [14,6], [16,6], [18,6], [20,6], [22,6], [24,6],
    [0,7], [26,7], [28,7],
    [2,8], [4,8], [6,8], [8,8], [10,8], [12,8], [14,8], [16,8], [18,8], [20,8], [22,8], [24,8],
    [4,10], [6,10], [8,10], [10,10], [12,10], [14,10], [16,10], [18,10], [20,10], [22,10],
    [6,12], [8,12], [10,12], [12,12], [14,12], [16,12], [18,12], [20,12],
    [2,14], [4,14], [6,14], [8,14], [10,14], [12,14], [14,14], [16,14], [18,14], [20,14], [22,14], [24,14],
  ], 0),
  
  // Layer 1 (36 tiles)
  ...createLayer([
    [8,2], [10,2], [12,2], [14,2], [16,2], [18,2],
    [8,4], [10,4], [12,4], [14,4], [16,4], [18,4],
    [8,6], [10,6], [12,6], [14,6], [16,6], [18,6],
    [8,8], [10,8], [12,8], [14,8], [16,8], [18,8],
    [8,10], [10,10], [12,10], [14,10], [16,10], [18,10],
    [8,12], [10,12], [12,12], [14,12], [16,12], [18,12],
  ], 1),
  
  // Layer 2 (16 tiles)
  ...createLayer([
    [10,4], [12,4], [14,4], [16,4],
    [10,6], [12,6], [14,6], [16,6],
    [10,8], [12,8], [14,8], [16,8],
    [10,10], [12,10], [14,10], [16,10],
  ], 2),
  
  // Layer 3 (4 tiles)
  ...createLayer([
    [12,6], [14,6],
    [12,8], [14,8],
  ], 3),
  
  // Layer 4 - Top (1 tile)
  ...createLayer([
    [13,7],
  ], 4)
];
export const turtleLayout: Layout = {
  name: 'turtle',
  description: 'Classic Mahjong solitaire turtle layout with 144 tiles',
  positions: turtlePositions
};
// Export for backward compatibility
// Mobile turtle layout - adapted for smaller screens
// Removes level 0 and adds side tiles to level 1
// Total: 72 tiles (exactly half of 144)
const mobileTurtlePositions: TilePosition[] = [
  // Level 1 - Base layer with side extensions (51 tiles)
  ...createLayer([
    // Original level 1 tiles (36 tiles) - normalized to (0,0)
    [2,0], [4,0], [6,0], [8,0], [10,0], [12,0],
    [2,2], [4,2], [6,2], [8,2], [10,2], [12,2],
    [2,4], [4,4], [6,4], [8,4], [10,4], [12,4],
    [2,6], [4,6], [6,6], [8,6], [10,6], [12,6],
    [2,8], [4,8], [6,8], [8,8], [10,8], [12,8],
    [2,10], [4,10], [6,10], [8,10], [10,10], [12,10],

    // Side extensions (15 tiles) - vertically in the middle - normalized
    [0,2], [0,4], [0,6], [0,8], [14,2], [14,4], [14,6], [14,8] // Left and right sides - core middle

  ], 1),
  
  // Layer 2 (16 tiles) - normalized
  ...createLayer([
    // Additional tiles for balance
    [2,5], [12,5],

    // top two
    [6,0], [8,0],

    // bottom three
    [5,10], [7,10], [9,10],

    [4,2], [6,2], [8,2], [10,2],
    [4,4], [6,4], [8,4], [10,4],
    [4,6], [6,6], [8,6], [10,6],
    [4,8], [6,8], [8,8], [10,8],
  ], 2),
  
  // Layer 3 (4 tiles) - normalized
  ...createLayer([
    [6,4], [8,4],
    [6,6], [8,6],
  ], 3),
  
  // Layer 4 - Top (1 tile) - normalized
  ...createLayer([
    [7,5],
  ], 4)
];

export const mobileTurtleLayout: Layout = {
  name: 'mobile-turtle',
  description: 'Mobile-optimized turtle layout with 72 tiles (exactly half of original)',
  positions: mobileTurtlePositions
};

export const layouts = {
  turtle: turtleLayout.positions.map(p => [p.x, p.y]),
  'mobile-turtle': mobileTurtleLayout.positions.map(p => [p.x, p.y])
};
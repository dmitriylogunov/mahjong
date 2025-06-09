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
// The layout resembles a turtle shell when viewed from above
const turtlePositions: TilePosition[] = [
  // Layer 0 - Base layer (87 tiles total)
  ...createLayer([
    // Row 0 (y=0) - 12 tiles (narrow top)
    [4,0], [6,0], [8,0], [10,0], [12,0], [14,0], [16,0], [18,0], [20,0], [22,0], [24,0], [26,0],
    
    // Row 1 (y=2) - 8 tiles  
    [0,2], [2,2], [8,2], [10,2], [12,2], [14,2], [16,2], [18,2], [20,2], [22,2], [28,2], [30,2],
    
    // Row 2 (y=4) - 12 tiles
    [0,4], [2,4], [4,4], [6,4], [8,4], [10,4], [12,4], [14,4], [16,4], [18,4], [20,4], [22,4], [24,4], [26,4], [28,4], [30,4],
    
    // Row 3 (y=6) - 14 tiles (widest part)
    [2,6], [4,6], [6,6], [8,6], [10,6], [12,6], [14,6], [16,6], [18,6], [20,6], [22,6], [24,6], [26,6], [28,6],
    
    // Row 4 (y=8) - 12 tiles
    [0,8], [2,8], [4,8], [6,8], [8,8], [10,8], [12,8], [14,8], [16,8], [18,8], [20,8], [22,8], [24,8], [26,8], [28,8], [30,8],
    
    // Row 5 (y=10) - 12 tiles
    [0,10], [2,10], [8,10], [10,10], [12,10], [14,10], [16,10], [18,10], [20,10], [22,10], [28,10], [30,10],
    
    // Row 6 (y=12) - 12 tiles (narrow bottom)
    [4,12], [6,12], [8,12], [10,12], [12,12], [14,12], [16,12], [18,12], [20,12], [22,12], [24,12], [26,12],
    
    // Special tiles on sides
    [30,0], // Right side special tile
    [0,0],  // Left side special tile
  ], 0),
  
  // Layer 1 - Second layer (37 tiles)
  ...createLayer([
    // Row 0.5 (y=1) - 6 tiles
    [10,1], [12,1], [14,1], [16,1], [18,1], [20,1],
    
    // Row 1.5 (y=3) - 8 tiles
    [8,3], [10,3], [12,3], [14,3], [16,3], [18,3], [20,3], [22,3],
    
    // Row 2.5 (y=5) - 10 tiles
    [6,5], [8,5], [10,5], [12,5], [14,5], [16,5], [18,5], [20,5], [22,5], [24,5],
    
    // Row 3.5 (y=7) - 8 tiles
    [8,7], [10,7], [12,7], [14,7], [16,7], [18,7], [20,7], [22,7],
    
    // Row 4.5 (y=9) - 5 tiles
    [10,9], [12,9], [14,9], [16,9], [18,9], [20,9],
  ], 1),
  
  // Layer 2 - Third layer (16 tiles)
  ...createLayer([
    // Row 1 (y=3) - 2 tiles
    [12,3], [14,3], [16,3], [18,3],
    
    // Row 2 (y=5) - 6 tiles
    [10,5], [12,5], [14,5], [16,5], [18,5], [20,5],
    
    // Row 3 (y=7) - 4 tiles
    [12,7], [14,7], [16,7], [18,7],
  ], 2),
  
  // Layer 3 - Fourth layer (4 tiles)
  ...createLayer([
    // Center block
    [14,5], [16,5],
    [14,6], [16,6],
  ], 3),
  
  // Layer 4 - Top layer (1 tile)
  ...createLayer([
    // Top center tile
    [15,5.5],
  ], 4)
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
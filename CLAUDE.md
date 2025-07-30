# Mahjong Solitaire - Development Guidelines

## Tile Generation Rules

### Mobile Layout (70 tiles)
The mobile layout must follow these strict rules for tile distribution:

1. **Seasons** (4 tiles total)
   - Exactly 1 of each: Spring, Summer, Autumn, Winter
   - These tiles match any other season tile

2. **Flowers** (4 tiles total)
   - Exactly 1 of each: Plum, Orchid, Bamboo, Mum
   - These tiles match any other flower tile

3. **Dragons** (12 tiles total)
   - Exactly 2 pairs (4 tiles) of each dragon type
   - Red, Green, and Blue dragons

4. **Winds** (16 tiles total)
   - Exactly 2 pairs (4 tiles) of each wind direction
   - East, South, West, North

5. **Numbered Suits** (34 tiles total)
   - Only use tiles numbered 1-4 (no 5-9 tiles in mobile)
   - Three suits: Numbers (red), Bamboos (green), Balls (blue)
   - At least 1 pair of each tile type
   - Remaining tiles distributed evenly among the suits

### Desktop Layout (144 tiles)
Standard Mahjong tile set with full distribution.

## Level Generation Algorithm

The game uses a reverse-placement algorithm to ensure all puzzles are solvable:

1. Start with all tile positions empty
2. Place matching pairs in positions that would be "free" to remove
3. Work backwards from the solution to create the initial layout
4. This guarantees at least one valid solution path

### Tile Placement Rules
- Tiles must not overlap other tiles on the same layer
- Use proper `overlaps2d()` method for collision detection
- A tile is "free" if:
  - No tiles are directly above it
  - At least one side (left or right) is unblocked

## Code Quality Requirements

When making changes to the codebase:
- Run `npm run type-check` to ensure TypeScript types are correct
- Run `npm run lint` to check code style
- Test both desktop and mobile layouts after any tile generation changes
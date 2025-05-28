# Mahjong Solitaire - Architecture Documentation

## Overview

This document describes the modular architecture implemented for the Mahjong Solitaire game, focusing on maintainability, performance, and scalability while keeping Angular 2.4.

## Module Structure

### Core Module
Located in `src/app/modules/core/`

**Purpose**: Contains singleton services and application-wide functionality.

**Services**:
- `StorageService`: IndexedDB wrapper for persistent storage
- `CacheService`: In-memory caching with TTL support
- `PreferencesService`: User settings management
- `AssetLoaderService`: Optimized asset loading with CDN support

**Repository**:
- `GameRepository`: Data access layer for game state management

**Models**:
- `GameState`: Game session data structure
- `GameStatistics`: Player statistics tracking

**Validators**:
- `GameStateValidator`: Data validation and sanitization

### Game Module
Located in `src/app/modules/game/`

**Purpose**: Contains all game-specific components and logic.

**Components**:
- `MjGameComponent`: Main game controller
- `MjTileComponent`: Individual tile rendering
- `MjTileFieldComponent`: Game board management
- `MjStatusComponent`: Game status display

**Services**:
- `MjGameControlService`: Game state management
- `MjAudioService`: Sound effects handling
- `GamePersistenceService`: Game save/load functionality

### Shared Module
Located in `src/app/modules/shared/`

**Purpose**: Reusable components and utilities used across modules.

**Components**:
- `ModalComponent`: Reusable modal dialog

**Pipes**:
- `IntAsTimePipe`: Time formatting
- `IntvalPipe`: Integer value formatting

## Data Layer Architecture

### Repository Pattern
The `GameRepository` provides a clean abstraction over data storage:
- Handles all database operations
- Implements caching strategies
- Validates data before persistence
- Provides typed Observable returns

### Storage Service
- Wraps IndexedDB for cross-browser compatibility
- Manages database schema and migrations
- Provides Observable-based API
- Handles connection management

### Cache Service
- In-memory caching with configurable TTL
- Prevents duplicate requests
- Pattern-based cache invalidation
- Automatic cleanup of expired entries

## Build Optimization

### Webpack Configuration
- **Tree Shaking**: Removes unused code
- **Code Splitting**: Separates vendor, Angular, and app code
- **Asset Optimization**: Hashes filenames for cache busting
- **Bundle Analysis**: `npm run analyze` to visualize bundle size

### Production Build
```bash
npm run prod        # Production build
npm run analyze     # Bundle analysis
```

## Usage Examples

### Saving Game State
```typescript
constructor(private gamePersistence: GamePersistenceService) {}

startNewGame() {
  this.gamePersistence.startNewGame('dragon', this.tiles)
    .subscribe(gameState => {
      console.log('Game started:', gameState.id);
    });
}
```

### Managing Preferences
```typescript
constructor(private preferences: PreferencesService) {}

toggleSound() {
  this.preferences.toggleSound()
    .subscribe(prefs => {
      this.soundEnabled = prefs.soundEnabled;
    });
}
```

### Loading Assets
```typescript
constructor(private assetLoader: AssetLoaderService) {}

ngOnInit() {
  const manifest = {
    images: ['/img/tile.png', '/img/backgrounds/oriental-1.jpg'],
    sounds: ['/sounds/click1.wav', '/sounds/coin1.wav'],
    fonts: ['FreeSerifNF']
  };

  this.assetLoader.loadAssets(manifest)
    .subscribe(success => {
      if (success) {
        this.startGame();
      }
    });
}
```

## Performance Considerations

1. **Lazy Loading**: Modules can be lazy loaded when routes are added
2. **Change Detection**: Components use OnPush where applicable
3. **Memory Management**: Proper subscription cleanup
4. **Asset Loading**: Progressive loading with priority system
5. **Caching**: Multi-level caching (memory + IndexedDB)

## Future Enhancements

1. **Service Workers**: For offline support
2. **WebAssembly**: For performance-critical algorithms
3. **GraphQL**: For server-side data if multiplayer is added
4. **State Management**: NgRx when complexity increases
5. **Micro-frontends**: For feature isolation

## Development Guidelines

1. **Module Boundaries**: Keep modules focused and independent
2. **Service Injection**: Use constructor injection
3. **Observable Patterns**: Always unsubscribe or use takeUntil
4. **Type Safety**: Use interfaces for all data structures
5. **Error Handling**: Implement proper error boundaries

## Testing Strategy

1. **Unit Tests**: Service logic and validators
2. **Integration Tests**: Module interactions
3. **E2E Tests**: User workflows
4. **Performance Tests**: Bundle size monitoring

This architecture provides a solid foundation for future enhancements while maintaining the game's current Angular 2.4 compatibility.
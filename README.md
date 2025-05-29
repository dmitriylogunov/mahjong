# Mahjong Solitaire

A modern, responsive Mahjong Solitaire game built with Vue 3, TypeScript, and Vite.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-007ACC?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)

## 🎮 Play Online

Play the game online at [https://mahjong.dmitriylogunov.info](https://mahjong.dmitriylogunov.info)

## ✨ Features

- 🎯 Classic Mahjong Solitaire gameplay
- 🎨 Beautiful tile designs with traditional Mahjong characters
- 💾 Game state persistence using IndexedDB
- ↩️ Undo/Redo functionality
- 💡 Hint system to help find matching pairs
- 🔊 Sound effects and audio feedback
- 📱 Fully responsive design
- ⚡ Lightning-fast performance with Vite
- 🎯 TypeScript for type safety

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Modern web browser with ES6+ support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mahjong.git
cd mahjong

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game locally.

## 📦 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and fix files
npm run lint
```

## 🏗️ Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: SCSS with CSS Modules
- **Icons**: Font Awesome 4.7
- **Storage**: IndexedDB for game persistence

## 🎯 Game Rules

1. **Objective**: Remove all tiles from the board by matching pairs
2. **Matching**: Click two identical tiles to remove them
3. **Free Tiles**: Only tiles that are "free" can be selected:
   - Not covered by another tile
   - Have at least one side (left or right) free
4. **Special Tiles**: 
   - Seasons (Spring, Summer, Autumn, Winter) match each other
   - Flowers (Plum, Orchid, Bamboo, Chrysanthemum) match each other

## 🛠️ Architecture

The project follows a modern Vue 3 architecture:

```
src/
├── components/       # Vue components
│   ├── GameView.vue # Main game container
│   ├── TileField.vue # Game board
│   ├── TileComponent.vue # Individual tile
│   ├── StatusBar.vue # Game controls
│   └── AppModal.vue # Reusable modal
├── stores/          # Pinia stores
│   └── game.store.ts # Game state management
├── services/        # Business logic
│   ├── storage.service.ts # IndexedDB wrapper
│   ├── cache.service.ts # In-memory caching
│   ├── preferences.service.ts # User preferences
│   └── audio.service.ts # Sound effects
├── models/          # Data models
│   └── tile.model.ts # Tile classes
├── types/           # TypeScript types
└── data/            # Game layouts
```

## 🚀 Deployment

The project is configured for easy deployment to Vercel:

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel
```

The `vercel.json` configuration is already included for optimal settings.

## 🎨 Customization

### Adding New Layouts

Add new tile layouts in `src/data/layouts.ts`:

```typescript
export const myLayout: number[][] = [
  [x, y], // Tile positions
  // ...
];
```

### Themes

Modify theme colors in `src/assets/styles/_variables.scss`:

```scss
$primary-color: #4CAF50;
$secondary-color: #FFC107;
// ...
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Traditional Mahjong tile designs
- Vue.js team for the amazing framework
- Vite team for the blazing fast build tool
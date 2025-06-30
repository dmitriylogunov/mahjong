import { defineStore } from 'pinia';
import { ref, shallowRef, computed } from 'vue';
import { MjTile } from '@/models/tile.model';
import { GameState, Move } from '@/types/game.types';
import { preferencesService, UserPreferences } from '@/services/preferences.service';
import { storageService } from '@/services/storage.service';

interface UndoItem {
  tiles: MjTile[];
  score: number;
  time: number;
}

export const useGameStore = defineStore('game', () => {
  // Game state
  const tiles = shallowRef<MjTile[]>([]);
  const selectedTile = ref<MjTile | null>(null);
  const score = ref(0);
  const timer = ref(0);
  const isPaused = ref(false);
  const isGameComplete = ref(false);
  const currentLayout = ref('');
  const moves = ref<Move[]>([]);
  
  // Undo/redo stacks
  const undoStack = ref<UndoItem[]>([]);
  const redoStack = ref<UndoItem[]>([]);
  
  // UI states
  const showHint = ref(false);
  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);
  
  // Preferences
  const preferences = ref<UserPreferences>(preferencesService.getCurrentPreferences());
  const soundEnabled = computed(() => preferences.value.soundEnabled);
  const musicEnabled = computed(() => preferences.value.musicEnabled);
  const hintsEnabled = computed(() => preferences.value.hintsEnabled);
  const animationSpeed = computed(() => preferences.value.animationSpeed);
  const theme = computed(() => preferences.value.theme);
  
  // Timer
  let timerInterval: number | null = null;
  
  function startTimer() {
    if (!timerInterval && !isPaused.value) {
      timerInterval = window.setInterval(() => {
        if (!isPaused.value && !isGameComplete.value) {
          timer.value++;
        }
      }, 1000);
    }
  }
  
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
  
  function pauseGame() {
    isPaused.value = true;
    stopTimer();
  }
  
  function resumeGame() {
    isPaused.value = false;
    startTimer();
  }
  
  // Game actions
  function initializeGame(layout: string, tilesData: MjTile[]) {
    tiles.value = tilesData;
    selectedTile.value = null;
    score.value = 0;
    timer.value = 0;
    isPaused.value = false;
    isGameComplete.value = false;
    currentLayout.value = layout;
    moves.value = [];
    undoStack.value = [];
    redoStack.value = [];
    showHint.value = false;
    
    startTimer();
  }
  
  function selectTile(tileParam: any) {
    // Handle Vue reactive wrapping
    const tile = tileParam as MjTile;
    if (!tile.isFree() || isPaused.value || isGameComplete.value) {
      return;
    }
    
    if (selectedTile.value === tile) {
      tile.unselect();
      selectedTile.value = null;
      return;
    }
    
    if (selectedTile.value) {
      if (selectedTile.value.matches(tile)) {
        // Match found!
        removeTiles(selectedTile.value, tile);
      } else {
        // No match
        selectedTile.value.unselect();
        tile.select();
        selectedTile.value = tile;
      }
    } else {
      tile.select();
      selectedTile.value = tile;
    }
  }
  
  function setSelectedTile(tile: MjTile | null) {
    selectedTile.value = tile;
  }
  
  function clearSelection() {
    if (selectedTile.value) {
      selectedTile.value.unselect();
      selectedTile.value = null;
    }
  }
  
  function removeTiles(tile1Param: any, tile2Param: any) {
    const tile1 = tile1Param as MjTile;
    const tile2 = tile2Param as MjTile;
    // Save state for undo
    undoStack.value.push({
      tiles: [tile1, tile2],
      score: score.value,
      time: timer.value
    });
    
    // Clear redo stack
    redoStack.value = [];
    
    // Remove tiles
    tile1.remove();
    tile2.remove();
    selectedTile.value = null;
    
    // Update score
    const baseScore = 10;
    const timeBonus = Math.max(0, 10 - Math.floor(timer.value / 30));
    score.value += baseScore + timeBonus;
    
    // Record move
    moves.value.push({
      tile1: {
        x: tile1.x,
        y: tile1.y,
        z: tile1.z,
        typeGroup: tile1.type!.group,
        typeIndex: tile1.type!.index
      },
      tile2: {
        x: tile2.x,
        y: tile2.y,
        z: tile2.z,
        typeGroup: tile2.type!.group,
        typeIndex: tile2.type!.index
      },
      timestamp: Date.now()
    });
    
    // Check for game completion
    checkGameComplete();
  }
  
  function undo() {
    if (undoStack.value.length === 0) return;
    
    const lastAction = undoStack.value.pop()!;
    
    // Save current state to redo stack
    redoStack.value.push(lastAction);
    
    // Restore tiles
    lastAction.tiles.forEach(tile => tile.returnToField());
    
    // Restore score
    score.value = lastAction.score;
    
    // Remove last move
    moves.value.pop();
  }
  
  function redo() {
    if (redoStack.value.length === 0) return;
    
    const action = redoStack.value.pop()!;
    
    // Re-remove tiles
    action.tiles.forEach(tile => tile.remove());
    
    // Move action back to undo stack
    undoStack.value.push(action);
    
    // Restore score after redo
    const baseScore = 10;
    const timeBonus = Math.max(0, 10 - Math.floor(timer.value / 30));
    score.value += baseScore + timeBonus;
  }
  
  function requestHint() {
    if (!hintsEnabled.value || isPaused.value || isGameComplete.value) return;
    
    showHint.value = true;
    
    // Find all free tiles
    const freeTiles = tiles.value.filter(t => t.active && t.isFree());
    
    // Find matching pairs
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].matches(freeTiles[j])) {
          freeTiles[i].startHint();
          freeTiles[j].startHint();
          
          // Remove hint after 3 seconds
          setTimeout(() => {
            freeTiles[i].stopHint();
            freeTiles[j].stopHint();
            showHint.value = false;
          }, 3000);
          
          return;
        }
      }
    }
    
    // No matches found
    showHint.value = false;
  }
  
  function checkGameComplete() {
    const activeTiles = tiles.value.filter(t => t.active);
    
    if (activeTiles.length === 0) {
      isGameComplete.value = true;
      stopTimer();
      saveGameState(true);
      return;
    }
    
    // Check if any moves are possible
    const freeTiles = activeTiles.filter(t => t.isFree());
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].matches(freeTiles[j])) {
          return; // Game can continue
        }
      }
    }
    
    // No moves possible - game over
    isGameComplete.value = true;
    stopTimer();
    saveGameState(false);
  }
  
  async function saveGameState(completed: boolean) {
    const gameState: GameState = {
      layout: currentLayout.value,
      score: score.value,
      timer: timer.value,
      moves: moves.value,
      remainingTiles: tiles.value
        .filter(t => t.active)
        .map(t => ({
          x: t.x,
          y: t.y,
          z: t.z,
          typeGroup: t.type!.group,
          typeIndex: t.type!.index
        })),
      createdAt: new Date(),
      updatedAt: new Date(),
      completed
    };
    
    try {
      await storageService.save('gameStates', gameState);
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }
  
  // Preferences
  async function updatePreferences(updates: Partial<UserPreferences>) {
    preferences.value = await preferencesService.updatePreferences(updates);
  }
  
  function toggleSound() {
    updatePreferences({ soundEnabled: !soundEnabled.value });
  }
  
  function toggleMusic() {
    updatePreferences({ musicEnabled: !musicEnabled.value });
  }
  
  return {
    // State
    tiles,
    selectedTile,
    score,
    timer,
    isPaused,
    isGameComplete,
    currentLayout,
    moves,
    showHint,
    canUndo,
    canRedo,
    
    // Preferences
    soundEnabled,
    musicEnabled,
    hintsEnabled,
    animationSpeed,
    theme,
    
    // Actions
    initializeGame,
    selectTile,
    setSelectedTile,
    clearSelection,
    undo,
    redo,
    requestHint,
    pauseGame,
    resumeGame,
    toggleSound,
    toggleMusic,
    updatePreferences,
    saveGameState
  };
});
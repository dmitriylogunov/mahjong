<template>
  <div class="game-view">
    <!-- Main Menu Modal -->
    <AppModal v-if="showMainMenu" :actions="mainMenuModalActions" @close="startNewGame">
      <div class="main-menu-content">
        <div class="decorative-border top"></div>
        <h1 class="title" data-text="Mahjong Solitaire">Mahjong<br/>Solitaire</h1>
        <div class="subtitle">Ancient Game of Tiles</div>
        <div class="decorative-border bottom"></div>
      </div>
    </AppModal>

    <!-- Restart Dialog -->
    <AppModal v-if="showRestartDialog" :actions="restartGameModalActions" @close="showRestartDialog = false">
      <h1>Choose restart option:</h1>
    </AppModal>

    <!-- No More Moves Modal -->
    <AppModal v-if="showTieModal" :actions="tieModalActions">
      <h1>No More Free Pairs Left</h1>
      <p>There are no more matching tiles that can be removed at this point.</p>
      <p><strong>Don't worry!</strong> Every game is created to be solvable. You may have taken a path that led to this situation.</p>
    </AppModal>

    <!-- Win Modal -->
    <AppModal v-if="showWinModal" :actions="winModalActions">
      <h1>🎉 Congratulations!</h1>
      <p>You have successfully cleared all tiles!</p>
      <p><strong>Your final score: {{ gameStore.score }}</strong></p>
      <p>Well played! Ready for another journey?</p>
    </AppModal>

    <div class="game-component">
      <div class="statusfield">
        <StatusBar
          @undo="onUndo"
          @redo="onRedo"
          @restart="onRestartRequest"
          :hints-count="numberOfHints"
          :score="gameStore.score"
          :timer="gameStore.timer"
          :show-debug-fields="false"
        />
      </div>

      <div class="gamefield noselect">
        <TileField
          ref="tileFieldRef"
          :layout="currentLayout"
          @ready="onTileCollectionReady"
          @tile-cleared="onTileCleared"
          @click="onClick"
          @continue="onContinueGame"
          :paused="gameStore.isPaused"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useGameStore } from '@/stores/game.store';
import AppModal from './AppModal.vue';
import StatusBar from './StatusBar.vue';
import TileField from './TileField.vue';
import { audioService } from '@/services/audio.service';
import { storageService } from '@/services/storage.service';

const gameStore = useGameStore();

// Component refs
const tileFieldRef = ref<InstanceType<typeof TileField> | null>(null);

// Modal states
const showMainMenu = ref(true);
const showRestartDialog = ref(false);
const showTieModal = ref(false);
const showWinModal = ref(false);

// Game state
const currentLayout = ref('default');
const numberOfHints = ref(3);
const hasSavedGame = ref(false);

// Modal actions
const mainMenuModalActions = computed(() => {
  if (hasSavedGame.value) {
    return [
      {
        label: 'Continue Journey',
        primary: true,
        action: () => continueGame()
      },
      {
        label: 'Start Journey',
        action: () => startNewGame()
      }
    ];
  } else {
    return [
      {
        label: 'Begin Journey',
        primary: true,
        action: () => startNewGame()
      }
    ];
  }
});

const restartGameModalActions = [
  {
    label: 'Restart Current',
    primary: true,
    action: () => {
      showRestartDialog.value = false;
      restartCurrentGame();
    }
  },
  {
    label: 'Start New',
    action: () => {
      showRestartDialog.value = false;
      reshuffleGame();
    }
  },
  {
    label: 'Cancel',
    action: () => {
      showRestartDialog.value = false;
    }
  }
];

const tieModalActions = [
  {
    label: 'Try Again (Same Layout)',
    primary: true,
    action: () => {
      showTieModal.value = false;
      restartCurrentGame();
    }
  },
  {
    label: 'New Game (New Layout)',
    action: () => {
      showTieModal.value = false;
      startNewGame();
    }
  },
  {
    label: 'Cancel (Close and Undo)',
    action: () => {
      showTieModal.value = false;
      // User can now use the undo button to go back
    }
  }
];

const winModalActions = [
  {
    label: 'Start Journey Again',
    primary: true,
    action: () => {
      showWinModal.value = false;
      startNewGame();
    }
  }
];

// Game methods
function startNewGame() {
  showMainMenu.value = false;
  // Wait for next tick to ensure component is ready
  nextTick(() => {
    if (tileFieldRef.value) {
      tileFieldRef.value.initializeNewGame();
    }
  });
}

async function continueGame() {
  showMainMenu.value = false;
  await nextTick();
  await loadSavedGame();
}

async function loadSavedGame() {
  try {
    const savedGame = await storageService.get('currentGame', 1);
    if (savedGame && tileFieldRef.value) {
      // Load the saved game state
      await tileFieldRef.value.loadSavedGame(savedGame);
    }
  } catch (error) {
    console.error('Failed to load saved game:', error);
    // Fall back to new game if loading fails
    startNewGame();
  }
}


function restartCurrentGame() {
  // Emit event to TileField to regenerate with same layout
  if (tileFieldRef.value) {
    tileFieldRef.value.regenerateLayout();
  }
}

function reshuffleGame() {
  // Reshuffle tiles with animation
  if (tileFieldRef.value) {
    tileFieldRef.value.reshuffleWithAnimation();
  }
}

function onTileCollectionReady() {
  // Game is ready to play
}

function onTileCleared() {
  audioService.play('click');
  
  // Check game state
  if (gameStore.isGameComplete) {
    if (gameStore.tiles.filter(t => t.active).length === 0) {
      // Win
      showWinModal.value = true;
      audioService.play('win');
    } else {
      // No more moves
      showTieModal.value = true;
      audioService.play('lose');
    }
  }
}

function onClick() {
  audioService.play('click', 0);
}

function onUndo() {
  gameStore.undo();
  audioService.play('undo');
}

function onRedo() {
  gameStore.redo();
  audioService.play('redo');
}

function onRestartRequest() {
  showRestartDialog.value = true;
}

function onContinueGame() {
  gameStore.resumeGame();
}

// Keyboard shortcuts
function handleKeyPress(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'z':
        if (gameStore.canUndo) {
          onUndo();
        }
        break;
      case 'y':
        if (gameStore.canRedo) {
          onRedo();
        }
        break;
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyPress);
  
  // Preload critical font to prevent FOUC
  const fontPreloader = new FontFace('FreeSerifNF', 'url(/fonts/FreeSerifNF.ttf)');
  try {
    await fontPreloader.load();
    document.fonts.add(fontPreloader);
  } catch (error) {
    console.error('Failed to preload font:', error);
  }
  
  // Check for saved game
  try {
    const savedGame = await storageService.get('currentGame', 1);
    hasSavedGame.value = !!savedGame;
  } catch (error) {
    console.error('Failed to check for saved game:', error);
  }
  
  // Load sounds
  audioService.load({
    'click': ['/sounds/click1.wav', '/sounds/click2.wav'],
    'start': ['/sounds/ding.mp3'],
    'win': ['/sounds/win.wav'],
    'lose': ['/sounds/lose.wav'],
    'undo': ['/sounds/back.wav'],
    'redo': ['/sounds/blip.wav'],
    'hint': ['/sounds/question.wav'],
    'bonus': ['/sounds/bonus.wav'],
    'coin': ['/sounds/coin1.wav', '/sounds/coin2.wav', '/sounds/coin3.wav']
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.game-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: url('/img/backgrounds/oriental-1.jpg') center/cover;
  position: relative;
}

.game-component {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.statusfield {
  flex: 0 0 auto;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px;
}

.gamefield {
  flex: 1 1 auto;
  position: relative;
  overflow: hidden;
}

.noselect {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.main-menu-content {
  width: 100%;
  padding: 20px 0;
  text-align: center;
  overflow: hidden;
  
  .title {
    font-size: clamp(2rem, 7vw, 4rem);
    background: linear-gradient(135deg, #FFD700, #FFE55A);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(255, 215, 0, 0.3);
    letter-spacing: 3px;
    margin: 20px 0;
    line-height: 1.2;
    position: relative;
    text-transform: uppercase;
    font-family: "Palatino", "Garamond", "Courier new";
    
    &::before {
      content: attr(data-text);
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: none;
      -webkit-text-fill-color: #8B4513;
      text-shadow: none;
      opacity: 0.3;
      transform: translate(2px, 2px);
      overflow: hidden;
    }
  }
  
  .subtitle {
    font-family: "Palatino", "Garamond", serif;
    font-size: clamp(1rem, 3vw, 1.5rem);
    color: #FFE5B4;
    text-align: center;
    margin: 10px 0 30px 0;
    letter-spacing: 2px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    font-style: italic;
  }
  
  .decorative-border {
    width: 80%;
    height: 3px;
    margin: 0 auto;
    background: linear-gradient(90deg, 
      transparent, 
      #FFD700 20%, 
      #FFD700 80%, 
      transparent
    );
    position: relative;
    
    &::before,
    &::after {
      content: '◆';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: #FFD700;
      font-size: 16px;
      text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
    }
    
    &::before {
      left: 15%;
    }
    
    &::after {
      right: 15%;
    }
    
    &.top {
      margin-bottom: 20px;
    }
    
    &.bottom {
      margin-top: 20px;
    }
  }
}
</style>
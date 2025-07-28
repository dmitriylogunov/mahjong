<template>
  <div class="game-view">
    <!-- Main Menu Modal -->
    <AppModal v-if="showMainMenu" :actions="mainMenuModalActions">
      <div class="main-menu-content">
        <div class="decorative-border top"></div>
        <h1 class="title" data-text="Mahjong Solitaire">Mahjong<br/>Solitaire</h1>
        <div class="subtitle">Ancient Game of Tiles</div>
        <div class="decorative-border bottom"></div>
      </div>
    </AppModal>

    <!-- Restart Dialog -->
    <AppModal v-if="showRestartDialog" :actions="restartGameModalActions">
      <h1>Choose restart option:</h1>
      <p>Restart Current - Play the same layout again</p>
      <p>Reshuffle - Generate a new random layout</p>
    </AppModal>

    <!-- No More Moves Modal -->
    <AppModal v-if="showTieModal" :actions="tieModalActions">
      There are no more free tiles left. From here you can:
      <ul>
        <li>Continue playing, undo the latest moves and try a different strategy</li>
        <li>Replay the game with same layout</li>
        <li>Restart the game with different layout</li>
      </ul>
    </AppModal>

    <!-- Win Modal -->
    <AppModal v-if="showWinModal" :actions="winModalActions">
      <h1>Congratulations, you won!</h1>
      <p>Your score is {{ gameStore.score }}.</p>
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
import { ref, onMounted, onUnmounted } from 'vue';
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
const mainMenuModalActions = [
  {
    label: 'Begin Journey',
    primary: true,
    action: () => startNewGame()
  },
  {
    label: 'Continue Game',
    action: () => continueGame(),
    visible: () => hasSavedGame.value
  }
];

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
    label: 'Reshuffle',
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
    label: 'Restart',
    action: () => {
      showTieModal.value = false;
      replayGame();
    }
  },
  {
    label: 'New game',
    primary: true,
    action: () => {
      showTieModal.value = false;
      startNewGame();
    }
  }
];

const winModalActions = [
  {
    label: 'New Game',
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
  // Initialize new game will be handled by TileField component
}

function continueGame() {
  showMainMenu.value = false;
  // TODO: Load saved game from IndexedDB
  loadSavedGame();
}

function loadSavedGame() {
  // TODO: Implement loading saved game state
  console.log('Loading saved game...');
}

function replayGame() {
  // TODO: Replay with same layout
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
  
  // Check for saved game
  try {
    const savedGames = await storageService.getAll('gameStates');
    hasSavedGame.value = savedGames.some(game => !game.completed);
  } catch (error) {
    console.error('Failed to check for saved games:', error);
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
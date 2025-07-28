<template>
  <div v-if="isVisible" class="status noselect">
    <div class="status-bar">
      <!-- left side block -->
      <div class="left-block">
        <span 
          @click="onHintClick" 
          class="hint" 
          :class="{ active: hintCurrentlyShowing }"
        >
          <i class="fa fa-diamond" aria-hidden="true"></i>&nbsp;Hint
        </span>

        <span 
          class="undo" 
          @click="onUndoClick" 
          :class="{ disabled: !gameStore.canUndo }"
        >
          <i class="fa fa-undo" aria-hidden="true"></i>
        </span>
        <span 
          class="redo" 
          @click="onRedoClick" 
          :class="{ disabled: !gameStore.canRedo }"
        >
          <i class="fa fa-repeat" aria-hidden="true"></i>
        </span>
      </div>

      <!-- middle block -->
      <div class="middle-block">
        <span class="score highlight">
          Score:&nbsp;{{ score > 0 ? score : 0 }}
        </span>

        <span class="timer">
          <i class="fa fa-clock-o" aria-hidden="true"></i> 
          <span class="highlight">{{ formattedTime }}</span>
        </span>
      </div>

      <!-- right side block -->
      <div class="right-block">
        <span class="sound highlight" @click="onSoundClick">
          <i v-if="gameStore.soundEnabled" class="fa fa-volume-up" aria-hidden="true"></i>
          <i v-else class="fa fa-volume-off" aria-hidden="true"></i>
        </span>

        <span class="pause highlight" @click="onPauseClick">
          <i v-if="gameStore.isPaused" class="fa fa-play-circle-o" aria-hidden="true"></i>
          <i v-else class="fa fa-pause-circle-o" aria-hidden="true"></i>
        </span>

        <span class="restart highlight" @click="$emit('restart')">
          <i class="fa fa-close" aria-hidden="true"></i>
        </span>
      </div>
    </div>

    <div class="debug-block" v-if="showDebugFields">
      <span class="highlight" @click="onStepClick">
        Click to make one step: <i class="fa fa-play-circle-o" aria-hidden="true"></i>
      </span>
      <br/>
      <span class="highlight" @click="onSolveClick">
        Click to solve: <i class="fa fa-play-circle-o" aria-hidden="true"></i>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '@/stores/game.store';

const props = defineProps<{
  hintsCount: number;
  score: number;
  timer: number;
  showDebugFields: boolean;
}>();

const emit = defineEmits<{
  undo: [];
  redo: [];
  restart: [];
}>();

const gameStore = useGameStore();

const isVisible = ref(true);
const hintCurrentlyShowing = computed(() => gameStore.showHint);

const formattedTime = computed(() => {
  const minutes = Math.floor(props.timer / 60);
  const seconds = props.timer % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

function onHintClick() {
  gameStore.requestHint();
}

function onUndoClick() {
  if (gameStore.canUndo) {
    emit('undo');
  }
}

function onRedoClick() {
  if (gameStore.canRedo) {
    emit('redo');
  }
}

function onSoundClick() {
  gameStore.toggleSound();
}

function onPauseClick() {
  if (gameStore.isPaused) {
    gameStore.resumeGame();
  } else {
    gameStore.pauseGame();
  }
}

function onStepClick() {
  // Debug functionality
  console.log('Step clicked');
}

function onSolveClick() {
  // Debug functionality
  console.log('Solve clicked');
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.status {
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: $text-color;
  font-size: 16px;
  
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    
    @media (max-width: $breakpoint-mobile) {
      flex-wrap: wrap;
      gap: 10px;
    }
  }
  
  .left-block,
  .middle-block,
  .right-block {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .middle-block {
    @media (max-width: $breakpoint-mobile) {
      order: -1;
      width: 100%;
      justify-content: center;
    }
  }
  
  span {
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(.disabled) {
      color: $primary-color;
      transform: scale(1.1);
    }
    
    &.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
  
  .hint {
    padding: 5px 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    
    &.active {
      border-color: $secondary-color;
      color: $secondary-color;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
      background: rgba(255, 215, 0, 0.1);
      
      i {
        animation: pulse 1s ease-in-out infinite;
      }
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
  
  .highlight {
    color: $text-color;
    font-weight: bold;
  }
  
  .score {
    font-size: 1.2em;
  }
  
  .timer {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  i {
    font-size: 1.2em;
  }
  
  .debug-block {
    padding: 10px 20px;
    background: rgba(255, 0, 0, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.noselect {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
<template>
  <div 
    class="tile-field-outer"
    :style="{
      paddingLeft: `${paddingLeft}px`,
      paddingRight: `${paddingRight}px`,
      paddingTop: `${paddingTop}px`,
      paddingBottom: `${paddingBottom}px`
    }"
  >
    <div v-if="paused" class="paused">
      Game paused !!
    </div>
    <div 
      v-if="tilesReady && !paused && isVisible"
      class="tile-field"
      :class="{ 'shake shake-horizontal shake-little shake-constant': shakeField }"
      :style="{
        width: `${windowWidth}px`,
        height: `${windowHeight}px`
      }"
      @click="onFieldClick"
    >
      <TileComponent
        v-for="(tile, index) in tiles"
        :key="`tile-${index}`"
        :x="tile.x"
        :y="tile.y"
        :z="tile.z"
        :element-pixel-width="elementPixelWidth"
        :element-pixel-height="elementPixelHeight"
        :active="tile.active"
        :selected="tile.selected"
        :type="tile.type"
        :is-free="tile.isFree()"
        :show-hints="showHints"
        :has-free-pair="tile.hasFreePair"
        @tile-clicked="onTileClick(tile)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from '@/stores/game.store';
import { MjTile, MjTileType } from '@/models/tile.model';
import TileComponent from './TileComponent.vue';
import { dragonLayout } from '@/data/layouts';
import { audioService } from '@/services/audio.service';

const props = defineProps<{
  layout: string;
  paused: boolean;
}>();

const emit = defineEmits<{
  ready: [];
  tileCleared: [];
  click: [];
}>();

const gameStore = useGameStore();

// Component state
const tiles = shallowRef<MjTile[]>([]);
const tilesReady = ref(false);
const isVisible = ref(true);
const shakeField = ref(false);
const showHints = ref(false);

// Field dimensions
const elementPixelWidth = ref(40);
const elementPixelHeight = ref(50);
const windowWidth = ref(800);
const windowHeight = ref(600);
const paddingLeft = ref(0);
const paddingRight = ref(0);
const paddingTop = ref(0);
const paddingBottom = ref(0);

// Field size in tiles
const fieldWidth = ref(0);
const fieldHeight = ref(0);

// Tile type descriptor
const tileSetDescriptor = [
  { group: "ball", index: [0,1,2,3,4,5,6,7,8], count: 4, matchAny: false },
  { group: "bam", index: [0,1,2,3,4,5,6,7,8], count: 4, matchAny: false },
  { group: "num", index: [0,1,2,3,4,5,6,7,8], count: 4, matchAny: false },
  { group: "season", index: [0,1,2,3], count: 1, matchAny: true },
  { group: "wind", index: [0,1,2,3], count: 4, matchAny: false },
  { group: "flower", index: [0,1,2,3], count: 1, matchAny: true },
  { group: "dragon", index: [0,1,2], count: 4, matchAny: false }
];

// Initialize component
onMounted(() => {
  window.addEventListener('resize', handleResize);
  initializeGame();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Watch for layout changes
watch(() => props.layout, () => {
  initializeGame();
});

function initializeGame() {
  initTiles();
  buildTileRelationsGraph();
  shuffleTypesFisherYates();
  updateFreePairs();
  
  // Calculate dimensions
  setTimeout(() => {
    retrieveDimensionsFromElement();
    tilesReady.value = true;
    
    // Initialize game store with shallow copy
    gameStore.initializeGame(props.layout, [...tiles.value]);
    
    emit('ready');
  }, 100);
}

function initTiles() {
  const newTiles: MjTile[] = [];
  
  // Get layout data
  const layoutData = getLayoutData(props.layout);
  
  // Create tiles from layout
  for (const [x, y] of layoutData) {
    const tile = new MjTile(x, y, newTiles);
    newTiles.push(tile);
  }
  
  // Sort tiles by rendering order
  newTiles.sort((a, b) => a.sortingOrder - b.sortingOrder);
  
  // Calculate field dimensions
  let maxX = 0, maxY = 0;
  for (const tile of newTiles) {
    maxX = Math.max(maxX, tile.x + tile.tileSizeX);
    maxY = Math.max(maxY, tile.y + tile.tileSizeY);
  }
  fieldWidth.value = maxX;
  fieldHeight.value = maxY;
  
  // Assign all at once
  tiles.value = newTiles;
}

function getLayoutData(_layoutName: string): number[][] {
  // For now, only dragon layout is supported
  return dragonLayout;
}

function buildTileRelationsGraph() {
  for (let i = 0; i < tiles.value.length; i++) {
    for (let j = i + 1; j < tiles.value.length; j++) {
      tiles.value[i].checkRelativePositions(tiles.value[j]);
      tiles.value[j].checkRelativePositions(tiles.value[i]);
    }
  }
}

function setTileTypes() {
  let counter = 0;
  
  for (const descriptor of tileSetDescriptor) {
    for (const index of descriptor.index) {
      for (let c = 0; c < descriptor.count; c++) {
        const type = new MjTileType(descriptor.group, index, descriptor.matchAny);
        tiles.value[counter].setType(type);
        counter++;
      }
    }
  }
}

function shuffleTypesFisherYates() {
  // First set types in order
  setTileTypes();
  
  // Then shuffle using Fisher-Yates
  const n = tiles.value.length;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap types
    const tempType = tiles.value[i].type;
    tiles.value[i].type = tiles.value[j].type;
    tiles.value[j].type = tempType;
  }
}

function updateFreePairs() {
  // Reset all tiles
  for (const tile of tiles.value) {
    tile.hasFreePair = false;
  }
  
  // Find free tiles
  const freeTiles = tiles.value.filter((t: MjTile) => t.active && t.isFree());
  
  // Mark tiles that have matching pairs
  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (freeTiles[i].matches(freeTiles[j])) {
        freeTiles[i].hasFreePair = true;
        freeTiles[j].hasFreePair = true;
      }
    }
  }
}

function onTileClick(tile: MjTile) {
  if (!tile.isFree() || props.paused) {
    audioService.play('wrong');
    shakeField.value = true;
    setTimeout(() => {
      shakeField.value = false;
    }, 500);
    return;
  }
  
  gameStore.selectTile(tile);
  
  // Check if we need to update free pairs after a match
  const activeTiles = tiles.value.filter((t: MjTile) => t.active);
  if (activeTiles.length !== tiles.value.length) {
    updateFreePairs();
    emit('tileCleared');
  }
}

function onFieldClick() {
  emit('click');
}

function retrieveDimensionsFromElement() {
  const container = document.querySelector('.tile-field-outer');
  if (!container) return;
  
  const rect = container.getBoundingClientRect();
  const availableWidth = rect.width - 40; // Account for padding
  const availableHeight = rect.height - 40;
  
  // Calculate scale to fit field in available space
  const scaleX = availableWidth / (fieldWidth.value * 20);
  const scaleY = availableHeight / (fieldHeight.value * 25);
  const scale = Math.min(scaleX, scaleY, 1.5);
  
  elementPixelWidth.value = Math.floor(40 * scale);
  elementPixelHeight.value = Math.floor(50 * scale);
  
  windowWidth.value = fieldWidth.value * elementPixelWidth.value / 2;
  windowHeight.value = fieldHeight.value * elementPixelHeight.value / 2;
  
  // Center the field
  paddingLeft.value = Math.max(0, (availableWidth - windowWidth.value) / 2);
  paddingTop.value = Math.max(0, (availableHeight - windowHeight.value) / 2);
}

function handleResize() {
  retrieveDimensionsFromElement();
}

// Subscribe to hint requests
watch(() => gameStore.showHint, (value) => {
  showHints.value = value;
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.tile-field-outer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.paused {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3em;
  color: $text-color;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px 40px;
  border-radius: 10px;
  z-index: 1000;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.tile-field {
  position: relative;
  margin: 0 auto;
  
  &.shake {
    animation: shake 0.5s;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
</style>
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
        :chaos-offset-x="tile.chaosOffsetX"
        :chaos-offset-y="tile.chaosOffsetY"
        :chaos-rotation="tile.chaosRotation"
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
import { ref, shallowRef, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useGameStore } from '@/stores/game.store';
import { MjTile, MjTileType } from '@/models/tile.model';
import TileComponent from './TileComponent.vue';
import { turtleLayout, type TilePosition } from '@/data/layouts';
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

// Chaos level constants - controls how much randomness in tile placement
const CHAOS_LEVEL = 0.3; // 0 = perfect placement, 1 = maximum chaos
const MAX_POSITION_OFFSET = 4; // Maximum pixels of position offset
const MAX_ROTATION = 2; // Maximum degrees of rotation

// Tile type descriptor - matching original pre-Vue implementation
// Total: 144 tiles (36 ball + 36 bam + 36 num + 4 season + 16 wind + 4 flower + 12 dragon)
const tileSetDescriptor: [string, number, boolean][] = [
  ["ball", 9, false],
  ["ball", 9, false],
  ["ball", 9, false],
  ["ball", 9, false],
  ["bam", 9, false],
  ["bam", 9, false],
  ["bam", 9, false],
  ["bam", 9, false],
  ["num", 9, false],
  ["num", 9, false],
  ["num", 9, false],
  ["num", 9, false],
  ["season", 4, true],
  ["wind", 4, false],
  ["wind", 4, false],
  ["wind", 4, false],
  ["wind", 4, false],
  ["flower", 4, true],
  ["dragon", 3, false],
  ["dragon", 3, false],
  ["dragon", 3, false],
  ["dragon", 3, false],
];

// Initialize component
onMounted(() => {
  window.addEventListener('resize', handleResize);
  initializeGame();
  
  // Ensure dimensions are calculated after mount
  nextTick(() => {
    retrieveDimensionsFromElement();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
});

// Watch for layout changes
watch(() => props.layout, () => {
  initializeGame();
});

// Recalculate dimensions when game is unpaused
watch(() => props.paused, (isPaused) => {
  if (!isPaused) {
    requestAnimationFrame(() => {
      retrieveDimensionsFromElement();
    });
  }
});

function initializeGame() {
  initTiles();
  buildTileRelationsGraph();
  shuffleTypesFisherYates();
  updateFreePairs();
  
  // Calculate dimensions after DOM is ready
  requestAnimationFrame(() => {
    retrieveDimensionsFromElement();
    tilesReady.value = true;
    
    // Initialize game store with shallow copy
    gameStore.initializeGame(props.layout, [...tiles.value]);
    
    emit('ready');
  });
}

function initTiles() {
  const newTiles: MjTile[] = [];
  
  // Get layout data
  const layoutData = getLayoutData(props.layout);
  
  // Create tiles from layout
  for (const position of layoutData) {
    const tile = new MjTile(position.x, position.y, newTiles);
    
    // Add chaos to tile placement
    if (CHAOS_LEVEL > 0) {
      // Random position offsets
      tile.chaosOffsetX = (Math.random() - 0.5) * 2 * MAX_POSITION_OFFSET * CHAOS_LEVEL;
      tile.chaosOffsetY = (Math.random() - 0.5) * 2 * MAX_POSITION_OFFSET * CHAOS_LEVEL;
      
      // Random rotation
      tile.chaosRotation = (Math.random() - 0.5) * 2 * MAX_ROTATION * CHAOS_LEVEL;
    }
    
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

function getLayoutData(_layoutName: string): TilePosition[] {
  // For now, only turtle layout is supported
  return turtleLayout.positions;
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
  
  for (const [group, count, matchAny] of tileSetDescriptor) {
    for (let index = 0; index < count; index++) {
      const type = new MjTileType(group, index, matchAny);
      tiles.value[counter].setType(type);
      counter++;
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
  const availableWidth = rect.width;
  const availableHeight = rect.height;
  
  // Constants for tile proportions - matching original implementation
  const elementProportionMin = 0.7;
  const elementProportionMax = 0.8;
  const shiftProportion = 0.14; // Same as in TileComponent
  
  // Fixed gap on all sides
  const fixedGap = 15;
  
  // Calculate initial element size to determine 3D offset needs
  const roughElementWidth = Math.floor((availableWidth - fixedGap * 2) / fieldWidth.value);
  const roughElementHeight = Math.floor((availableHeight - fixedGap * 2) / fieldHeight.value);
  const roughElementSize = Math.min(roughElementWidth, roughElementHeight);
  
  // Calculate maximum 3D offset for the highest layer
  const maxZLayers = 4; // Highest z-index in the layout
  const shiftY = Math.floor(roughElementSize * shiftProportion);
  const maxTopOffset = maxZLayers * shiftY;
  
  // Adjust available space: fixed gaps plus extra top space for 3D offset
  const adjustedWidth = availableWidth - (fixedGap * 2);
  const adjustedHeight = availableHeight - (fixedGap * 2) - maxTopOffset;
  
  // Calculate element size to fit the adjusted space
  elementPixelWidth.value = Math.floor(adjustedWidth / fieldWidth.value);
  elementPixelHeight.value = Math.floor(adjustedHeight / fieldHeight.value);
  
  // Check element proportion and adjust if needed to avoid distortion
  const currentProportion = elementPixelWidth.value / elementPixelHeight.value;
  
  // Too much "Portrait" - tiles too narrow
  if (currentProportion < elementProportionMin) {
    elementPixelHeight.value = Math.floor(elementPixelWidth.value / elementProportionMin);
  }
  
  // Too much "Landscape" - tiles too wide
  if (currentProportion > elementProportionMax) {
    elementPixelWidth.value = Math.floor(elementPixelHeight.value * elementProportionMax);
  }
  
  // Calculate actual field dimensions in pixels
  windowWidth.value = elementPixelWidth.value * fieldWidth.value;
  windowHeight.value = elementPixelHeight.value * fieldHeight.value;
  
  // Calculate padding to center the field with fixed gaps
  const totalPaddingX = availableWidth - windowWidth.value;
  paddingLeft.value = Math.floor(totalPaddingX / 2);
  paddingRight.value = totalPaddingX - paddingLeft.value;
  
  // For vertical padding, add extra space at top for 3D offset
  const totalPaddingY = availableHeight - windowHeight.value;
  paddingTop.value = Math.floor((totalPaddingY + maxTopOffset) / 2);
  paddingBottom.value = totalPaddingY - paddingTop.value;
}

let resizeTimeout: number | null = null;

function handleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = window.setTimeout(() => {
    retrieveDimensionsFromElement();
  }, 100);
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
  min-height: 400px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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
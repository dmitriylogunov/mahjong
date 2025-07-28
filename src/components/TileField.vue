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
      :style="{
        width: `${windowWidth}px`,
        height: `${windowHeight}px`
      }"
      @click="onFieldClick"
    >
      <!-- Render all tile parts as siblings for proper z-index layering -->
      <template v-for="(tile, index) in sortedTiles" :key="`tile-${index}`">
        <!-- Tile bottom -->
        <div
          v-if="tile.type && (tile.active || tile.selected || isFloatingTile(tile))"
          class="tile-bottom"
          :style="getTileBottomStyle(tile)"
        ></div>
      </template>
      
      <template v-for="(tile, index) in sortedTiles" :key="`tile-${index}`">
        <!-- Tile bottom side -->
        <div
          v-if="tile.type && (tile.active || tile.selected || isFloatingTile(tile))"
          class="tile-side-bottom"
          :style="getTileSideBottomStyle(tile)"
        ></div>
      </template>
      
      <template v-for="(tile, index) in sortedTiles" :key="`tile-${index}`">
        <!-- Tile left side -->
        <div
          v-if="tile.type && (tile.active || tile.selected || isFloatingTile(tile))"
          class="tile-side-left"
          :style="getTileSideLeftStyle(tile)"
        ></div>
      </template>
      
      <template v-for="(tile, index) in sortedTiles" :key="`tile-${index}`">
        <!-- Tile face -->
        <div
          v-if="tile.type && (tile.active || tile.selected || isFloatingTile(tile))"
          class="tile"
          :class="getTileClasses(tile)"
          :style="getTileStyle(tile)"
          @click.stop="onTileClick(tile)"
        >
          <!-- Edge gradient overlays -->
          <div class="tile-edge-gradient-h"></div>
          <div class="tile-edge-gradient-v"></div>
          
          <div class="tile-content">
            <div 
              class="secondary-character"
              :style="{
                fontSize: `${fontSizeSecondary}px`,
                lineHeight: `${fontSizeSecondary - 5}px`
              }"
            >
              {{ tile.type.getSecondaryCharacter() }}
            </div>

            <div 
              class="primary-character-wrap"
              :style="{
                ...(tile.type.group === 'dragon' && tile.type.getPrimaryCharacter() === '龙' ? {
                  paddingRight: `${fontSizePrimary * 0.075}px`
                } : {})
              }"
            >
              <span 
                class="primary-character"
                :style="{
                  fontSize: `${tile.type.group === 'dragon' && tile.type.getPrimaryCharacter() === '龙' ? fontSizePrimary / 2 : fontSizePrimary}px`,
                  lineHeight: `${tile.type.group === 'dragon' && tile.type.getPrimaryCharacter() === '龙' ? fontSizePrimary / 2 : fontSizePrimary}px`
                }"
                v-html="tile.type.getPrimaryCharacter()"
              ></span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { useGameStore } from '@/stores/game.store';
import { MjTile, MjTileType } from '@/models/tile.model';
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
const showHints = ref(false);

// Mouse tracking for floating tile
const mouseX = ref(0);
const mouseY = ref(0);
const floatingTile = ref<MjTile | null>(null);

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

// Constants for tile proportions
const shiftProportion = 0.14;
const depthProportion = 0.15;

// Computed values for tile dimensions
const shiftX = computed(() => Math.floor(elementPixelWidth.value * shiftProportion));
const shiftY = computed(() => Math.floor(elementPixelHeight.value * shiftProportion));
const depthSize = computed(() => Math.max(8, Math.floor(Math.min(elementPixelWidth.value, elementPixelHeight.value) * depthProportion)));

// Font size calculations
const fontSizePrimary = computed(() => {
  const adjustedElementSize = Math.min(
    elementPixelHeight.value,
    elementPixelWidth.value * 1.5
  );
  return Math.floor(adjustedElementSize * 1.5);
});

const fontSizeSecondary = computed(() => {
  const adjustedElementSize = Math.min(
    elementPixelHeight.value,
    elementPixelWidth.value * 1.5
  );
  return Math.floor(adjustedElementSize / 3);
});

// Sorted tiles for rendering order
const sortedTiles = computed(() => [...tiles.value].sort((a, b) => a.sortingOrder - b.sortingOrder));

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
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('keydown', handleKeyDown);
  initializeGame();
  
  // Ensure dimensions are calculated after mount
  nextTick(() => {
    retrieveDimensionsFromElement();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('keydown', handleKeyDown);
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
    // Return floating tile if clicking on a locked tile
    if (floatingTile.value) {
      returnFloatingTile();
    }
    return;
  }
  
  // If we have a floating tile, check if it matches the clicked tile
  if (floatingTile.value) {
    if (floatingTile.value.matches(tile)) {
      // Match found - remove both tiles
      console.log(`Tile matched and removed: ${floatingTile.value.type?.group} ${floatingTile.value.type?.value} with ${tile.type?.group} ${tile.type?.value} at (${tile.x}, ${tile.y}, ${tile.z})`);
      gameStore.selectTile(tile);
      floatingTile.value = null;
      
      // Check if we need to update free pairs after a match
      const activeTiles = tiles.value.filter((t: MjTile) => t.active);
      if (activeTiles.length !== tiles.value.length) {
        updateFreePairs();
        emit('tileCleared');
      }
    } else {
      // No match - return floating tile and select new one
      returnFloatingTile();
      tile.selected = true;
      floatingTile.value = tile;
      console.log(`Tile selected: ${tile.type?.group} ${tile.type?.value} at (${tile.x}, ${tile.y}, ${tile.z})`);
      gameStore.setSelectedTile(tile);
    }
  } else {
    // No floating tile - make this tile float
    tile.selected = true;
    floatingTile.value = tile;
    console.log(`Tile selected: ${tile.type?.group} ${tile.type?.value} at (${tile.x}, ${tile.y}, ${tile.z})`);
    gameStore.setSelectedTile(tile);
  }
}

function onFieldClick() {
  // Return floating tile if clicking on the field
  if (floatingTile.value) {
    returnFloatingTile();
  }
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

function handleMouseMove(event: MouseEvent) {
  mouseX.value = event.clientX;
  mouseY.value = event.clientY;
}

function handleKeyDown(event: KeyboardEvent) {
  // Return floating tile on ESC key
  if (floatingTile.value && event.key === 'Escape') {
    returnFloatingTile();
  }
}

function returnFloatingTile() {
  if (floatingTile.value) {
    console.log(`Tile unselected: ${floatingTile.value.type?.group} ${floatingTile.value.type?.value} at (${floatingTile.value.x}, ${floatingTile.value.y}, ${floatingTile.value.z})`);
    floatingTile.value.selected = false;
    floatingTile.value = null;
    gameStore.clearSelection();
  }
}

// Subscribe to hint requests
watch(() => gameStore.showHint, (value) => {
  showHints.value = value;
});

// Helper functions for tile rendering
function isFloatingTile(tile: MjTile): boolean {
  return !!floatingTile.value && floatingTile.value.x === tile.x && floatingTile.value.y === tile.y && floatingTile.value.z === tile.z;
}

function getTilePosition(tile: MjTile) {
  if (isFloatingTile(tile)) {
    return {
      left: `${mouseX.value + 10}px`,
      top: `${mouseY.value - elementPixelHeight.value * 2 - 10}px`,
      position: 'fixed' as const
    };
  } else {
    return {
      left: `${tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX}px`,
      top: `${tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY}px`,
      position: 'absolute' as const
    };
  }
}

function getTileBottomStyle(tile: MjTile) {
  const pos = getTilePosition(tile);
  const baseTop = pos.position === 'fixed' ? parseInt(pos.top) : tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY;
  const baseLeft = pos.position === 'fixed' ? parseInt(pos.left) : tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX;
  
  const topOffset = tile.selected && !isFloatingTile(tile) ? -8 : 0;
  
  return {
    ...pos,
    top: `${baseTop - shiftX.value * 2 + depthSize.value + topOffset}px`,
    left: `${baseLeft + shiftY.value * 2 - depthSize.value}px`,
    width: `${elementPixelWidth.value * 2 - 4}px`,
    height: `${elementPixelHeight.value * 2 - 4}px`,
    zIndex: tile.selected ? 9997 : (tile.z * 1000 + 0),
    transform: isFloatingTile(tile) 
      ? 'rotate3d(0, 0, 1, 0deg) scale3d(1.1, 1.1, 1)' 
      : `rotate3d(0, 0, 1, ${tile.chaosRotation}deg) translateZ(0)`,
    '--depth-size': `${depthSize.value}px`
  };
}

function getTileSideBottomStyle(tile: MjTile) {
  const pos = getTilePosition(tile);
  const baseTop = pos.position === 'fixed' ? parseInt(pos.top) : tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY;
  const baseLeft = pos.position === 'fixed' ? parseInt(pos.left) : tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX;
  
  const topOffset = tile.selected && !isFloatingTile(tile) ? -8 : 0;
  
  return {
    position: pos.position,
    top: `${baseTop - shiftX.value * 2 + elementPixelHeight.value * 2 - 4 + topOffset}px`,
    left: `${baseLeft + shiftY.value * 2 + depthSize.value * 0.7}px`,
    width: `${elementPixelWidth.value * 2 - 4 - depthSize.value * 0.7}px`,
    height: `${depthSize.value}px`,
    zIndex: tile.selected ? 9998 : (tile.z * 1000 + 1),
    transform: `skewX(-45deg) translateX(${-depthSize.value * 0.3}px) translateZ(0) ${isFloatingTile(tile) ? 'scale3d(1.1, 1.1, 1)' : ''}`,
    transformOrigin: 'top left',
    '--depth-size': `${depthSize.value}px`
  };
}

function getTileSideLeftStyle(tile: MjTile) {
  const pos = getTilePosition(tile);
  const baseTop = pos.position === 'fixed' ? parseInt(pos.top) : tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY;
  const baseLeft = pos.position === 'fixed' ? parseInt(pos.left) : tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX;
  
  const topOffset = tile.selected && !isFloatingTile(tile) ? -8 : 0;
  const tileTop = baseTop - shiftX.value * 2 + topOffset;
  const tileLeft = baseLeft + shiftY.value * 2;
  const tileWidth = elementPixelWidth.value * 2 - 4;
  const tileHeight = elementPixelHeight.value * 2 - 4;
  
  return {
    position: pos.position,
    top: `${tileTop + tileHeight * 0.11 + 1}px`,
    left: `${tileLeft - depthSize.value}px`,
    width: `${depthSize.value}px`,
    height: `${tileHeight * 0.89}px`,
    zIndex: tile.selected ? 9999 : (tile.z * 1000 + 2),
    transform: `skewY(-45deg) translateZ(0) ${isFloatingTile(tile) ? 'scale3d(1.1, 1.1, 1)' : ''}`,
    transformOrigin: 'top left',
    '--depth-size': `${depthSize.value}px`
  };
}

function getTileStyle(tile: MjTile) {
  const pos = getTilePosition(tile);
  const baseTop = pos.position === 'fixed' ? parseInt(pos.top) : tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY;
  const baseLeft = pos.position === 'fixed' ? parseInt(pos.left) : tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX;
  
  return {
    position: pos.position,
    top: `${baseTop - shiftX.value * 2}px`,
    left: `${baseLeft + shiftY.value * 2}px`,
    width: `${elementPixelWidth.value * 2 - 4}px`,
    height: `${elementPixelHeight.value * 2 - 4}px`,
    color: tile.selected ? '#5C5749' : tile.type?.getColor(),
    textShadow: `0 0 ${Math.floor(elementPixelWidth.value * 0.8)}px ${tile.type?.getColor()}`,
    zIndex: tile.selected ? 10000 : (tile.z * 1000 + 3),
    transform: isFloatingTile(tile) 
      ? 'rotate3d(0, 0, 1, 0deg) scale3d(1.1, 1.1, 1)' 
      : tile.selected 
        ? `translateY(-8px) rotate3d(0, 0, 1, ${tile.chaosRotation}deg) translateZ(0)`
        : `rotate3d(0, 0, 1, ${tile.chaosRotation}deg) translateZ(0)`,
    '--depth-size': `${depthSize.value}px`
  };
}

function getTileClasses(tile: MjTile) {
  return {
    selected: tile.selected,
    layer0: tile.z === 0,
    layer1: tile.z === 1,
    layer2: tile.z === 2,
    layer3: tile.z === 3,
    layer4: tile.z === 4,
    layer5: tile.z >= 5,
    free: tile.isFree() && !tile.selected,
    locked: !tile.isFree() && tile.active,
    floating: isFloatingTile(tile),
    'shake shake-rotate shake-constant shake-slow shake-little': tile.hasFreePair && showHints.value
  };
}
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
  transform-style: preserve-3d;
  transform: perspective(1200px) rotateX(3deg);
  isolation: isolate;
}

// Tile styles moved from TileComponent
.tile-bottom {
  position: absolute;
  border-radius: 10%;
  background: linear-gradient(145deg, #B5A57C 0%, #A59572 40%, #958568 100%);
  box-shadow: 
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.2);
  transform-origin: center center;
  transition: transform 0.2s ease-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10%;
    background: linear-gradient(135deg, 
      transparent 0%, 
      transparent 40%, 
      rgba(0, 0, 0, 0.1) 50%, 
      rgba(0, 0, 0, 0.2) 100%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 40%;
    height: 40%;
    background: radial-gradient(ellipse at bottom right, 
      rgba(0, 0, 0, 0.2) 0%, 
      transparent 70%);
    border-radius: 10%;
    pointer-events: none;
  }
}

.tile-side-bottom {
  position: absolute;
  background: linear-gradient(to bottom, 
    #D9C89E 0%, 
    #C5B58C 30%, 
    #B5A57C 60%, 
    #A59572 100%);
  /* transform applied inline */
  border-radius: 0 2px 2px 2px;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease-out;
  pointer-events: none;
}

.tile-side-left {
  position: absolute;
  background: linear-gradient(to right, 
    #A59572 0%, 
    #B5A57C 40%, 
    #C5B58C 70%, 
    #D9C89E 100%);
  /* transform applied inline */
  border-radius: 2px 0 0 2px;
  box-shadow: 
    -1px 0 3px rgba(0, 0, 0, 0.3),
    inset 2px 0 2px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease-out;
  pointer-events: none;
}

.tile {
  font-family: FreeSerifNF;
  overflow: visible;
  transform-origin: 50% 50%;
  position: absolute;
  border-radius: 10%;
  cursor: default;
  background: linear-gradient(145deg, #FFF5D4 0%, #FEF2C7 40%, #F5E6B8 100%);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease-out;
  will-change: transform, filter;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;

  &.free {
    cursor: pointer;
    transition: transform 0.15s ease-out;

    &:hover {
      filter: brightness(1.08);
      box-shadow: 
        0 8px 16px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }
  }

  &.floating {
    cursor: grabbing;
    pointer-events: none;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
    transition: none !important;
    
    box-shadow: 
      0 12px 24px rgba(0, 0, 0, 0.3),
      0 6px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  &.locked {
    cursor: not-allowed;
    opacity: 0.95;
    
    &:hover {
      filter: brightness(0.95);
    }
  }

  &.layer0 {
    background: linear-gradient(145deg, #FFF5D4 0%, #FEF2C7 40%, #F5E6B8 100%);
  }

  &.layer1 {
    background: linear-gradient(145deg, #D5EED6 0%, #BEDDBF 40%, #A5CCA6 100%);
  }

  &.layer2 {
    background: linear-gradient(145deg, #FFF0C4 0%, #FFE1A2 40%, #F5D08A 100%);
  }

  &.layer3 {
    background: linear-gradient(145deg, #FFF5D4 0%, #FEF2C7 40%, #F5E6B8 100%);
  }

  &.layer4 {
    background: linear-gradient(145deg, #FFF5D4 0%, #FEF2C7 40%, #F5E6B8 100%);
  }

  &.layer5 {
    background: linear-gradient(145deg, #FFB885 0%, #FEAA6E 40%, #F59956 100%);
  }

  &.selected {
    background: linear-gradient(145deg, #FFB885 0%, #FEAA6E 40%, #F59956 100%);
    box-shadow: 
      0 12px 24px rgba(0, 0, 0, 0.3),
      0 6px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 -1px 0 rgba(0, 0, 0, 0.15),
      0 0 20px rgba(254, 170, 110, 0.4);
    transform: translateY(-8px) translateZ(0);
    filter: brightness(1.08);
    cursor: pointer;
    z-index: 10000 !important;
  }

  .tile-edge-gradient-h {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10%;
    background: linear-gradient(to right,
      rgba(181, 165, 124, 0.25) 0%,
      rgba(181, 165, 124, 0.12) 2%,
      transparent 8%,
      transparent 92%,
      rgba(181, 165, 124, 0.12) 98%,
      rgba(181, 165, 124, 0.25) 100%);
    pointer-events: none;
    cursor: inherit;
  }

  .tile-edge-gradient-v {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10%;
    background: linear-gradient(to bottom,
      rgba(181, 165, 124, 0.25) 0%,
      rgba(181, 165, 124, 0.12) 2%,
      transparent 8%,
      transparent 92%,
      rgba(181, 165, 124, 0.12) 98%,
      rgba(181, 165, 124, 0.25) 100%);
    pointer-events: none;
    cursor: inherit;
  }

  .tile-content {
    margin: 5px;
    padding: 0px;
    position: relative;
    display: flex;
    flex-direction: column;
    height: calc(100% - 10px);

    .secondary-character {
      filter: drop-shadow(0.5px 0.5px 0.5px rgba(0, 0, 0, 0.15));
      text-align: left;
    }

    .primary-character-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;

      .primary-character {
        filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.2));
      }
    }
  }
}
</style>
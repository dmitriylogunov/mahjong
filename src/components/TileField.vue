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
    <GameDialog 
      v-if="paused" 
      sub-text="Game Paused"
      button-text="Continue"
      @action="continueGame"
      @close="continueGame"
    />
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
          v-if="tile.type && (tile.active || tile.selected)"
          class="tile-bottom"
          :style="getTileBottomStyle(tile as MjTile)"
        ></div>
      </template>
      
      <template v-for="(tile, index) in sortedTiles" :key="`tile-${index}`">
        <!-- Tile bottom side -->
        <div
          v-if="tile.type && (tile.active || tile.selected)"
          class="tile-side-bottom"
          :style="getTileSideBottomStyle(tile as MjTile)"
        ></div>
      </template>
      
      <template v-for="(tile, index) in sortedTiles" :key="`tile-${index}`">
        <!-- Tile left side -->
        <div
          v-if="tile.type && (tile.active || tile.selected)"
          class="tile-side-left"
          :style="getTileSideLeftStyle(tile as MjTile)"
        ></div>
      </template>
      
      <template v-for="(tile, index) in sortedTiles" :key="`tile-${index}`">
        <!-- Tile face -->
        <div
          v-if="tile.type && (tile.active || tile.selected)"
          class="tile"
          :class="getTileClasses(tile as MjTile)"
          :style="getTileStyle(tile as MjTile)"
          @click.stop="onTileClick(tile as MjTile)"
          @touchstart="onTileTouchStart($event, tile as MjTile)"
          @touchend="onTileTouchEnd($event, tile as MjTile)"
          @touchcancel="onTileTouchCancel"
        >
          <!-- Mystical dragon spirit hint -->
          <div 
            v-if="tile.showHint && showHints"
            class="dragon-spirit-hint"
          >
            <!-- Dragon orb -->
            <div class="dragon-orb">
              <div class="orb-core"></div>
              <div class="orb-glow"></div>
            </div>
            
            <!-- Floating particles -->
            <div class="spirit-particles">
              <div class="particle" v-for="n in 6" :key="n" :style="`--particle-delay: ${n * 0.3}s`"></div>
            </div>
            
            <!-- Energy ribbons -->
            <div class="energy-ribbon ribbon-1"></div>
            <div class="energy-ribbon ribbon-2"></div>
          </div>
          
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
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { useGameStore } from '@/stores/game.store';
import { MjTile, MjTileType } from '@/models/tile.model';
import { turtleLayout, mobileTurtleLayout, type TilePosition } from '@/data/layouts';
import { audioService } from '@/services/audio.service';
import GameDialog from './GameDialog.vue';

const props = defineProps<{
  layout: string;
  paused: boolean;
}>();

const emit = defineEmits<{
  ready: [];
  tileCleared: [];
  click: [];
  continue: [];
}>();

const gameStore = useGameStore();

// Component state
const tiles = ref<MjTile[]>([]);
const tilesReady = ref(false);
const isVisible = ref(true);
const showHints = ref(false);
const savedTileTypes = ref<(MjTileType | null)[]>([]);
const savedChaosData = ref<{offsetX: number, offsetY: number, rotation: number}[]>([]);
const currentLayout = ref('');

// Selected tile tracking
const selectedTile = ref<MjTile | null>(null);

// Touch handling for mobile
const touchStartTile = ref<MjTile | null>(null);
const touchStartTime = ref<number>(0);

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

// Maximum field width to prevent tiles from becoming too large
const MAX_FIELD_WIDTH = 1280; // pixels

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
const sortedTiles = computed(() => ([...tiles.value] as MjTile[]).sort((a: MjTile, b: MjTile) => a.sortingOrder - b.sortingOrder));

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

// Mobile tile set descriptor - reduced set according to CLAUDE.md rules
// Total: 70 tiles
// Note: This descriptor is structured differently than desktop version
// For mobile, we need special handling for:
// - Seasons: 1 of each type (4 total)
// - Flowers: 1 of each type (4 total) 
// - Dragons: 2 pairs of each type (12 total)
// - Winds: 2 pairs of each type (16 total)
// - Numbers/Bamboos/Balls: only 1-4, with at least 1 pair each (34 total)
const mobileTileSetDescriptor = {
  seasons: { count: 4, matchAny: true },    // 1 of each season
  flowers: { count: 4, matchAny: true },    // 1 of each flower
  dragons: { count: 12, matchAny: false },  // 2 pairs of each dragon
  winds: { count: 16, matchAny: false },    // 2 pairs of each wind
  numbered: { count: 34, matchAny: false }  // nums, bams, balls 1-4
};

// Mobile detection utility
function isMobileScreen(): boolean {
  return window.innerWidth <= 768; // Mobile breakpoint
}

// Initialize component
onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyDown);
  
  // Only calculate dimensions, don't initialize game
  nextTick(() => {
    retrieveDimensionsFromElement();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
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
  currentLayout.value = props.layout;
  initTiles();
  buildTileRelationsGraph();
  shuffleTypesFisherYates();
  updateFreePairs();
  
  // Calculate dimensions after DOM is ready
  requestAnimationFrame(() => {
    retrieveDimensionsFromElement();
    tilesReady.value = true;
    
    // Initialize game store with shallow copy
    gameStore.initializeGame(props.layout, [...tiles.value] as MjTile[]);
    
    emit('ready');
  });
}

function initTiles(preserveChaos = false) {
  const newTiles: MjTile[] = [];
  
  // Get layout data
  const layoutData = getLayoutData(props.layout);
  
  // Create tiles from layout
  let tileIndex = 0;
  for (const position of layoutData) {
    const tile = new MjTile(position.x, position.y, newTiles);
    
    // Add chaos to tile placement
    if (CHAOS_LEVEL > 0) {
      if (preserveChaos && savedChaosData.value.length > tileIndex) {
        // Restore saved chaos values
        tile.chaosOffsetX = savedChaosData.value[tileIndex].offsetX;
        tile.chaosOffsetY = savedChaosData.value[tileIndex].offsetY;
        tile.chaosRotation = savedChaosData.value[tileIndex].rotation;
      } else {
        // Generate new random values
        tile.chaosOffsetX = (Math.random() - 0.5) * 2 * MAX_POSITION_OFFSET * CHAOS_LEVEL;
        tile.chaosOffsetY = (Math.random() - 0.5) * 2 * MAX_POSITION_OFFSET * CHAOS_LEVEL;
        tile.chaosRotation = (Math.random() - 0.5) * 2 * MAX_ROTATION * CHAOS_LEVEL;
      }
    }
    
    newTiles.push(tile);
    tileIndex++;
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

function getLayoutData(layoutName: string): TilePosition[] {
  // Check if we should use mobile layout
  if (isMobileScreen() && layoutName === 'default') {
    return mobileTurtleLayout.positions;
  }
  
  // For now, only turtle layout is supported for desktop
  return turtleLayout.positions;
}

function buildTileRelationsGraph() {
  const tilesArray = tiles.value as MjTile[];
  for (let i = 0; i < tilesArray.length; i++) {
    for (let j = i + 1; j < tilesArray.length; j++) {
      tilesArray[i].checkRelativePositions(tilesArray[j]);
      tilesArray[j].checkRelativePositions(tilesArray[i]);
    }
  }
}


function shuffleTypesFisherYates(useExistingTypes = false) {
  const tilesArray = tiles.value as MjTile[];
  
  if (useExistingTypes && savedTileTypes.value.length === tilesArray.length) {
    // Restore saved tile types
    for (let i = 0; i < tilesArray.length; i++) {
      const savedType = savedTileTypes.value[i];
      if (savedType) {
        // Create a new MjTileType instance to ensure proper type
        tilesArray[i].type = new MjTileType(savedType.group, savedType.index, savedType.matchAny);
      }
    }
  } else {
    // Use the solvable puzzle generation algorithm
    generateSolvablePuzzle();
    
    // Save the current arrangement
    savedTileTypes.value = tilesArray.map(tile => tile.type);
    // Save chaos data
    savedChaosData.value = tilesArray.map(tile => ({
      offsetX: tile.chaosOffsetX,
      offsetY: tile.chaosOffsetY,
      rotation: tile.chaosRotation
    }));
  }
}

// Generate a solvable puzzle using reverse placement
function generateSolvablePuzzle() {
  const tilesArray = tiles.value as MjTile[];
  const isMobile = isMobileScreen();
  
  // Create all tile types we need
  const allTypes: MjTileType[] = [];
  
  if (isMobile) {
    // Mobile version: 70 tiles total - use descriptor from CLAUDE.md rules
    const descriptor = mobileTileSetDescriptor;
    
    // Add exactly one of each season (4 tiles total) - these match any season
    for (let i = 0; i < descriptor.seasons.count; i++) {
      allTypes.push(new MjTileType("season", i, descriptor.seasons.matchAny));
    }
    
    // Add exactly one of each flower (4 tiles total) - these match any flower
    for (let i = 0; i < descriptor.flowers.count; i++) {
      allTypes.push(new MjTileType("flower", i, descriptor.flowers.matchAny));
    }
    
    // Add exactly 2 pairs of each dragon (12 tiles total)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) { // 4 tiles = 2 pairs
        allTypes.push(new MjTileType("dragon", i, descriptor.dragons.matchAny));
      }
    }
    
    // Add exactly 2 pairs of each wind (16 tiles total)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) { // 4 tiles = 2 pairs
        allTypes.push(new MjTileType("wind", i, descriptor.winds.matchAny));
      }
    }
    
    // Calculate remaining slots: 70 - 4 - 4 - 12 - 16 = 34 tiles
    // These should be nums, bams, balls (1-4 only) with exactly 2 pairs each
    // We need to distribute 34 tiles among nums, bams, balls (1-4)
    // That's 34/2 = 17 pairs to distribute among 12 possible types (3 suits * 4 numbers)
    
    // Start with at least 1 pair of each type (12 pairs = 24 tiles)
    for (let suit of ["num", "bam", "ball"]) {
      for (let i = 0; i < 4; i++) { // Only 1-4
        for (let j = 0; j < 2; j++) { // 1 pair = 2 tiles
          allTypes.push(new MjTileType(suit, i, descriptor.numbered.matchAny));
        }
      }
    }
    
    // Distribute remaining 10 tiles (5 pairs) evenly
    const remainingTiles = 10;
    for (let i = 0; i < remainingTiles; i++) {
      const suitChoice = i % 3;
      const suit = suitChoice === 0 ? "num" : suitChoice === 1 ? "bam" : "ball";
      const number = i % 4; // Only 1-4
      allTypes.push(new MjTileType(suit, number, descriptor.numbered.matchAny));
    }
  } else {
    // Desktop version: standard 144 tiles
    const descriptor = tileSetDescriptor;
    
    for (const [group, count, matchAny] of descriptor) {
      for (let index = 0; index < count; index++) {
        allTypes.push(new MjTileType(group, index, matchAny));
      }
    }
  }
  
  // Shuffle the tile types
  for (let i = allTypes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTypes[i], allTypes[j]] = [allTypes[j], allTypes[i]];
  }
  
  // Clear all tiles
  tilesArray.forEach(tile => {
    tile.type = null;
    tile.active = false; // Start with all tiles "removed"
  });
  
  // Build solution by placing pairs in reverse order
  const solutionOrder: MjTile[] = [];
  let typeIndex = 0;
  
  // Keep placing pairs until all tiles are placed
  while (solutionOrder.length < tilesArray.length && typeIndex < allTypes.length) {
    // Find all currently removable positions (free tiles if they were active)
    const removablePositions = tilesArray.filter(tile => 
      !tile.active && isPositionFree(tile, tilesArray)
    );
    
    if (removablePositions.length >= 2) {
      // Randomly select 2 positions from removable ones
      const shuffled = [...removablePositions].sort(() => Math.random() - 0.5);
      const tile1 = shuffled[0];
      const tile2 = shuffled[1];
      
      // Assign the same type to both
      tile1.type = allTypes[typeIndex];
      tile2.type = allTypes[typeIndex];
      tile1.active = true;
      tile2.active = true;
      
      // Add to solution order (these would be removed in this order)
      solutionOrder.push(tile1, tile2);
      typeIndex++;
    } else {
      // If we can't find 2 free positions, just place remaining tiles randomly
      const inactive = tilesArray.filter(t => !t.active);
      if (inactive.length >= 2) {
        inactive[0].type = allTypes[typeIndex];
        inactive[1].type = allTypes[typeIndex];
        inactive[0].active = true;
        inactive[1].active = true;
        solutionOrder.push(inactive[0], inactive[1]);
        typeIndex++;
      } else {
        break;
      }
    }
  }
  
  // Ensure all tiles are active at the end
  tilesArray.forEach(tile => tile.active = true);
}

// Check if a position would be free (for reverse placement)
function isPositionFree(tile: MjTile, allTiles: MjTile[]): boolean {
  // Check if any active tile blocks from above
  const blockedFromAbove = allTiles.some(other => 
    other.active && other !== tile &&
    other.z > tile.z &&
    tile.overlaps2d(other)
  );
  
  if (blockedFromAbove) return false;
  
  // Check horizontal blocking (both sides must be free)
  let leftBlocked = false;
  let rightBlocked = false;
  
  for (const other of allTiles) {
    if (!other.active || other === tile || other.z !== tile.z) continue;
    
    const [isLeftAdjacent, isRightAdjacent] = tile.isXAdjacentTo(other);
    if (isLeftAdjacent) leftBlocked = true;
    if (isRightAdjacent) rightBlocked = true;
  }
  
  // Tile is free if not blocked from above and at least one side is free
  return !(leftBlocked && rightBlocked);
}


function updateFreePairs() {
  // Reset all tiles
  for (const tile of tiles.value as MjTile[]) {
    tile.hasFreePair = false;
  }
  
  // Find free tiles
  const freeTiles = (tiles.value as MjTile[]).filter((t: MjTile) => t.active && t.isFree());
  
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
  // Dismiss hint if active
  if (gameStore.showHint) {
    gameStore.stopHint();
  }
  
  if (!tile.isFree() || props.paused) {
    audioService.play('wrong');
    // Don't unselect when clicking on a locked tile
    return;
  }
  
  // If we have a selected tile, check if it matches the clicked tile
  if (selectedTile.value) {
    // Check if clicking on the same tile - deselect it
    if (selectedTile.value === tile) {
      gameStore.selectTile(tile); // This will handle deselection
      returnSelectedTile();
      return;
    }
    
    if (selectedTile.value.matches(tile)) {
      // Match found - use the game store to properly handle the removal
      console.log(`Tile matched and removed: ${selectedTile.value.type?.group} ${selectedTile.value.type?.index} with ${tile.type?.group} ${tile.type?.index} at (${tile.x}, ${tile.y}, ${tile.z})`);
      
      // Use the game store's selectTile method to properly handle the match
      gameStore.selectTile(tile);
      
      // Clear local selection
      selectedTile.value = null;
      
      // Check if we need to update free pairs after a match
      updateFreePairs();
      emit('tileCleared');
    } else {
      // No match - return selected tile and select new one
      returnSelectedTile();
      console.log(`Tile selected: ${tile.type?.group} ${tile.type?.index} at (${tile.x}, ${tile.y}, ${tile.z})`);
      gameStore.selectTile(tile);
      tile.selected = true;
      selectedTile.value = tile;
    }
  } else {
    // No selected tile - use game store to select this tile
    console.log(`Tile selected: ${tile.type?.group} ${tile.type?.index} at (${tile.x}, ${tile.y}, ${tile.z})`);
    gameStore.selectTile(tile);
    tile.selected = true;
    selectedTile.value = tile;
  }
}

function onFieldClick() {
  // Dismiss hint if active
  if (gameStore.showHint) {
    gameStore.stopHint();
    return;
  }
  
  // Return selected tile if clicking on the field
  if (selectedTile.value) {
    returnSelectedTile();
  }
  emit('click');
}

function retrieveDimensionsFromElement() {
  const container = document.querySelector('.tile-field-outer');
  if (!container) return;
  
  const rect = container.getBoundingClientRect();
  let availableWidth = rect.width;
  const availableHeight = rect.height;
  
  // Apply maximum width constraint
  if (availableWidth > MAX_FIELD_WIDTH) {
    availableWidth = MAX_FIELD_WIDTH;
  }
  
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
  // Use the actual container width for centering, not the constrained width
  const actualWidth = rect.width;
  const totalPaddingX = actualWidth - windowWidth.value;
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

function handleKeyDown(event: KeyboardEvent) {
  // Return selected tile on ESC key
  if (selectedTile.value && event.key === 'Escape') {
    returnSelectedTile();
  }
}

function returnSelectedTile() {
  if (selectedTile.value) {
    console.log(`Tile unselected: ${selectedTile.value.type?.group} ${selectedTile.value.type?.index} at (${selectedTile.value.x}, ${selectedTile.value.y}, ${selectedTile.value.z})`);
    selectedTile.value.selected = false;
    selectedTile.value = null;
    gameStore.clearSelection();
  }
}

// Touch event handlers for better mobile experience
function onTileTouchStart(_event: TouchEvent, tile: MjTile) {
  // Store the tile that was touched
  touchStartTile.value = tile;
  touchStartTime.value = Date.now();
}

function onTileTouchEnd(event: TouchEvent, tile: MjTile) {
  // Check if this is the same tile we started touching
  if (touchStartTile.value === tile) {
    // Prevent the click event from firing
    event.preventDefault();
    // Treat as a tap regardless of finger movement
    onTileClick(tile);
  }
  
  // Reset touch tracking
  touchStartTile.value = null;
}

function onTileTouchCancel() {
  // Reset touch tracking on cancel
  touchStartTile.value = null;
}

function continueGame() {
  emit('continue');
}

// Subscribe to hint requests
watch(() => gameStore.showHint, (value) => {
  showHints.value = value;
});

// Helper functions for tile rendering
function getTilePosition(tile: MjTile) {
  return {
    left: `${tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX}px`,
    top: `${tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY}px`,
    position: 'absolute' as const
  };
}

function getTileBottomStyle(tile: MjTile) {
  const pos = getTilePosition(tile);
  const baseTop = tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY;
  const baseLeft = tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX;
  
  return {
    ...pos,
    top: `${baseTop - shiftX.value * 2 + depthSize.value}px`,
    left: `${baseLeft + shiftY.value * 2 - depthSize.value}px`,
    width: `${elementPixelWidth.value * 2 - 4}px`,
    height: `${elementPixelHeight.value * 2 - 4}px`,
    zIndex: tile.z * 1000 + 0,
    transform: `rotate3d(0, 0, 1, ${tile.chaosRotation}deg) translateZ(0)`,
    '--depth-size': `${depthSize.value}px`
  };
}

function getTileSideBottomStyle(tile: MjTile) {
  const pos = getTilePosition(tile);
  const baseTop = tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY;
  const baseLeft = tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX;
  
  return {
    position: pos.position,
    top: `${baseTop - shiftX.value * 2 + elementPixelHeight.value * 2 - 4}px`,
    left: `${baseLeft + shiftY.value * 2 + depthSize.value * 0.7}px`,
    width: `${elementPixelWidth.value * 2 - 4 - depthSize.value * 0.7}px`,
    height: `${depthSize.value}px`,
    zIndex: tile.z * 1000 + 1,
    transform: `skewX(-45deg) translateX(${-depthSize.value * 0.3}px) translateZ(0)`,
    transformOrigin: 'top left',
    '--depth-size': `${depthSize.value}px`
  };
}

function getTileSideLeftStyle(tile: MjTile) {
  const pos = getTilePosition(tile);
  const baseTop = tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY;
  const baseLeft = tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX;
  
  const tileTop = baseTop - shiftX.value * 2;
  const tileLeft = baseLeft + shiftY.value * 2;
  const tileHeight = elementPixelHeight.value * 2 - 4;
  
  return {
    position: pos.position,
    top: `${tileTop + tileHeight * 0.11 + 1}px`,
    left: `${tileLeft - depthSize.value}px`,
    width: `${depthSize.value}px`,
    height: `${tileHeight * 0.89}px`,
    zIndex: tile.z * 1000 + 2,
    transform: `skewY(-45deg) translateZ(0)`,
    transformOrigin: 'top left',
    '--depth-size': `${depthSize.value}px`
  };
}

function getTileStyle(tile: MjTile) {
  const pos = getTilePosition(tile);
  const baseTop = tile.y * elementPixelHeight.value - tile.z * shiftY.value + tile.chaosOffsetY;
  const baseLeft = tile.x * elementPixelWidth.value + tile.z * shiftX.value + tile.chaosOffsetX;
  
  return {
    position: pos.position,
    top: `${baseTop - shiftX.value * 2}px`,
    left: `${baseLeft + shiftY.value * 2}px`,
    width: `${elementPixelWidth.value * 2 - 4}px`,
    height: `${elementPixelHeight.value * 2 - 4}px`,
    color: tile.selected ? '#5C5749' : tile.type?.getColor(),
    textShadow: `0 0 ${Math.floor(elementPixelWidth.value * 0.8)}px ${tile.type?.getColor()}`,
    zIndex: tile.z * 1000 + 3,
    transform: `rotate3d(0, 0, 1, ${tile.chaosRotation}deg) translateZ(0)`,
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
    'hint-active': tile.showHint && showHints.value
  };
}

// Function to regenerate the current layout with same tile arrangement
function regenerateLayout() {
  initTiles(true); // Preserve chaos
  buildTileRelationsGraph();
  shuffleTypesFisherYates(true); // Use saved tile types
  updateFreePairs();
  
  // Calculate dimensions after DOM is ready
  requestAnimationFrame(() => {
    retrieveDimensionsFromElement();
    tilesReady.value = true;
    
    // Initialize game store with shallow copy
    gameStore.initializeGame(props.layout, [...tiles.value] as MjTile[]);
    
    emit('ready');
  });
}

// Function to reshuffle with new random seed
function reshuffleWithAnimation() {
  // Clear saved types and chaos data to force new shuffle
  savedTileTypes.value = [];
  savedChaosData.value = [];
  
  // Initialize game with new random shuffle
  initializeGame();
}

// Function to load a saved game
async function loadSavedGame(savedGame: any) {
  // Set the current layout
  currentLayout.value = savedGame.layout;
  
  // Initialize tiles from saved state - but first create them from the layout
  const newTiles: MjTile[] = [];
  
  // Get layout data to ensure proper positioning
  const layoutData = getLayoutData(savedGame.layout);
  
  // Create tiles from layout positions
  for (const position of layoutData) {
    const tile = new MjTile(position.x, position.y, newTiles);
    
    // Find the corresponding saved tile data
    const savedTile = savedGame.tiles.find((st: any) => 
      st.x === tile.x && st.y === tile.y && st.z === tile.z
    );
    
    if (savedTile) {
      // Apply saved tile data
      tile.type = new MjTileType(savedTile.typeGroup, savedTile.typeIndex, 
        savedTile.typeGroup === 'season' || savedTile.typeGroup === 'flower');
      tile.active = savedTile.active;
      tile.selected = savedTile.selected;
      tile.chaosOffsetX = savedTile.chaosOffsetX || 0;
      tile.chaosOffsetY = savedTile.chaosOffsetY || 0;
      tile.chaosRotation = savedTile.chaosRotation || 0;
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
  
  // Assign tiles
  tiles.value = newTiles;
  
  // Rebuild relations
  buildTileRelationsGraph();
  updateFreePairs();
  
  // Set up game store with saved state
  requestAnimationFrame(() => {
    retrieveDimensionsFromElement();
    tilesReady.value = true;
    
    // Initialize game store with the tiles
    gameStore.initializeGame(savedGame.layout, [...tiles.value] as MjTile[]);
    
    // Restore game state
    gameStore.score = savedGame.score;
    gameStore.timer = savedGame.timer;
    gameStore.moves = savedGame.moves;
    
    // Restore undo stack
    const restoredUndoStack = [];
    for (const savedUndo of savedGame.undoStack) {
      // Find the tiles by their positions
      const tile1 = tiles.value.find(t => 
        t.x === savedUndo.tile1.x && 
        t.y === savedUndo.tile1.y && 
        t.z === savedUndo.tile1.z
      );
      const tile2 = tiles.value.find(t => 
        t.x === savedUndo.tile2.x && 
        t.y === savedUndo.tile2.y && 
        t.z === savedUndo.tile2.z
      );
      
      if (tile1 && tile2) {
        restoredUndoStack.push({
          tile1,
          tile2,
          previousScore: savedUndo.previousScore,
          selectedTile: null
        });
      }
    }
    
    gameStore.undoStack = restoredUndoStack;
    
    emit('ready');
  });
}

// Function to initialize a new game
function initializeNewGame() {
  initializeGame();
}

// Expose public methods
defineExpose({
  regenerateLayout,
  reshuffleWithAnimation,
  loadSavedGame,
  initializeNewGame
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
  will-change: transform;
  backface-visibility: hidden;

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
  isolation: isolate;
  will-change: transform;
  backface-visibility: hidden;
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
  isolation: isolate;
  will-change: transform;
  backface-visibility: hidden;
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
    filter: brightness(1.08);
    cursor: pointer;
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

// Mystical dragon spirit hint styles
.dragon-spirit-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
}

// Dragon orb that orbits around the tile
.dragon-orb {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: 
    dragon-float 2.5s ease-in-out infinite alternate;
}

.orb-core {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, #FFE4B5, #FFD700, #FF6347);
  border-radius: 50%;
  box-shadow: 
    0 0 10px #FFD700,
    0 0 20px #FF6347,
    inset -2px -2px 4px rgba(255, 99, 71, 0.5);
  animation: orb-pulse 1.5s ease-in-out infinite;
}

.orb-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: orb-glow-pulse 1.5s ease-in-out infinite;
}

// Floating spirit particles
.spirit-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 6px #FFD700;
  opacity: 0;
  animation: particle-float 3s ease-in-out infinite;
  animation-delay: var(--particle-delay);
}

.particle:nth-child(1) { top: 10%; left: 20%; }
.particle:nth-child(2) { top: 20%; right: 15%; }
.particle:nth-child(3) { bottom: 15%; left: 10%; }
.particle:nth-child(4) { bottom: 20%; right: 20%; }
.particle:nth-child(5) { top: 50%; left: 5%; }
.particle:nth-child(6) { top: 50%; right: 5%; }

// Energy ribbons flowing around the tile
.energy-ribbon {
  position: absolute;
  width: 120%;
  height: 120%;
  top: -10%;
  left: -10%;
  border: 2px solid transparent;
  border-radius: 20%;
  opacity: 0.6;
}

.ribbon-1 {
  border-image: linear-gradient(45deg, transparent, #FFD700, #FF6347, transparent) 1;
  animation: ribbon-rotate 4s linear infinite;
}

.ribbon-2 {
  border-image: linear-gradient(-45deg, transparent, #FF6347, #FFD700, transparent) 1;
  animation: ribbon-rotate 4s linear infinite reverse;
  animation-delay: 2s;
}

// Animations
@keyframes dragon-float {
  0% {
    filter: brightness(1) hue-rotate(0deg);
  }
  50% {
    filter: brightness(1.3) hue-rotate(20deg);
  }
  100% {
    filter: brightness(0.9) hue-rotate(-20deg);
  }
}

@keyframes orb-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes orb-glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@keyframes particle-float {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0);
  }
  20% {
    opacity: 1;
    transform: translateY(-5px) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-35px) scale(0);
  }
}

@keyframes ribbon-rotate {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 0.3;
  }
}
</style>
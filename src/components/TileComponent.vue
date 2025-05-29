<template>
  <div 
    class="tile-outer"
    :class="{
      hidden: !active && !selected,
      free: isFree && !selected,
      selected: selected,
      'shake shake-rotate shake-constant shake-slow shake-little': hasFreePair && showHints
    }"
    :style="{
      left: `${x * elementPixelWidth + z * shiftX}px`,
      top: `${y * elementPixelHeight - z * shiftY}px`,
      width: `${elementPixelWidth * 2}px`,
      height: `${elementPixelHeight * 2}px`
    }"
  >
    <!-- Shadows for 3D effect -->
    <div 
      class="tile-shadow tile-shadow1"
      :style="{
        width: `${elementPixelWidth * 2 - 2}px`,
        height: `${elementPixelHeight * 2 - 2}px`
      }"
    >&nbsp;</div>
    <div 
      class="tile-shadow tile-shadow2"
      :style="{
        top: `${-shiftX}px`,
        left: `${shiftY}px`,
        width: `${elementPixelWidth * 2 - 2}px`,
        height: `${elementPixelHeight * 2 - 2}px`
      }"
    >&nbsp;</div>

    <!-- Main tile -->
    <div 
      v-if="type"
      class="tile"
      :class="{
        selected: selected,
        layer0: z === 0,
        layer1: z === 1,
        layer2: z === 2,
        layer3: z === 3,
        layer4: z === 4,
        layer5: z >= 5
      }"
      :style="{
        top: `${-shiftX * 2}px`,
        left: `${shiftY * 2}px`,
        width: `${elementPixelWidth * 2 - 4}px`,
        height: `${elementPixelHeight * 2 - 4}px`,
        color: selected ? '#5C5749' : type.getColor(),
        textShadow: `0 0 ${elementPixelWidth * 2}px ${type.getColor()}`
      }"
      @click="onClick"
    >
      <div class="tile-content">
        <div 
          class="secondary-character"
          :style="{
            fontSize: `${fontSizeSecondary}px`,
            lineHeight: `${fontSizeSecondary - 5}px`
          }"
        >
          {{ type.getSecondaryCharacter() }}
        </div>

        <div 
          class="primary-character-wrap"
          :style="{
            width: `${primaryWrapperWidth}px`,
            marginLeft: `${-primaryWrapperLeftShift}px`
          }"
        >
          <span 
            class="primary-character"
            :style="{
              fontSize: `${fontSizePrimary}px`,
              lineHeight: `${fontSizePrimary}px`
            }"
            v-html="type.getPrimaryCharacter()"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MjTileType } from '@/models/tile.model';

const props = defineProps<{
  x: number;
  y: number;
  z: number;
  elementPixelWidth: number;
  elementPixelHeight: number;
  active: boolean;
  selected: boolean;
  type: MjTileType | null;
  isFree: boolean;
  showHints: boolean;
  hasFreePair: boolean;
}>();

const emit = defineEmits<{
  tileClicked: [];
}>();

// Computed properties
const shiftX = computed(() => Math.floor(props.elementPixelWidth * 0.1));
const shiftY = computed(() => Math.floor(props.elementPixelHeight * 0.1));

const fontSizePrimary = computed(() => Math.floor(props.elementPixelHeight * 1.3));
const fontSizeSecondary = computed(() => Math.floor(props.elementPixelHeight * 0.4));

const primaryWrapperWidth = computed(() => Math.floor(props.elementPixelWidth * 1.6));
const primaryWrapperLeftShift = computed(() => Math.floor((primaryWrapperWidth.value - props.elementPixelWidth * 2) / 2));

function onClick(event: MouseEvent) {
  event.stopPropagation();
  emit('tileClicked');
}
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/assets/styles/variables' as *;

.tile-outer {
  position: absolute;
  cursor: pointer;
  transition: all $animation-normal ease;
  
  &.hidden {
    opacity: 0;
    transform: scale(0.8);
    pointer-events: none;
  }
  
  &.free:hover {
    transform: translateY(-2px);
    
    .tile {
      background: color.adjust(#F5F5DC, $lightness: 5%);
    }
  }
  
  &.selected {
    z-index: $z-tile-selected !important;
    transform: translateY(-4px);
    
    .tile {
      background: #FFD700 !important;
      box-shadow: 0 5px 15px rgba(255, 215, 0, 0.5);
    }
  }
  
  &.shake {
    animation: shake-rotate 0.5s infinite;
  }
}

.tile-shadow {
  position: absolute;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.tile-shadow1 {
  top: 2px;
  left: -2px;
}

.tile-shadow2 {
  z-index: 2;
}

.tile {
  position: absolute;
  background: #F5F5DC;
  border: 2px solid #8B7355;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'FreeSerifNF', serif;
  overflow: hidden;
  z-index: 3;
  
  &.layer0 { z-index: 100; }
  &.layer1 { z-index: 110; }
  &.layer2 { z-index: 120; }
  &.layer3 { z-index: 130; }
  &.layer4 { z-index: 140; }
  &.layer5 { z-index: 150; }
  
  &.selected {
    border-color: #FFD700;
  }
}

.tile-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.secondary-character {
  position: absolute;
  top: 5%;
  left: 5%;
  font-weight: bold;
  opacity: 0.8;
}

.primary-character-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.primary-character {
  display: block;
  text-align: center;
}

@keyframes shake-rotate {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
</style>
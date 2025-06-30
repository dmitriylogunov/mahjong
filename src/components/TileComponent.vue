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
    <!-- Bottom layer for 3D effect -->
    <div 
      v-if="type"
      class="tile-bottom"
      :style="{
        top: `${-shiftX * 2 + depthSize}px`,
        left: `${shiftY * 2 - depthSize}px`,
        width: `${elementPixelWidth * 2 - 4}px`,
        height: `${elementPixelHeight * 2 - 4}px`,
        '--depth-size': `${depthSize}px`
      }"
    ></div>

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
        textShadow: `0 0 ${Math.floor(elementPixelWidth * 0.8)}px ${type.getColor()}`,
        '--depth-size': `${depthSize}px`
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
            marginLeft: `${-primaryWrapperLeftShift}px`,
            ...(type.group === 'dragon' && type.getPrimaryCharacter() === '龙' ? {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: `${fontSizePrimary}px`,
              paddingRight: `${fontSizePrimary * 0.075}px`
            } : {})
          }"
        >
          <span 
            class="primary-character"
            :style="{
              fontSize: `${type.group === 'dragon' && type.getPrimaryCharacter() === '龙' ? fontSizePrimary / 2 : fontSizePrimary}px`,
              lineHeight: `${type.group === 'dragon' && type.getPrimaryCharacter() === '龙' ? fontSizePrimary / 2 : fontSizePrimary}px`
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

// Constants - matching original implementation
const shiftProportion = 0.14; // Original value from pre-Vue code
const depthProportion = 0.15; // Proportion of tile size for depth effect

// Computed properties
const shiftX = computed(() => Math.floor(props.elementPixelWidth * shiftProportion));
const shiftY = computed(() => Math.floor(props.elementPixelHeight * shiftProportion));

// Depth dimensions for 3D effect - proportional to tile size
const depthSize = computed(() => Math.max(8, Math.floor(Math.min(props.elementPixelWidth, props.elementPixelHeight) * depthProportion)));

// Font size calculations matching original
const fontSizePrimary = computed(() => {
  const adjustedElementSize = Math.min(
    props.elementPixelHeight,
    props.elementPixelWidth * 1.5 // original proportion of tile font height to font width
  );
  return Math.floor(adjustedElementSize * 1.5);
});

const fontSizeSecondary = computed(() => {
  const adjustedElementSize = Math.min(
    props.elementPixelHeight,
    props.elementPixelWidth * 1.5
  );
  return Math.floor(adjustedElementSize / 3);
});

// Primary character horizontal centering - matching original
const primaryWrapperWidth = computed(() => props.elementPixelWidth * 4);
const primaryWrapperLeftShift = computed(() => {
  const primaryCharacterAreaWidth = props.elementPixelWidth * 2 - 10; // -2*margin of tile
  return Math.floor((primaryWrapperWidth.value - primaryCharacterAreaWidth) / 2);
});

function onClick(event: MouseEvent) {
  event.stopPropagation();
  emit('tileClicked');
}
</script>

<style lang="scss" scoped>
.tile-outer {
  position: absolute;
  font-family: FreeSerifNF;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));

  &.free {
    .tile {
      cursor: pointer;
      transition: all 0.15s ease-out;

      &:hover {
        transform: translateY(-2px);
        filter: brightness(1.08);
        box-shadow: 
          0 8px 16px rgba(0, 0, 0, 0.2),
          0 4px 8px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
        
        &::before {
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -1px 2px rgba(0, 0, 0, 0.15);
        }

        &::after {
          box-shadow: 
            -1px 0 4px rgba(0, 0, 0, 0.3),
            inset 2px 0 2px rgba(0, 0, 0, 0.15);
        }
      }
    }

    .tile-bottom {
      transition: all 0.15s ease-out;
    }

    &:hover .tile-bottom {
      transform: translateY(2px);
      box-shadow: 
        inset 0 -3px 5px rgba(0, 0, 0, 0.35),
        inset 0 1px 3px rgba(0, 0, 0, 0.25),
        0 3px 6px rgba(0, 0, 0, 0.25);
    }
  }

  &.hidden {
    display: none;
  }

  .tile {
    overflow: visible;
    transform-origin: 50% 50%;
    border: 1px solid rgba(80, 80, 80, 0.6);
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

    &::before {
      content: '';
      position: absolute;
      top: 100%;
      left: 11%;
      width: 89%;
      height: var(--depth-size);
      background: linear-gradient(to bottom, 
        #D9C89E 0%, 
        #C5B58C 30%, 
        #B5A57C 60%, 
        #A59572 100%);
      transform-origin: top left;
      transform: skewX(-45deg) translateX(calc(var(--depth-size) * -0.3));
      z-index: -1;
      border-radius: 0 2px 2px 2px;
      box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.3),
        inset 0 -1px 2px rgba(0, 0, 0, 0.1);
    }

    &::after {
      content: '';
      position: absolute;
      top: 11%;
      right: 100%;
      width: var(--depth-size);
      height: 89%;
      background: linear-gradient(to right, 
        #A59572 0%, 
        #B5A57C 40%, 
        #C5B58C 70%, 
        #D9C89E 100%);
      transform-origin: top right;
      transform: skewY(-45deg) translateY(calc(var(--depth-size) * -0.95));
      z-index: -1;
      border-radius: 2px 0 0 2px;
      box-shadow: 
        -1px 0 3px rgba(0, 0, 0, 0.3),
        inset 2px 0 2px rgba(0, 0, 0, 0.1);
    }

    .tile-inner-highlight {
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      bottom: 50%;
      background: linear-gradient(to bottom, 
        rgba(255, 255, 255, 0.3) 0%, 
        rgba(255, 255, 255, 0.15) 30%,
        rgba(255, 255, 255, 0.05) 60%,
        transparent 100%);
      border-radius: 8% 8% 40% 40%;
      pointer-events: none;
    }

    .tile-content {
      margin: 5px;
      padding: 0px;
      text-align: left;
      position: relative;
      z-index: 1;

      .primary-character-wrap {
        text-align: center;

        .primary-character {
          margin-top: -1px;
          margin-right: 0px;
          margin-bottom: 0px;
          filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.2));
        }
      }

      .secondary-character {
        filter: drop-shadow(0.5px 0.5px 0.5px rgba(0, 0, 0, 0.15));
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
        0 6px 12px rgba(0, 0, 0, 0.2),
        0 3px 6px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.6),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15),
        0 0 20px rgba(254, 170, 110, 0.4);
      border-color: rgba(180, 100, 40, 0.6);
    }
  }

  .tile-bottom {
    position: absolute;
    border-radius: 10%;
    background: linear-gradient(145deg, #B5A57C 0%, #A59572 40%, #958568 100%);
    border: 1px solid rgba(60, 60, 60, 0.7);
    box-shadow: 
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 2px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: -2;

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
}
</style>
<template>
  <div 
    class="tile-outer"
    :class="{
      hidden: !active && !selected && !isFloating,
      free: isFree && !selected,
      locked: !isFree && active,
      selected: selected,
      floating: isFloating,
      'shake shake-rotate shake-constant shake-slow shake-little': hasFreePair && showHints
    }"
    :style="{
      ...tilePosition,
      width: `${elementPixelWidth * 2}px`,
      height: `${elementPixelHeight * 2}px`,
      transform: isFloating ? 'rotate(0deg) scale(1.1)' : `rotate(${chaosRotation}deg)`,
      zIndex: baseZIndex
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
        '--depth-size': `${depthSize}px`,
        zIndex: 0
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
        '--depth-size': `${depthSize}px`,
        zIndex: 3
      }"
      @click="onClick"
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
          {{ type.getSecondaryCharacter() }}
        </div>

        <div 
          class="primary-character-wrap"
          :style="{
            ...(type.group === 'dragon' && type.getPrimaryCharacter() === '龙' ? {
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
  chaosOffsetX: number;
  chaosOffsetY: number;
  chaosRotation: number;
  elementPixelWidth: number;
  elementPixelHeight: number;
  active: boolean;
  selected: boolean;
  type: MjTileType | null;
  isFree: boolean;
  showHints: boolean;
  hasFreePair: boolean;
  isFloating: boolean;
  mouseX: number;
  mouseY: number;
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


// Floating tile position
const tilePosition = computed(() => {
  if (props.isFloating) {
    // Position tile at top-right of cursor
    return {
      left: `${props.mouseX + 10}px`, // 10px offset to the right
      top: `${props.mouseY - props.elementPixelHeight * 2 - 10}px`, // Above cursor
      position: 'fixed' as const
    };
  } else {
    // Normal position
    return {
      left: `${props.x * props.elementPixelWidth + props.z * shiftX.value + props.chaosOffsetX}px`,
      top: `${props.y * props.elementPixelHeight - props.z * shiftY.value + props.chaosOffsetY}px`,
      position: 'absolute' as const
    };
  }
});

// Base z-index for the tile container
const baseZIndex = computed(() => {
  if (props.isFloating) {
    return 10000; // Floating tiles always on top
  }
  // Base z-index calculation using layer, y, and x
  // Each layer gets 1000 z-index units of space
  // Within a layer, y position adds 10 units, x adds 1
  return props.z * 1000 + props.y * 10 + props.x;
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
  transform-origin: center center;
  transition: transform 0.2s ease-out;

  &.free {
    cursor: pointer;
    transition: transform 0.15s ease-out;

    &:hover {
      transform: translateY(-3px);
    }

    .tile {
      cursor: pointer;
      transition: all 0.15s ease-out;

      &:hover {
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
  }

  &.hidden {
    display: none;
  }

  &.floating {
    cursor: grabbing;
    pointer-events: none;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
    transition: none !important;
    
    .tile {
      box-shadow: 
        0 12px 24px rgba(0, 0, 0, 0.3),
        0 6px 12px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }
  }

  &.locked {
    cursor: not-allowed;
    
    * {
      cursor: not-allowed !important;
    }
    
    .tile {
      cursor: not-allowed;
      opacity: 0.95;
      
      &:hover {
        filter: brightness(0.95);
      }
      
      &::before,
      &::after {
        cursor: not-allowed;
      }
    }
    
    .tile-bottom {
      cursor: not-allowed;
      
      &::before,
      &::after {
        cursor: not-allowed;
      }
    }
  }

  .tile {
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
      z-index: 1;
      border-radius: 0 2px 2px 2px;
      box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.3),
        inset 0 -1px 2px rgba(0, 0, 0, 0.1);
    }

    &::after {
      content: '';
      position: absolute;
      top: 11%;
      left: 100%;
      width: var(--depth-size);
      height: 89%;
      background: linear-gradient(to right, 
        #A59572 0%, 
        #B5A57C 40%, 
        #C5B58C 70%, 
        #D9C89E 100%);
      transform-origin: top left;
      transform: skewY(45deg);
      z-index: 2;
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
      /* z-index inherited from parent */
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
      /* z-index inherited from parent */
      cursor: inherit;
    }


    .tile-content {
      margin: 5px;
      padding: 0px;
      position: relative;
      /* z-index inherited from parent */
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
    }
  }

  .tile-bottom {
    position: absolute;
    border-radius: 10%;
    background: linear-gradient(145deg, #B5A57C 0%, #A59572 40%, #958568 100%);
    box-shadow: 
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 2px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.2);

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
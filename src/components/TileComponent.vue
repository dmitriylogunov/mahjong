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
    <!-- Width and height adjusted to account for borders, i.e. border width * 2 subtracted -->
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

// Constants - matching original implementation
const shiftProportion = 0.14; // Original value from pre-Vue code

// Computed properties
const shiftX = computed(() => Math.floor(props.elementPixelWidth * shiftProportion));
const shiftY = computed(() => Math.floor(props.elementPixelHeight * shiftProportion));

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

  &.free {
    .tile {
      cursor: pointer;

      &:hover {
        background-color: lightgray;
      }
    }
  }

  &.hidden {
    display: none;
  }

  .tile-shadow {
    position: absolute;
    border: 1px solid gray;
    background-color: lightgray;
    border-radius: 10%;

    &.tile-shadow1 {
      top: 0px;
      left: 0px;
    }

    &.tile-shadow2 {
      opacity: .99;
      border-left: none;
      border-bottom: none;
    }
  }

  .tile {
    overflow: hidden;
    transform-origin: 50% 50%;
    border: 2px solid gray;
    position: absolute;
    border-radius: 10%;
    cursor: default;
    background-color: #FEF2C7;
    /* Default background color */

    &::before {
      content: '';
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      height: 10px;
      /* Adjust thickness here */
      background-color: #D9C89E;
      /* Side color */
      transform-origin: top left;
      z-index: -1;
    }

    .tile-content {
      margin: 5px;
      padding: 0px;
      text-align: left;

      .primary-character-wrap {
        text-align: center;

        .primary-character {
          margin-top: -1px;
          margin-right: 0px;
          margin-bottom: 0px;
        }
      }
    }

    &.layer0 {
      background-color: #FEF2C7;
    }

    &.layer1 {
      background-color: #BEDDBF;
    }

    &.layer2 {
      background-color: #FFE1A2;
    }

    &.layer3 {
      background-color: #FEF2C7;
    }

    &.layer4 {
      background-color: #FEF2C7;
    }

    &.layer5 {
      background-color: #FEAA6E;
    }

    &.selected {
      background-color: #FEAA6E;
    }
  }
}
</style>
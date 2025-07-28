<template>
  <div class="dialog-backdrop" @click.self="$emit('close')">
    <div class="dialog">
      <div class="dialog-content" :class="{ 'sub-text-only': !mainText && subText }">
        <div class="decorative-border top"></div>
        <h1 v-if="mainText" class="main-text" :data-text="mainText">{{ mainText }}</h1>
        <div v-if="subText" class="sub-text">{{ subText }}</div>
        <div class="decorative-border bottom"></div>
      </div>
      <div class="dialog-actions">
        <button class="btn primary" @click="$emit('action')">{{ buttonText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mainText?: string;
  subText?: string;
  buttonText: string;
}

defineProps<Props>();

defineEmits<{
  action: [];
  close: [];
}>();
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  position: relative;
  color: $text-color;
  padding: 30px;
  width: 60%;
  max-width: 550px;
  min-height: 200px;
  border-radius: 15px;
  border: 3px solid #FFD700;
  text-align: center;
  background: 
    linear-gradient(135deg, rgba(139, 69, 19, 0.95), rgba(160, 82, 45, 0.95)),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 215, 0, 0.03) 10px,
      rgba(255, 215, 0, 0.03) 20px
    );
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 215, 0, 0.3),
    inset 0 -1px 0 rgba(139, 69, 19, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.dialog-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  text-align: center;
  overflow: hidden;
}

.main-text {
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

.sub-text {
  font-family: "Palatino", "Garamond", serif;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: #FFE5B4;
  text-align: center;
  margin: 10px 0 30px 0;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-style: italic;
}

// When only sub-text is present, center content vertically
.dialog-content.sub-text-only {
  min-height: 150px;
  
  .sub-text {
    margin: auto 0;
  }
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

.dialog-actions {
  width: 100%;
  padding: 20px 0;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
}

.btn {
  font-size: 20px;
  line-height: 28px;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid #FFD700;
  background: 
    linear-gradient(135deg, #8FBC8F, #98D98E);
  color: #2F4F2F;
  padding: 12px 24px;
  margin: 8px;
  transition: all 0.3s ease;
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: 
      linear-gradient(135deg, #7FA87F, #88C888);
    transform: translateY(-2px);
    box-shadow: 
      0 5px 10px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}
</style>
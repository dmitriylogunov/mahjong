<template>
  <Transition name="modal">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-dialog">
        <div class="modal-content">
          <slot></slot>
        </div>
        <div class="modal-actions-wrapper">
          <div class="modal-actions">
            <button
              v-for="(action, index) in visibleActions"
              :key="index"
              type="button"
              class="btn"
              :class="{ primary: action.primary }"
              @click="action.action"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ModalAction {
  label: string;
  action: () => void;
  primary?: boolean;
  visible?: () => boolean;
}

const props = defineProps<{
  actions: ModalAction[];
}>();

defineEmits<{
  close: [];
}>();

const visibleActions = computed(() => {
  return props.actions.filter(action => {
    return !action.visible || action.visible();
  });
});
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/assets/styles/variables' as *;

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
}

.modal-dialog {
  padding: 30px;
  width: 60%;
  max-width: 550px;
  min-height: 200px;
  color: $text-color;
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  
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

.modal-content {
  padding: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  h1 {
    margin: 0 0 20px;
    font-size: 2em;
    text-align: center;
  }
  
  p {
    margin: 15px 0;
    line-height: 1.6;
  }
  
  ul {
    margin: 20px 0;
    padding-left: 20px;
    
    li {
      margin: 10px 0;
      line-height: 1.5;
    }
  }
}

.modal-actions-wrapper {
  width: 100%;
  padding: 20px 0;
  position: relative;
  z-index: 1;
}

.modal-actions {
  width: 80%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
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
  width: 100%;
  max-width: 300px;
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

// Transition animations
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
  
  .modal-dialog {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .modal-dialog {
    transform: scale(0.9);
  }
}
</style>
<template>
  <div class="toast-container" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="'toast-' + t.type"
      >
        <svg v-if="t.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        <svg v-else-if="t.type === 'error'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
        </svg>
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from "../composables/useToast.js";
const { toasts } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-1);
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 0.875rem;
  box-shadow: var(--shadow-raised);
  white-space: nowrap;
}

.toast-success {
  border-color: color-mix(in srgb, #2f8f5b 55%, var(--border-strong));
  color: #1e7a46;
}

.toast-error {
  border-color: var(--danger);
  color: var(--danger);
}

.toast-enter-active {
  transition: 0.3s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.toast-leave-active {
  transition: 0.22s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

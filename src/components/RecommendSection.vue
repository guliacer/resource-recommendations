<template>
  <section class="recommend-section">
    <div class="section-header">
      <div class="section-title">
        <h2>{{ section.title }}</h2>
        <p>{{ section.description }}</p>
      </div>
      <span class="count-badge">{{ items.length }} 个</span>
      <button
        class="collapse-btn"
        @click="toggle"
        :title="collapsed ? '展开' : '折叠'"
        :aria-label="collapsed ? `展开${section.title}` : `折叠${section.title}`"
        :aria-expanded="!collapsed"
        :aria-controls="`section-cards-${section.id}`"
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          :class="{ rotated: collapsed }"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>
    <div
      :id="`section-cards-${section.id}`"
      class="cards-grid"
      :class="{ collapsed }"
      :aria-hidden="collapsed"
    >
      <ResourceCard
        v-for="(item, index) in items"
        :key="item.url"
        :item="item"
        :tone="TONES[index % TONES.length]"
      />
    </div>
  </section>
</template>

<script setup>
import ResourceCard from "./ResourceCard.vue";

const TONES = ["sage", "mist", "rose", "sand", "lavender", "clay", "primary", "stone"];

const props = defineProps({
  section: { type: Object, required: true },
  items: { type: Array, required: true },
  collapsed: { type: Boolean, default: false },
});

const emit = defineEmits(["toggle"]);

function toggle() {
  emit("toggle", props.section.id);
}
</script>

<style scoped>
.recommend-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-hairline);
}

.section-title {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

h2 {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
}

p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  max-width: 40rem;
  line-height: 1.4;
}

.count-badge {
  flex-shrink: 0;
  border-radius: 9999px;
  border: 1px solid var(--border-strong);
  background: var(--surface-1);
  padding: 0.25rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}

.collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid var(--border-strong);
  background: var(--surface-1);
  border-radius: 0.375rem;
  cursor: pointer;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: 0.15s;
}
.collapse-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}
.collapse-btn svg {
  transition: transform 0.2s ease;
}
.collapse-btn svg.rotated {
  transform: rotate(-90deg);
}

.cards-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  transition: max-height 0.3s ease, opacity 0.25s ease;
  overflow: hidden;
  max-height: 9999px;
  opacity: 1;
}

.cards-grid.collapsed {
  max-height: 0;
  opacity: 0;
}

@media (min-width: 640px) {
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>

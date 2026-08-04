<template>
  <nav class="tabs" aria-label="分类筛选">
    <button
      v-for="t in tabs"
      :key="t.id"
      class="tab"
      :class="{ active: activeCategory === t.id }"
      :aria-pressed="activeCategory === t.id"
      @click="selectTab(t.id)"
    >
      {{ t.label }}
    </button>
    <button
      class="tab tab-fav"
      :class="{ active: activeCategory === 'favorites' }"
      :aria-pressed="activeCategory === 'favorites'"
      @click="selectTab('favorites')"
    >
      ★ 收藏夹
    </button>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { sections } from "../data/index.js";
import { useFilters } from "../composables/useFilters.js";

const { activeCategory } = useFilters();

const tabs = computed(() => [
  { id: "all", label: "全部推荐" },
  ...sections.map((s) => ({ id: s.id, label: s.title })),
]);

function selectTab(id) {
  activeCategory.value = id;
}

</script>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tab {
  border: 1px solid var(--border-strong);
  background: var(--surface-1);
  color: var(--text-secondary);
  padding: 0.375rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.15s;
}
.tab:hover {
  background: var(--surface-2);
}
.tab.active {
  background: var(--accent);
  color: #fff;
  border-color: transparent;
}
.tab-fav.active {
  background: #d9a441;
}
</style>

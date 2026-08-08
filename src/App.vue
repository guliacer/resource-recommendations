<template>
  <div class="app-root">
    <AppHeader />
    <StatsPanel />
    <CategoryTabs />
    <main class="main-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在加载个人项目…</p>
      </div>
      <div v-else-if="filtered === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <p>没有找到匹配的结果</p>
        <button class="btn btn-sm" @click="resetFilters">清除筛选</button>
      </div>
      <template v-else>
        <template v-for="sec in sectionList" :key="sec.id">
          <RecommendSection
            v-if="getSectionItems(sec).length > 0"
            :section="sec"
            :items="getSectionItems(sec)"
            :collapsed="collapsedSections.has(sec.id)"
            @toggle="toggleSection"
          />
        </template>
      </template>
    </main>
    <ToastProvider />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { CATALOG_UPDATED_AT, staticSections, loadPersonalSection } from "./data/index.js";
import { useFilters } from "./composables/useFilters.js";
import { useFavorites } from "./composables/useFavorites.js";
import { useTheme } from "./composables/useTheme.js";
import AppHeader from "./components/AppHeader.vue";
import CategoryTabs from "./components/CategoryTabs.vue";
import RecommendSection from "./components/RecommendSection.vue";
import StatsPanel from "./components/StatsPanel.vue";
import ToastProvider from "./components/ToastProvider.vue";

const { searchQuery, activeCategory, activeTag, resetFilters } = useFilters();
const { favorites } = useFavorites();
const { initTheme } = useTheme();

initTheme();

// 异步加载个人项目（GitHub API）
const loading = ref(true);
const collapsedSections = ref(new Set());
const allSections = ref([...staticSections]);

onMounted(async () => {
  const personal = await loadPersonalSection();
  // 替换同步版本为异步版本
  const idx = allSections.value.findIndex(s => s.id === "personal-projects");
  if (idx !== -1) {
    allSections.value = [
      personal,
      ...allSections.value.filter(s => s.id !== "personal-projects"),
    ];
  }
  loading.value = false;
});

const favoriteItems = computed(() => {
  const itemsByUrl = new Map(
    allSections.value.flatMap((section) => section.items).map((item) => [item.url, item])
  );

  // favorites keeps newest items first, so the favorites view doubles as a useful inbox.
  return favorites.value.map((url) => itemsByUrl.get(url)).filter(Boolean);
});

const sectionList = computed(() => {
  if (activeCategory.value === "favorites") {
    return [{
      id: "favorites",
      title: "收藏夹",
      description: "最近收藏的资源，最新收藏会排在最前面。",
      items: favoriteItems.value,
    }];
  }
  if (activeCategory.value !== "all")
    return allSections.value.filter((s) => s.id === activeCategory.value);
  return allSections.value;
});

function matchesQuery(item) {
  if (!searchQuery.value) return true;
  const q = searchQuery.value.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.tags.some((t) => t.toLowerCase().includes(q)) ||
    item.domain.toLowerCase().includes(q)
  );
}

function matchesTag(item) {
  if (!activeTag.value) return true;
  return item.tags.includes(activeTag.value);
}

function isFavItem(item) {
  return favorites.value.includes(item.url);
}

function filterItems(items) {
  return items.filter((item) => {
    if (!matchesQuery(item)) return false;
    if (!matchesTag(item)) return false;
    if (activeCategory.value === "favorites") return isFavItem(item);
    return true;
  });
}

function toggleSection(id) {
  const next = new Set(collapsedSections.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  collapsedSections.value = next;
}

function getSectionItems(sec) {
  return filterItems(
    sec.items.map((item, i) => ({
      ...item,
      updatedAt: item.updatedAt || CATALOG_UPDATED_AT,
      updatedAtLabel: item.updatedAtLabel || (item.updatedAt ? "更新于" : "核验于"),
      _uid: `${sec.id}-${i}`,
      sectionId: sec.id,
    }))
  );
}

const filtered = computed(() => {
  return sectionList.value.reduce(
    (total, section) => total + getSectionItems(section).length,
    0
  );
});
</script>

<style scoped>
.app-root {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 20px 64px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border-strong);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--text-muted);
  text-align: center;
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
}

.btn-sm {
  padding: 0.375rem 0.875rem;
  font-size: 0.8125rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-strong);
  background: var(--surface-1);
  cursor: pointer;
  transition: 0.15s;
}
.btn-sm:hover {
  background: var(--surface-2);
}
</style>

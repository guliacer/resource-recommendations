<template>
  <header class="app-header">
    <div class="header-top">
      <div class="title-area">
        <p class="label">资源推荐</p>
        <h1>资源推荐</h1>
        <p class="subtitle">收集插件、脚本、软件、自动化技能和提示词网站，覆盖 AI 创作、网页效率与图像灵感。</p>
      </div>
      <div class="header-actions">
        <button class="icon-btn" @click="toggleTheme" :title="theme === 'light' ? '切换暗色模式' : '切换亮色模式'" aria-label="切换主题">
          <svg v-if="theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="search-row">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          class="search-input"
          type="text"
          placeholder="搜索标题、描述、标签、域名…"
          aria-label="搜索"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''" aria-label="清除搜索">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <button v-if="activeTag" class="tag-pill" @click="activeTag = ''" :title="'清除筛选'">
        {{ activeTag }} <span class="tag-close">×</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useTheme } from "../composables/useTheme.js";
import { useFilters } from "../composables/useFilters.js";

const { theme, toggleTheme } = useTheme();
const { searchQuery, activeTag } = useFilters();
</script>

<style scoped>
.app-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.title-area {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: var(--text-muted);
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  margin: 0.25rem 0 0;
  max-width: 44rem;
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.icon-btn {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid var(--border-strong);
  background: var(--surface-1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: 0.15s;
}
.icon-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.search-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-strong);
  border-radius: 0.625rem;
  background: var(--surface-1);
  color: var(--text-primary);
  outline: none;
  transition: 0.15s;
}
.search-input::placeholder {
  color: var(--text-muted);
}
.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 0.25rem;
}
.search-clear:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 9999px;
  border: 1px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 15%, var(--surface-1));
  color: var(--accent-strong);
  cursor: pointer;
  transition: 0.15s;
  white-space: nowrap;
}
.tag-pill:hover {
  background: color-mix(in srgb, var(--accent) 25%, var(--surface-1));
}
.tag-close {
  font-size: 1.1rem;
  line-height: 1;
}
</style>
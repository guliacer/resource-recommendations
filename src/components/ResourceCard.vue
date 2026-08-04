<template>
  <article class="card" :class="'tone-' + tone">
    <div class="card-header">
      <div class="title-wrap">
        <h3>{{ item.title }}</h3>
        <span class="domain">{{ item.domain }}</span>
      </div>
      <button
        class="fav-btn"
        :class="{ favorited: isFav }"
        @click.stop="handleFav"
        :title="isFav ? '取消收藏' : '收藏'"
        :aria-label="isFav ? `取消收藏 ${item.title}` : `收藏 ${item.title}`"
        :aria-pressed="isFav"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" :fill="isFav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    </div>

    <div class="card-body">
      <p class="card-desc">{{ item.description }}</p>
      <div class="tags">
        <button
          v-for="tag in item.tags"
          :key="tag"
          class="tag"
          :class="{ 'tag-active': activeTag === tag }"
          @click="handleTagClick(tag)"
        >{{ tag }}</button>
      </div>
      <div class="actions">
        <a
          class="btn btn-primary"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          @click.prevent="openLink"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          直达
        </a>
        <button class="btn btn-copy" @click="copyUrl">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          复制
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useFavorites } from "../composables/useFavorites.js";
import { useToast } from "../composables/useToast.js";
import { useFilters } from "../composables/useFilters.js";

const props = defineProps({
  item: { type: Object, required: true },
  tone: { type: String, default: "sage" },
});

const { isFavorite, toggleFavorite } = useFavorites();
const { copyText, push } = useToast();
const { activeTag, searchQuery, activeCategory } = useFilters();

const isFav = computed(() => isFavorite(props.item.url));

function handleFav() {
  const wasFavorite = isFavorite(props.item.url);
  toggleFavorite(props.item.url);
  if (!wasFavorite) {
    searchQuery.value = "";
    activeTag.value = "";
    activeCategory.value = "favorites";
    push("已添加收藏，已切换到收藏夹");
  } else {
    push("已取消收藏");
  }
}

function handleTagClick(tag) {
  activeTag.value = activeTag.value === tag ? "" : tag;
}

function openLink() {
  window.open(props.item.url, "_blank", "noopener,noreferrer");
}

function copyUrl() {
  copyText(props.item.url);
}
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  border: 1px solid var(--border-strong);
  background: var(--surface-1);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition:
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 200ms ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--border-strong);
  min-height: 3rem;
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.domain {
  font-size: 0.7rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-strong);
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: 0.15s;
}
.fav-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}
.fav-btn.favorited {
  color: #d9a441;
  border-color: #d9a441;
  background: color-mix(in srgb, #d9a441 12%, transparent);
}

/* Body */
.card-body {
  padding: 0.875rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
}

.card-desc {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag {
  border-radius: 9999px;
  border: 1px solid var(--border-strong);
  background: transparent;
  padding: 0.125rem 0.5rem;
  font-size: 11px;
  color: var(--text-muted);
  cursor: pointer;
  transition: 0.15s;
  white-space: nowrap;
}
.tag:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}
.tag-active {
  background: var(--accent) !important;
  border-color: transparent !important;
  color: #fff !important;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: 0.15s;
  border: 1px solid var(--border-strong);
  background: var(--surface-1);
  color: var(--text-primary);
}
.btn:hover {
  background: var(--surface-2);
  transform: translateY(-1px);
}

.btn-primary {
  background: var(--accent);
  border-color: transparent;
  color: #fff;
}
.btn-primary:hover {
  background: var(--accent-strong);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 40%, transparent);
}

/* Capsule tones */
.tone-sage .card-header { background: var(--capsule-sage); color: var(--capsule-sage-fg); border-bottom-color: var(--capsule-sage-border); }
.tone-sage { border-color: var(--capsule-sage-border); }
.tone-sage .tag { border-color: var(--capsule-sage-border); background: var(--capsule-sage); color: var(--capsule-sage-fg); }
.tone-sage .tag:hover { background: color-mix(in srgb, var(--capsule-sage-border) 70%, var(--capsule-sage)); }
.tone-sage .fav-btn { border-color: var(--capsule-sage-border); color: var(--capsule-sage-fg); }
.tone-sage .fav-btn:hover { background: color-mix(in srgb, var(--capsule-sage-border) 40%, transparent); }

.tone-mist .card-header { background: var(--capsule-mist); color: var(--capsule-mist-fg); border-bottom-color: var(--capsule-mist-border); }
.tone-mist { border-color: var(--capsule-mist-border); }
.tone-mist .tag { border-color: var(--capsule-mist-border); background: var(--capsule-mist); color: var(--capsule-mist-fg); }
.tone-mist .tag:hover { background: color-mix(in srgb, var(--capsule-mist-border) 70%, var(--capsule-mist)); }
.tone-mist .fav-btn { border-color: var(--capsule-mist-border); color: var(--capsule-mist-fg); }
.tone-mist .fav-btn:hover { background: color-mix(in srgb, var(--capsule-mist-border) 40%, transparent); }

.tone-clay .card-header { background: var(--capsule-clay); color: var(--capsule-clay-fg); border-bottom-color: var(--capsule-clay-border); }
.tone-clay { border-color: var(--capsule-clay-border); }
.tone-clay .tag { border-color: var(--capsule-clay-border); background: var(--capsule-clay); color: var(--capsule-clay-fg); }
.tone-clay .tag:hover { background: color-mix(in srgb, var(--capsule-clay-border) 70%, var(--capsule-clay)); }
.tone-clay .fav-btn { border-color: var(--capsule-clay-border); color: var(--capsule-clay-fg); }
.tone-clay .fav-btn:hover { background: color-mix(in srgb, var(--capsule-clay-border) 40%, transparent); }

.tone-lavender .card-header { background: var(--capsule-lavender); color: var(--capsule-lavender-fg); border-bottom-color: var(--capsule-lavender-border); }
.tone-lavender { border-color: var(--capsule-lavender-border); }
.tone-lavender .tag { border-color: var(--capsule-lavender-border); background: var(--capsule-lavender); color: var(--capsule-lavender-fg); }
.tone-lavender .tag:hover { background: color-mix(in srgb, var(--capsule-lavender-border) 70%, var(--capsule-lavender)); }
.tone-lavender .fav-btn { border-color: var(--capsule-lavender-border); color: var(--capsule-lavender-fg); }
.tone-lavender .fav-btn:hover { background: color-mix(in srgb, var(--capsule-lavender-border) 40%, transparent); }

.tone-fog .card-header { background: var(--capsule-fog); color: var(--capsule-fog-fg); border-bottom-color: var(--capsule-fog-border); }
.tone-fog { border-color: var(--capsule-fog-border); }
.tone-fog .tag { border-color: var(--capsule-fog-border); background: var(--capsule-fog); color: var(--capsule-fog-fg); }
.tone-fog .tag:hover { background: color-mix(in srgb, var(--capsule-fog-border) 70%, var(--capsule-fog)); }
.tone-fog .fav-btn { border-color: var(--capsule-fog-border); color: var(--capsule-fog-fg); }
.tone-fog .fav-btn:hover { background: color-mix(in srgb, var(--capsule-fog-border) 40%, transparent); }

.tone-rose .card-header { background: var(--capsule-rose); color: var(--capsule-rose-fg); border-bottom-color: var(--capsule-rose-border); }
.tone-rose { border-color: var(--capsule-rose-border); }
.tone-rose .tag { border-color: var(--capsule-rose-border); background: var(--capsule-rose); color: var(--capsule-rose-fg); }
.tone-rose .tag:hover { background: color-mix(in srgb, var(--capsule-rose-border) 70%, var(--capsule-rose)); }
.tone-rose .fav-btn { border-color: var(--capsule-rose-border); color: var(--capsule-rose-fg); }
.tone-rose .fav-btn:hover { background: color-mix(in srgb, var(--capsule-rose-border) 40%, transparent); }

.tone-sand .card-header { background: var(--capsule-sand); color: var(--capsule-sand-fg); border-bottom-color: var(--capsule-sand-border); }
.tone-sand { border-color: var(--capsule-sand-border); }
.tone-sand .tag { border-color: var(--capsule-sand-border); background: var(--capsule-sand); color: var(--capsule-sand-fg); }
.tone-sand .tag:hover { background: color-mix(in srgb, var(--capsule-sand-border) 70%, var(--capsule-sand)); }
.tone-sand .fav-btn { border-color: var(--capsule-sand-border); color: var(--capsule-sand-fg); }
.tone-sand .fav-btn:hover { background: color-mix(in srgb, var(--capsule-sand-border) 40%, transparent); }

.tone-stone .card-header { background: var(--capsule-stone); color: var(--capsule-stone-fg); border-bottom-color: var(--capsule-stone-border); }
.tone-stone { border-color: var(--capsule-stone-border); }
.tone-stone .tag { border-color: var(--capsule-stone-border); background: var(--capsule-stone); color: var(--capsule-stone-fg); }
.tone-stone .tag:hover { background: color-mix(in srgb, var(--capsule-stone-border) 70%, var(--capsule-stone)); }
.tone-stone .fav-btn { border-color: var(--capsule-stone-border); color: var(--capsule-stone-fg); }
.tone-stone .fav-btn:hover { background: color-mix(in srgb, var(--capsule-stone-border) 40%, transparent); }

.tone-primary .card-header { background: var(--primary-soft); color: var(--primary); border-bottom-color: color-mix(in srgb, var(--primary) 25%, transparent); }
.tone-primary { border-color: color-mix(in srgb, var(--primary) 30%, transparent); }
.tone-primary .tag { border-color: color-mix(in srgb, var(--primary) 35%, transparent); background: var(--primary-soft); color: var(--primary); }
.tone-primary .tag:hover { background: color-mix(in srgb, var(--primary) 40%, transparent); }
.tone-primary .fav-btn { border-color: color-mix(in srgb, var(--primary) 30%, transparent); color: var(--primary); }
.tone-primary .fav-btn:hover { background: color-mix(in srgb, var(--primary) 20%, transparent); }
</style>

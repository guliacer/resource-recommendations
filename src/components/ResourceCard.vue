<template>
  <article class="card" :class="'tone-' + tone">
    <div class="card-header">
      <div class="title-wrap">
        <h3>{{ item.title }}</h3>
        <div class="title-meta">
          <span class="domain">{{ item.domain }}</span>
          <span
            class="updated-at"
            :class="{ stale: isStale, missing: !hasUpdatedAt }"
            :title="updatedStatus"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {{ hasUpdatedAt ? `${item.updatedAtLabel || "更新于"} ${formattedUpdatedAt}` : "未记录更新时间" }}
          </span>
          <span v-if="isStale" class="stale-badge">需复核</span>
        </div>
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
        <button
          class="btn btn-view"
          :disabled="!hasImages"
          :title="hasImages ? `查看 ${item.title} 的图片` : '暂无图片'"
          :aria-label="hasImages ? `查看 ${item.title} 的图片` : `${item.title} 暂无图片`"
          @click="openViewer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9" r="1.5" />
            <path d="m21 15-4.5-4.5L7 20" />
          </svg>
          查看
          <span v-if="hasImages" class="btn-count">{{ imageSources.length }}</span>
        </button>
        <a
          v-if="hasCheckinLink"
          class="btn btn-checkin"
          :href="item.checkinUrl"
          target="_blank"
          rel="noopener noreferrer"
          :title="`打开 ${item.title} 签到页`"
          :aria-label="`打开 ${item.title} 签到页`"
          @click.prevent="openCheckinLink"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M8 2v4M16 2v4M3 10h18" />
            <path d="m8 15 2 2 5-5" />
          </svg>
          签到
        </a>
        <a
          v-if="hasPurchaseLink"
          class="btn btn-purchase"
          :href="item.purchaseUrl"
          target="_blank"
          rel="noopener noreferrer"
          :title="`购买 ${item.title} 注册码`"
          :aria-label="`购买 ${item.title} 注册码`"
          @click.prevent="openPurchaseLink"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 8h12l1 12H5L6 8Z" />
            <path d="M9 8a3 3 0 0 1 6 0" />
          </svg>
          购买
        </a>
      </div>
    </div>
  </article>

  <Teleport to="body">
    <div
      v-if="viewerOpen"
      ref="viewerEl"
      class="image-viewer"
      tabindex="-1"
      role="presentation"
      @click.self="closeViewer"
      @keydown.esc="closeViewer"
      @keydown.left.prevent="previousImage"
      @keydown.right.prevent="nextImage"
    >
      <section class="image-dialog" role="dialog" aria-modal="true" :aria-label="`${item.title} 图片预览`">
        <header class="image-dialog-header">
          <div class="image-dialog-title">
            <span class="image-dialog-kicker">图片预览</span>
            <h2>{{ item.title }}</h2>
          </div>
          <button class="viewer-close" type="button" title="关闭预览" aria-label="关闭预览" @click="closeViewer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div
          class="image-stage"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <button class="viewer-nav viewer-nav-prev" type="button" title="上一张" aria-label="上一张" @click="previousImage">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <img :src="currentImage" :alt="`${item.title} 图片 ${activeImageIndex + 1}`" />
          <button class="viewer-nav viewer-nav-next" type="button" title="下一张" aria-label="下一张" @click="nextImage">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        <div class="image-dialog-footer">
          <div class="image-counter" aria-live="polite">{{ activeImageIndex + 1 }} / {{ imageSources.length }}</div>
          <div class="image-thumbs" role="list" aria-label="图片缩略图">
            <button
              v-for="(image, index) in imageSources"
              :key="image"
              class="image-thumb"
              :class="{ active: index === activeImageIndex }"
              type="button"
              :title="`查看第 ${index + 1} 张`"
              :aria-label="`查看第 ${index + 1} 张图片`"
              :aria-current="index === activeImageIndex ? 'true' : undefined"
              @click="showImage(index)"
            >
              <img :src="image" :alt="`${item.title} 缩略图 ${index + 1}`" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useFavorites } from "../composables/useFavorites.js";
import { useToast } from "../composables/useToast.js";
import { useFilters } from "../composables/useFilters.js";
import { resolveAssetUrls } from "../utils/resolveAssetUrl.js";

const props = defineProps({
  item: { type: Object, required: true },
  tone: { type: String, default: "sage" },
});

const { isFavorite, toggleFavorite } = useFavorites();
const { copyText, push } = useToast();
const { activeTag, searchQuery, activeCategory } = useFilters();

const isFav = computed(() => isFavorite(props.item.url));
const imageSources = computed(() =>
  resolveAssetUrls(Array.isArray(props.item.images) ? props.item.images : [])
);
const hasImages = computed(() => imageSources.value.length > 0);
const hasCheckinLink = computed(() => Boolean(props.item.checkinUrl));
const hasPurchaseLink = computed(() => Boolean(props.item.purchaseUrl));
const updatedDate = computed(() => {
  if (!props.item.updatedAt) return null;
  const date = new Date(props.item.updatedAt);
  return Number.isNaN(date.getTime()) ? null : date;
});
const hasUpdatedAt = computed(() => Boolean(updatedDate.value));
const formattedUpdatedAt = computed(() => {
  if (!updatedDate.value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(updatedDate.value).replaceAll("/", "-");
});
const isStale = computed(() => {
  if (!updatedDate.value) return true;
  const staleAfterDays = Number(props.item.staleAfterDays ?? 30);
  const ageDays = (Date.now() - updatedDate.value.getTime()) / 86400000;
  return ageDays > (Number.isFinite(staleAfterDays) && staleAfterDays > 0 ? staleAfterDays : 30);
});
const updatedStatus = computed(() => {
  if (!updatedDate.value) return "没有记录条目更新时间";
  return isStale.value ? "条目超过复核周期，建议重新确认" : "条目在复核周期内";
});
const viewerOpen = ref(false);
const activeImageIndex = ref(0);
const currentImage = computed(() => imageSources.value[activeImageIndex.value] || "");
const viewerEl = ref(null);
const touchStartX = ref(null);
const previousBodyOverflow = ref("");

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

function openPurchaseLink() {
  if (!hasPurchaseLink.value) return;
  window.open(props.item.purchaseUrl, "_blank", "noopener,noreferrer");
}

function openCheckinLink() {
  if (!hasCheckinLink.value) return;
  window.open(props.item.checkinUrl, "_blank", "noopener,noreferrer");
}

function openViewer() {
  if (!hasImages.value) return;
  activeImageIndex.value = 0;
  viewerOpen.value = true;
}

function closeViewer() {
  viewerOpen.value = false;
}

function showImage(index) {
  if (!hasImages.value) return;
  activeImageIndex.value = (index + imageSources.value.length) % imageSources.value.length;
}

function previousImage() {
  showImage(activeImageIndex.value - 1);
}

function nextImage() {
  showImage(activeImageIndex.value + 1);
}

function handleTouchStart(event) {
  touchStartX.value = event.changedTouches?.[0]?.clientX ?? null;
}

function handleTouchEnd(event) {
  if (touchStartX.value === null) return;
  const endX = event.changedTouches?.[0]?.clientX ?? touchStartX.value;
  const distance = endX - touchStartX.value;
  touchStartX.value = null;
  if (Math.abs(distance) < 40) return;
  if (distance > 0) previousImage();
  else nextImage();
}

watch(viewerOpen, async (open) => {
  if (open) {
    previousBodyOverflow.value = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    await nextTick();
    viewerEl.value?.focus();
  } else {
    document.body.style.overflow = previousBodyOverflow.value;
  }
});

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow.value;
});
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

.title-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.5rem;
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

.updated-at {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: var(--text-muted);
  font-size: 0.68rem;
  line-height: 1.2;
  white-space: nowrap;
}

.updated-at.stale,
.updated-at.missing {
  color: var(--danger);
}

.stale-badge {
  border: 1px solid color-mix(in srgb, var(--danger) 35%, transparent);
  border-radius: 9999px;
  padding: 0.08rem 0.35rem;
  color: var(--danger);
  background: var(--danger-soft);
  font-size: 0.64rem;
  line-height: 1.2;
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
  flex-wrap: wrap;
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

.btn-view {
  color: var(--text-secondary);
}

.btn-checkin {
  border-color: color-mix(in srgb, var(--accent) 42%, var(--border-strong));
  color: var(--accent-strong);
}

.btn-checkin:hover {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface-1));
}

.btn-purchase {
  border-color: color-mix(in srgb, #d97706 42%, var(--border-strong));
  color: #a16207;
}

.btn-purchase:hover {
  background: color-mix(in srgb, #f59e0b 12%, var(--surface-1));
}

:root[data-theme="dark"] .btn-purchase {
  color: #f5c26b;
}

.btn-view:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
}

.btn-count {
  min-width: 1rem;
  padding: 0 0.22rem;
  border-radius: 9999px;
  background: color-mix(in srgb, currentColor 12%, transparent);
  font-size: 0.68rem;
  line-height: 1.1rem;
  text-align: center;
}

.image-viewer {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(5px);
}

.image-dialog {
  display: flex;
  flex-direction: column;
  width: min(62rem, 100%);
  max-height: min(46rem, calc(100vh - 2rem));
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: 0.75rem;
  background: var(--surface-1);
  box-shadow: var(--shadow-raised);
}

.image-dialog-header,
.image-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.image-dialog-header {
  border-bottom: 1px solid var(--border-hairline);
}

.image-dialog-title {
  min-width: 0;
}

.image-dialog-kicker {
  display: block;
  margin-bottom: 0.15rem;
  color: var(--text-muted);
  font-size: 0.7rem;
}

.image-dialog-title h2 {
  margin: 0;
  overflow: hidden;
  font-size: 1rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer-close,
.viewer-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-strong);
  background: var(--surface-1);
  color: var(--text-primary);
  cursor: pointer;
}

.viewer-close {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
}

.viewer-close:hover,
.viewer-nav:hover {
  background: var(--surface-2);
}

.image-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 18rem;
  height: min(62vh, 34rem);
  background: #101416;
  touch-action: pan-y;
}

.image-stage > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
}

.viewer-nav {
  position: absolute;
  z-index: 1;
  top: 50%;
  width: 2.5rem;
  height: 2.5rem;
  border-color: rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.58);
  color: #fff;
  transform: translateY(-50%);
}

.viewer-nav:hover {
  background: rgba(15, 23, 42, 0.8);
}

.viewer-nav-prev { left: 0.75rem; }
.viewer-nav-next { right: 0.75rem; }

.image-dialog-footer {
  align-items: flex-start;
  border-top: 1px solid var(--border-hairline);
}

.image-counter {
  flex-shrink: 0;
  padding-top: 0.25rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.image-thumbs {
  display: flex;
  gap: 0.4rem;
  max-width: 100%;
  overflow-x: auto;
  padding-bottom: 0.1rem;
}

.image-thumb {
  width: 4.25rem;
  height: 3rem;
  flex: 0 0 auto;
  padding: 0;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 0.375rem;
  background: var(--surface-2);
  cursor: pointer;
  opacity: 0.62;
}

.image-thumb.active,
.image-thumb:hover {
  border-color: var(--accent);
  opacity: 1;
}

.image-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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

@media (max-width: 640px) {
  .actions {
    flex-wrap: wrap;
  }

  .image-viewer {
    padding: 0.5rem;
  }

  .image-dialog {
    max-height: calc(100vh - 1rem);
  }

  .image-stage {
    min-height: 14rem;
    height: 54vh;
  }

  .image-dialog-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .image-thumbs {
    width: 100%;
  }
}
</style>

import { ref, watch } from "vue";

const STORAGE_KEY = "rr-favorites";

const favorites = ref(readFavorites());

function readFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((url) => typeof url === "string"))]
      : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value));
  } catch {
    /* ignore */
  }
}

function isFavorite(url) {
  return favorites.value.includes(url);
}

function toggleFavorite(url) {
  const i = favorites.value.indexOf(url);
  if (i === -1) favorites.value.unshift(url);
  else favorites.value.splice(i, 1);
  persist();
}

watch(favorites, persist, { deep: true });

export function useFavorites() {
  return { favorites, isFavorite, toggleFavorite };
}

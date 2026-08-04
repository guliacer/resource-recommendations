import { ref } from "vue";

const searchQuery = ref("");
const activeCategory = ref("all");
const activeTag = ref("");

function resetFilters() {
  searchQuery.value = "";
  activeCategory.value = "all";
  activeTag.value = "";
}

export function useFilters() {
  return { searchQuery, activeCategory, activeTag, resetFilters };
}

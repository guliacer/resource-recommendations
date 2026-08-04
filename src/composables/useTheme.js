import { ref, watch } from "vue";

const THEME_KEY = "rr-theme";
const theme = ref(localStorage.getItem(THEME_KEY) || "light");

function applyTheme(value) {
  theme.value = value;
  document.documentElement.setAttribute("data-theme", value);
  localStorage.setItem(THEME_KEY, value);
}

function initTheme() {
  applyTheme(theme.value);
}

function toggleTheme() {
  applyTheme(theme.value === "light" ? "dark" : "light");
}

watch(theme, (v) => document.documentElement.setAttribute("data-theme", v));

export function useTheme() {
  return { theme, toggleTheme, initTheme };
}
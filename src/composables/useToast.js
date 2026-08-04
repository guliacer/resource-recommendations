import { ref, watch } from "vue";

const toasts = ref([]);
let seed = 0;

function push(message, type = "success") {
  const id = ++seed;
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    const i = toasts.value.findIndex((t) => t.id === id);
    if (i !== -1) toasts.value.splice(i, 1);
  }, 2200);
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error("Clipboard API unavailable");
    }
    push("已复制到剪贴板");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      if (!document.execCommand("copy")) throw new Error("Copy command failed");
      push("已复制到剪贴板");
    } catch {
      push("复制失败，请手动复制链接", "error");
    } finally {
      textarea.remove();
    }
  }
}

export function useToast() {
  return { toasts, push, copyText };
}

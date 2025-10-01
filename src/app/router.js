import { showCategory, showViewer, showSearch } from "../ui/Viewer.js";

export function initRouter() {
  window.addEventListener("hashchange", handle);
  handle();
}

function handle() {
  const h = location.hash.slice(1);
  if (!h || h === "/") {
    location.hash = "/c/application-ui";
    return;
  }

  if (h.startsWith("/c/")) {
    const parts = h.split("/");
    const category = parts[2];
    const slug = parts.slice(3).join("/");
    if (slug) showViewer(category, slug);
    else showCategory(category);
    return;
  }

  if (h.startsWith("/search")) {
    const q = new URLSearchParams(h.split("?")[1]).get("q") || "";
    showSearch(q);
    return;
  }

  // fallback
  document.getElementById("main").innerHTML =
    `<p class="text-red-600">404 - Route không tồn tại</p>`;
}

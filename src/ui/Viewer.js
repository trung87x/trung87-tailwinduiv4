import { buildCatalog, htmlFiles } from "../core/catalog.js";
import { renderInSandbox } from "../core/sandbox.js";

let CATALOG = null;

export async function showCategory(category) {
  if (!CATALOG) CATALOG = await buildCatalog();
  const items = CATALOG.filter((m) => m.category === category);
  const main = document.getElementById("main");
  main.innerHTML = `
    <h1 class="text-xl font-semibold mb-3">Category: ${category}</h1>
    <ul class="space-y-2">
      ${items
        .map(
          (m) => `
        <li>
          <a class="text-blue-600 hover:underline"
             href="#/c/${m.category}/${m.slug}">${m.title}</a>
          <span class="text-xs text-zinc-500">(${m.variants.length} variant)</span>
        </li>`,
        )
        .join("")}
    </ul>
  `;
}

export async function showViewer(category, slug) {
  if (!CATALOG) CATALOG = await buildCatalog();
  const meta = CATALOG.find((m) => m.category === category && m.slug === slug);
  const main = document.getElementById("main");
  if (!meta) {
    main.innerHTML = `<p>Không tìm thấy meta.</p>`;
    return;
  }

  // --- UI ---
  main.innerHTML = `
    <h1 class="text-xl font-semibold mb-4">${meta.title}</h1>
    <div class="space-y-6">
      ${meta.variants
        .map(
          (v) => `
      <section class="border rounded overflow-hidden">
        <header class="flex items-center justify-between px-3 py-2 border-b">
          <div class="font-medium">${v.label}</div>
          <div class="flex items-center gap-2 text-sm">
            <!-- Segmented: Preview | Code -->
            <div class="inline-flex rounded border overflow-hidden" role="tablist">
              <button class="px-3 py-1.5" data-tab="${v.id}" data-to="preview">Preview</button>
              <button class="px-3 py-1.5 border-l" data-tab="${v.id}" data-to="code">Code</button>
            </div>
            <!-- Device widths -->
            <div class="inline-flex rounded border overflow-hidden">
              <button class="px-2 py-1.5" title="Mobile" data-w="${v.id}" data-size="480">📱</button>
              <button class="px-2 py-1.5 border-l" title="Tablet" data-w="${v.id}" data-size="1024">📟</button>
              <button class="px-2 py-1.5 border-l" title="Desktop" data-w="${v.id}" data-size="1280">🖥️</button>
              <button class="px-2 py-1.5 border-l" title="Full" data-w="${v.id}" data-size="full">↔</button>
            </div>
            <!-- Dark -->
            <button class="px-2 py-1.5 rounded border" data-dark="${v.id}" title="Dark mode">🌙</button>
            <!-- Lang -->
            <select class="px-2 py-1.5 rounded border bg-white" data-lang="${v.id}">
              <option value="html" selected>HTML</option>
              <option value="react" disabled>React</option>
              <option value="vue" disabled>Vue</option>
            </select>
            <!-- Copy -->
            <button class="px-2 py-1.5 rounded border" data-copy="${v.id}" title="Copy code">📋</button>
          </div>
        </header>

        <div class="p-3">
          <!-- vùng cuộn ngang -->
          <div id="scroll-${v.id}" class="overflow-x-auto">
            <!-- khung bọc có width đúng bằng iframe để cuộn -->
            <div id="wrap-${v.id}" class="inline-block w-full px-4">
              <iframe id="pv-${v.id}" class="block w-full h-[420px] bg-white rounded shadow-sm"></iframe>
            </div>
          </div>

          <!-- Code -->
          <pre id="box-${v.id}" class="hidden bg-zinc-900 text-zinc-50 p-3 text-sm overflow-auto mt-3 rounded">
<code id="code-${v.id}">Loading…</code>
          </pre>
        </div>
      </section>
      `,
        )
        .join("")}
    </div>
  `;

  // --- Nạp và gắn hành vi cho từng variant ---
  for (const v of meta.variants) {
    const html = await htmlFiles[v.path]();

    // Render preview mặc định
    const iframe = document.getElementById(`pv-${v.id}`);
    let isDark = false;
    await renderInSandbox(iframe, html, {
      dark: isDark,
      alpine: meta.deps?.alpine,
    });

    // Hiện code (escaped để an toàn)
    document.getElementById(`code-${v.id}`).textContent = html;

    // Tab switch
    const wrap = document.getElementById(`wrap-${v.id}`);
    const codeBox = document.getElementById(`box-${v.id}`);
    const tabBtns = [...document.querySelectorAll(`[data-tab="${v.id}"]`)];
    function switchTab(to) {
      const showPreview = to === "preview";
      wrap.classList.toggle("hidden", !showPreview);
      codeBox.classList.toggle("hidden", showPreview);
      tabBtns.forEach((b) =>
        b.classList.toggle("bg-zinc-100", b.dataset.to === to),
      );
    }
    tabBtns.forEach((b) => (b.onclick = () => switchTab(b.dataset.to)));
    switchTab("preview");

    // Device widths — đổi width của CHÍNH iframe ✅
    function applyWidth(size) {
      // ✅ CHANGED
      if (size === "full") {
        iframe.style.width = "100%";
        wrap.style.maxWidth = "none";
        wrap.style.marginLeft = "";
        wrap.style.marginRight = "";
      } else {
        const px = String(size).endsWith("px") ? String(size) : `${size}px`;
        iframe.style.width = px; // ✅ CHANGED
        wrap.style.maxWidth = px; // center cho gọn
        wrap.style.marginLeft = "auto";
        wrap.style.marginRight = "auto";
      }
    }
    applyWidth("full");
    document.querySelectorAll(`[data-w="${v.id}"]`).forEach((b) => {
      b.onclick = () => applyWidth(b.dataset.size);
    });

    // Dark toggle
    document.querySelector(`[data-dark="${v.id}"]`).onclick = async () => {
      isDark = !isDark;
      await renderInSandbox(iframe, html, {
        dark: isDark,
        alpine: meta.deps?.alpine,
      });
    };

    // Copy
    document.querySelector(`[data-copy="${v.id}"]`).onclick = () =>
      navigator.clipboard.writeText(html);
  }
}

function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}

export async function showSearch(q) {
  document.getElementById("main").innerHTML = `
    <h1 class="text-xl font-semibold mb-3">Search: "${q}"</h1>
    <p class="text-zinc-600">Kết quả sẽ hiển thị sau I-1-8.</p>
  `;
}

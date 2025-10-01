import html from "./AppShell.html?raw";

export async function mountAppShell(host) {
  host.innerHTML = html;

  // Search
  const form = host.querySelector("#searchForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = form.querySelector("#q").value || "";
    location.hash = `/search?q=${encodeURIComponent(q)}`;
  });

  // Sidebar links
  host.querySelector("#sidebar").innerHTML = `
    <nav class="space-y-1 text-sm">
      <a class="block px-2 py-1 rounded hover:bg-zinc-100" href="#/c/application-ui">application-ui</a>
      <a class="block px-2 py-1 rounded hover:bg-zinc-100" href="#/c/ecommerce">ecommerce</a>
      <a class="block px-2 py-1 rounded hover:bg-zinc-100" href="#/c/faq">faq</a>
      <a class="block px-2 py-1 rounded hover:bg-zinc-100" href="#/c/marketing">marketing</a>
      <a class="block px-2 py-1 rounded hover:bg-zinc-100" href="#/c/custom">custom</a>
    </nav>
  `;
}

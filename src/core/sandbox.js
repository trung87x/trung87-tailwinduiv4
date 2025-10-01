// /src/core/sandbox.js
const MIN_IFRAME_HEIGHT = 320;

export function renderInSandbox(
  iframe,
  html,
  { dark = false, alpine = false } = {},
) {
  if (iframe.__sandboxObserver) {
    iframe.__sandboxObserver.disconnect();
    iframe.__sandboxObserver = null;
  }

  iframe.style.height = `${MIN_IFRAME_HEIGHT}px`;

  return new Promise((resolve) => {
    const handleLoad = () => {
      iframe.removeEventListener("load", handleLoad);

      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        if (!doc || !win) {
          resolve();
          return;
        }

        const adjustHeight = () => {
          const { documentElement: docEl, body } = doc;
          const nextHeight = Math.max(
            MIN_IFRAME_HEIGHT,
            docEl?.scrollHeight ?? 0,
            body?.scrollHeight ?? 0,
            docEl?.offsetHeight ?? 0,
            body?.offsetHeight ?? 0,
          );
          iframe.style.height = `${nextHeight}px`;
        };

        adjustHeight();

        if (typeof win.ResizeObserver === "function") {
          const ro = new win.ResizeObserver(adjustHeight);
          ro.observe(doc.documentElement);
          ro.observe(doc.body);
          iframe.__sandboxObserver = ro;
        }
      } finally {
        resolve();
      }
    };

    iframe.addEventListener("load", handleLoad, { once: true });

    iframe.srcdoc = `<!doctype html>
<html lang="en" class="${dark ? "dark" : ""}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
  ${alpine ? '<script defer src="https://unpkg.com/alpinejs"></script>' : ""}
  <style>
    :root {
      color-scheme: light dark;
    }
    html, body { min-height: 100%; }
    body {
      margin: 0;
      background: ${dark ? "#09090b" : "#f4f4f5"};
      transition: background-color 150ms ease;
    }
  </style>
</head>
<body class="min-h-dvh p-4">
${html}
</body>
</html>`;
  });
}

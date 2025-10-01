import appCssUrl from "../app/style.css?url";

export async function renderInSandbox(
  iframe,
  html,
  { dark = false, alpine = false } = {},
) {
  const doc = iframe.contentDocument;
  doc.open();
  doc.write(`<!doctype html>
<html lang="en" class="${dark ? "dark" : ""}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="${appCssUrl}"></link>
  ${alpine ? '<script defer src="https://unpkg.com/alpinejs"></script>' : ""}
  <style>
    html, body { height:auto; }
    body {
      margin: 0;
      background: ${dark ? "#09090b" : "#f4f4f5"};
      color: ${dark ? "#e4e4e7" : "#09090b"};
    }
  </style>
</head>
<body class="p-4">
${html}
<script>
(function(){
  // cấu hình min/max theo nhu cầu
  const MIN = 10, MAX = 900;

  function measure() {
    const root = document.documentElement;
    const body = document.body;
    const h = Math.max(root.scrollHeight, body ? body.scrollHeight : 0);
    const clamped = Math.min(MAX, Math.max(MIN, h));
    // frameElement là chính thẻ <iframe> ở parent
    if (frameElement) frameElement.style.height = clamped + "px";
  }

  const ro = new ResizeObserver(() => requestAnimationFrame(measure));
  ro.observe(document.documentElement);
  if (document.body) ro.observe(document.body);

  addEventListener("load", measure, true);
  setTimeout(measure, 0);
})();
</script>
</body>
</html>`);
  doc.close();
}

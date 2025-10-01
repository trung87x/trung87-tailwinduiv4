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
  <!-- Dùng Tailwind CDN trong iframe để đảm bảo breakpoints -->
  <script src="https://cdn.tailwindcss.com"></script>
  ${alpine ? '<script defer src="https://unpkg.com/alpinejs"></script>' : ""}
  <style>
    /* Giúp nội dung tự co theo khung, tránh tràn */
    html, body { height: 100%; }
    body { margin: 0; background: #f4f4f5; }
  </style>
</head>
<body class="min-h-dvh p-4">
${html}
</body>
</html>`);
  doc.close();
}

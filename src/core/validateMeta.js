export function validateMeta(m) {
  const need = ["title", "slug", "category", "variants"];
  for (const k of need) if (!(k in m)) throw new Error(`meta thiếu "${k}"`);
  if (!Array.isArray(m.variants) || m.variants.length === 0) {
    throw new Error("meta.variants phải có ít nhất 1 phần tử");
  }
  return m;
}

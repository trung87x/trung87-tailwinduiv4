import { validateMeta } from "./validateMeta.js";

const metaFiles = import.meta.glob("/src/components/**/meta.json", {
  eager: true,
  import: "default",
});

export const htmlFiles = import.meta.glob("/src/components/**/**/*.html", {
  as: "raw",
});

export async function buildCatalog() {
  const list = [];
  for (const path in metaFiles) {
    const raw = metaFiles[path];
    const meta = validateMeta ? validateMeta(raw) : raw;

    meta.variants = meta.variants.map((v) => ({
      ...v,
      path: path.replace("meta.json", v.file),
    }));

    meta._key = `${meta.category}/${meta.slug}`;
    list.push(meta);
  }
  list.sort((a, b) => (a._key > b._key ? 1 : -1));
  return list;
}

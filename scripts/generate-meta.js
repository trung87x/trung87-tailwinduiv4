import { promises as fs } from "fs";
import path from "path";

const ROOT = path.resolve("src/components");

const ACRONYMS = new Map([
  ["ui", "UI"],
  ["faq", "FAQ"],
  ["cta", "CTA"],
  ["api", "API"],
  ["id", "ID"],
  ["pdf", "PDF"],
]);

function toTitleSegment(segment) {
  const words = segment.split(/[-_]+/).filter(Boolean);
  if (words.length === 0) return "";
  return words
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return ACRONYMS.get(lower);
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function toLabel(base) {
  return toTitleSegment(base);
}

function toId(base) {
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureMeta(dir) {
  const metaPath = path.join(dir, "meta.json");
  try {
    await fs.access(metaPath);
    return; // already exists
  } catch (err) {
    // ignore
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (htmlFiles.length === 0) {
    return;
  }

  const relative = path.relative(ROOT, dir);
  if (!relative) return;
  const segments = relative.split(path.sep).filter(Boolean);
  if (segments.length === 0) return;
  const [category, ...slugSegments] = segments;
  if (!category || slugSegments.length === 0) {
    return;
  }

  const title = slugSegments.map(toTitleSegment).join(" – ");
  const variants = htmlFiles.map((file) => {
    const base = file.replace(/\.html$/, "");
    return {
      id: toId(base),
      label: toLabel(base),
      file,
    };
  });

  const meta = {
    title,
    slug: slugSegments.join("/"),
    category,
    tags: [],
    variants,
    props: {},
  };

  const json = JSON.stringify(meta, null, 2);
  await fs.writeFile(metaPath, `${json}\n`, "utf8");
  console.log(`Created ${path.relative(process.cwd(), metaPath)}`);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  await ensureMeta(dir);
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await walk(path.join(dir, entry.name));
    }
  }
}

walk(ROOT).catch((err) => {
  console.error(err);
  process.exit(1);
});

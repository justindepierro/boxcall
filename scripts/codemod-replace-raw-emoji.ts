#!/usr/bin/env ts-node
/**
 * codemod-replace-raw-emoji.ts
 * Replaces disallowed raw emojis with lucide-react icon components to satisfy custom ESLint rule.
 * Idempotent: skips if component already present.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

// Map emoji to lucide icon + accessible label
const EMOJI_MAP: Record<
  string,
  { icon: string; label: string; fallback?: string }
> = {
  "🎉": { icon: "PartyPopper", label: "celebration" },
  "💡": { icon: "Lightbulb", label: "idea" },
  "🚀": { icon: "Rocket", label: "launch" },
  "📍": { icon: "MapPin", label: "location" },
  "👕": { icon: "Shirt", label: "jersey" },
  "🪖": { icon: "Shield", label: "helmet" },
  "🧤": { icon: "Hand", label: "glove" },
  "👟": { icon: "Circle", label: "shoe" },
  "🎓": { icon: "GraduationCap", label: "graduation" },
  "🛠": { icon: "Wrench", label: "tools" },
  "🔧": { icon: "Wrench", label: "wrench" },
  "🔍": { icon: "Search", label: "search" },
  "🌱": { icon: "Sprout", label: "growth" },
  "👥": { icon: "Users", label: "team" },
  "📋": { icon: "ClipboardList", label: "clipboard" },
  "📥": { icon: "Inbox", label: "inbox" },
  "🔄": { icon: "RefreshCw", label: "refresh" },
  "🗑": { icon: "Trash2", label: "trash" },
  "🧪": { icon: "FlaskConical", label: "experiment" },
  "🚧": { icon: "Construction", label: "construction" },
  "📅": { icon: "Calendar", label: "calendar" },
  "📸": { icon: "Camera", label: "camera" },
  "🔗": { icon: "Link", label: "link" },
  "📡": { icon: "Satellite", label: "satellite" },
  "🐌": { icon: "Snail", label: "slow" },
};

function gatherFiles(dir: string, acc: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) gatherFiles(full, acc);
    else if (e.isFile() && full.endsWith(".tsx")) acc.push(full);
  }
  return acc;
}

function ensureImport(content: string, needed: Set<string>): string {
  if (!needed.size) return content;
  const importRegex = /import\s+{([^}]+)}\s+from\s+'lucide-react';?/;
  const neededArr = [...needed];
  if (importRegex.test(content)) {
    return content.replace(importRegex, (m, group) => {
      const existing = group
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const icon of neededArr)
        if (!existing.includes(icon)) existing.push(icon);
      return `import { ${existing.sort().join(", ")} } from 'lucide-react';`;
    });
  }
  // Insert at top after first import block
  const firstImport = content.indexOf("import");
  if (firstImport >= 0) {
    const lineEnd = content.indexOf("\n", firstImport);
    return (
      content.slice(0, lineEnd + 1) +
      `import { ${neededArr.sort().join(", ")} } from 'lucide-react';\n` +
      content.slice(lineEnd + 1)
    );
  }
  return (
    `import { ${neededArr.sort().join(", ")} } from 'lucide-react';\n` + content
  );
}

function transformFile(file: string): void {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;
  const needed = new Set<string>();

  for (const [emoji, { icon, label }] of Object.entries(EMOJI_MAP)) {
    if (content.includes(emoji)) {
      const component = `<${icon} aria-label="${label}" className="inline h-4 w-4 align-middle text-current" />`;
      const newContent = content.split(emoji).join(component);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        needed.add(icon);
      }
    }
  }

  if (modified) {
    content = ensureImport(content, needed);
    fs.writeFileSync(file, content, "utf8");
    console.log(
      `✅ Updated ${path.relative(ROOT, file)} (${[...needed].join(", ")})`
    );
  }
}

const files = gatherFiles(SRC);
files.forEach(transformFile);

console.log("Codemod complete. Run eslint to verify.");

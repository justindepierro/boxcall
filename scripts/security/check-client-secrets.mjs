import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const TARGET_DIR = path.join(PROJECT_ROOT, "src");

const FILE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

const FORBIDDEN_PATTERNS = [
  {
    name: "service-role-env-var",
    regex: /\b(VITE_)?SUPABASE_SERVICE_ROLE_KEY\b/g,
  },
  {
    name: "service-role-jwt-claim",
    regex: /\bservice_role\b/g,
  },
  {
    // Generic JWT structure; high signal if it ever lands in src.
    name: "jwt-token",
    regex: /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
  },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip common non-source directories if they exist under src.
      if (entry.name === "__snapshots__") continue;
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name);
    if (!FILE_EXTENSIONS.has(ext)) continue;

    files.push(fullPath);
  }

  return files;
}

function positionToLineCol(text, index) {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  const col = before.length - before.lastIndexOf("\n");
  return { line, col };
}

function excerpt(text, index, length = 120) {
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + length);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

async function main() {
  const files = await walk(TARGET_DIR);

  const findings = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");

    for (const pattern of FORBIDDEN_PATTERNS) {
      pattern.regex.lastIndex = 0;

      let match;
      while ((match = pattern.regex.exec(content))) {
        const { line, col } = positionToLineCol(content, match.index);
        findings.push({
          file: path.relative(PROJECT_ROOT, file),
          pattern: pattern.name,
          line,
          col,
          match: match[0],
          excerpt: excerpt(content, match.index),
        });
      }
    }
  }

  if (findings.length === 0) {
    console.log("✅ No client secrets detected in src/");
    return;
  }

  console.error(
    "🚨 Client secret check failed. Forbidden patterns found in src/\n"
  );

  for (const f of findings) {
    console.error(
      `- ${f.file}:${f.line}:${f.col} [${f.pattern}] ${f.match} :: ${f.excerpt}`
    );
  }

  console.error(
    "\nFix: remove service role keys/tokens from client code. Service role keys must only exist in server-side scripts/workflows and never ship to the browser."
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("Client secret check crashed:", err);
  process.exit(1);
});

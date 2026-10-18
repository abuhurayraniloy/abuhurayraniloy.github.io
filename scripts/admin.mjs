import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT_DIR, "content");
const SETTINGS_FILE = path.join(CONTENT_DIR, "settings.json");
const UPLOADS_DIR = path.join(ROOT_DIR, "public", "uploads");
const UI_FILE = path.join(__dirname, "admin-ui.html");

const COLLECTIONS = ["posts", "projects", "journals"];

function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getEntries() {
  const entries = [];
  for (const col of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, col);
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        if (!file.isFile() || !file.name.endsWith(".md")) continue;
        const filePath = path.join(dir, file.name);
        const source = await fs.readFile(filePath, "utf-8");
        const parsed = matter(source);
        const slug = file.name.replace(/\.md$/, "");
        const stat = await fs.stat(filePath);

        const words = (parsed.content || "")
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;

        entries.push({
          collection: col,
          slug,
          filename: file.name,
          title: parsed.data.title || slug,
          description: parsed.data.description || "",
          date: parsed.data.date
            ? new Date(parsed.data.date).toISOString().slice(0, 10)
            : "",
          tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
          draft: Boolean(parsed.data.draft),
          wordCount: words,
          modified: stat.mtimeMs,
        });
      }
    } catch (err) {
      if (err.code !== "ENOENT") console.error(`Error reading ${col}:`, err);
    }
  }
  return entries.sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.modified - a.modified);
}

async function getEntry(collection, slug) {
  if (!COLLECTIONS.includes(collection)) throw new Error("Invalid collection");
  const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  const source = await fs.readFile(filePath, "utf-8");
  const parsed = matter(source);
  return {
    collection,
    slug,
    data: {
      title: parsed.data.title || "",
      description: parsed.data.description || "",
      date: parsed.data.date
        ? new Date(parsed.data.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
      draft: Boolean(parsed.data.draft),
    },
    content: parsed.content || "",
  };
}

async function saveEntry({ collection, slug, oldSlug, data, content }) {
  if (!COLLECTIONS.includes(collection)) throw new Error("Invalid collection");
  const cleanSlug = slugify(slug);
  if (!cleanSlug) throw new Error("Slug cannot be empty");

  const dir = path.join(CONTENT_DIR, collection);
  await fs.mkdir(dir, { recursive: true });

  // If renaming, remove previous file
  if (oldSlug && oldSlug !== cleanSlug) {
    const oldPath = path.join(dir, `${oldSlug}.md`);
    try {
      await fs.unlink(oldPath);
    } catch (e) {
      if (e.code !== "ENOENT") console.warn("Failed to remove old file:", e);
    }
  }

  const targetPath = path.join(dir, `${cleanSlug}.md`);

  // Ensure clean frontmatter values
  const frontmatter = {
    title: data.title || cleanSlug,
    description: data.description || "",
    date: data.date || new Date().toISOString().slice(0, 10),
  };
  if (Array.isArray(data.tags) && data.tags.length > 0) {
    frontmatter.tags = data.tags;
  }
  if (data.draft) {
    frontmatter.draft = true;
  }

  const fileContent = matter.stringify(content.trim() ? `${content.trim()}\n` : "\n", frontmatter);
  await fs.writeFile(targetPath, fileContent, "utf-8");

  return { success: true, slug: cleanSlug, collection };
}

async function deleteEntry(collection, slug) {
  if (!COLLECTIONS.includes(collection)) throw new Error("Invalid collection");
  const targetPath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  await fs.unlink(targetPath);
  return { success: true };
}

async function getSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveSettings(settings) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n", "utf-8");
  return { success: true };
}

async function handleUpload(name, base64Data) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const ext = path.extname(name) || ".png";
  const baseName = slugify(path.basename(name, ext)) || "image";
  const filename = `${Date.now()}-${baseName}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, filename);

  const buffer = Buffer.from(base64Data, "base64");
  await fs.writeFile(targetPath, buffer);
  return { url: `/uploads/${filename}`, filename };
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) {
        reject(new Error("Upload payload exceeds 50MB limit"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

// Request Handler
async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  try {
    // Serve Web UI
    if (pathname === "/" || pathname === "/admin") {
      const html = await fs.readFile(UI_FILE, "utf-8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    // Serve Uploaded Media
    if (pathname.startsWith("/uploads/")) {
      const filename = path.basename(pathname);
      const filePath = path.join(UPLOADS_DIR, filename);
      try {
        const data = await fs.readFile(filePath);
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".svg": "image/svg+xml",
        };
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
        res.end(data);
        return;
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
    }

    // API Routes
    if (pathname === "/api/entries" && method === "GET") {
      const entries = await getEntries();
      return sendJson(res, 200, entries);
    }

    if (pathname === "/api/entry" && method === "GET") {
      const collection = parsedUrl.searchParams.get("collection");
      const slug = parsedUrl.searchParams.get("slug");
      if (!collection || !slug) return sendJson(res, 400, { error: "Missing collection or slug" });
      const entry = await getEntry(collection, slug);
      return sendJson(res, 200, entry);
    }

    if (pathname === "/api/entry" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await saveEntry(body);
      return sendJson(res, 200, result);
    }

    if (pathname === "/api/entry" && method === "DELETE") {
      const body = await parseJsonBody(req);
      const result = await deleteEntry(body.collection, body.slug);
      return sendJson(res, 200, result);
    }

    if (pathname === "/api/settings" && method === "GET") {
      const settings = await getSettings();
      return sendJson(res, 200, settings);
    }

    if (pathname === "/api/settings" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await saveSettings(body);
      return sendJson(res, 200, result);
    }

    if (pathname === "/api/upload" && method === "POST") {
      const body = await parseJsonBody(req);
      if (!body.name || !body.data) return sendJson(res, 400, { error: "Missing name or data" });
      const result = await handleUpload(body.name, body.data);
      return sendJson(res, 200, result);
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  } catch (err) {
    console.error("API error:", err);
    sendJson(res, 500, { error: err.message || "Internal Server Error" });
  }
}

// Server Startup
const server = http.createServer(handleRequest);

function openBrowser(url) {
  const start = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  spawn(start, [url], { shell: true, stdio: "ignore" }).on("error", () => {});
}

async function startServer(port = 3333) {
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n======================================================`);
    console.log(`✨ Content Studio is active!`);
    console.log(`🚀 Open in your browser: ${url}`);
    console.log(`======================================================\n`);
    openBrowser(url);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer();

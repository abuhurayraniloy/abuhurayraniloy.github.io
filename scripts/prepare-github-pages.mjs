import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = join(process.cwd(), "dist", "client");

async function prepareDirectoryRoutes(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);
    if (entry.isDirectory()) {
      await prepareDirectoryRoutes(source);
      continue;
    }
    if (!entry.name.endsWith(".html") && !entry.name.endsWith(".rsc")) continue;
    if (entry.name === "index.html" || entry.name === "404.html") continue;
    const extension = entry.name.slice(entry.name.lastIndexOf("."));
    const route = join(directory, entry.name.slice(0, -extension.length), `index${extension}`);
    await mkdir(dirname(route), { recursive: true });
    await copyFile(source, route);
  }
}

await prepareDirectoryRoutes(root);
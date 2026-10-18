import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__filename), "..");

async function publish() {
  console.log("\n🚀 Publishing website to GitHub Pages...\n");

  try {
    const { stdout: status } = await execAsync("git status --porcelain", { cwd: ROOT_DIR });
    
    if (status.trim()) {
      console.log("📦 Staging changed files...");
      await execAsync("git add -A", { cwd: ROOT_DIR });

      const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
      const commitMsg = `content: publish updates (${timestamp})`;
      console.log(`📝 Committing: "${commitMsg}"...`);
      await execAsync(`git commit -m "${commitMsg}"`, { cwd: ROOT_DIR });
    } else {
      console.log("ℹ️  No new file changes to commit.");
    }

    console.log("⬆️  Pushing to GitHub (origin/main)...");
    const { stdout: pushOut, stderr: pushErr } = await execAsync("git push origin main", { cwd: ROOT_DIR });
    if (pushOut) console.log(pushOut.trim());
    if (pushErr) console.log(pushErr.trim());

    console.log("\n=======================================================");
    console.log("✅ Published successfully!");
    console.log("🌐 GitHub Actions is deploying your site.");
    console.log("🔗 Live site: https://abuhurayraniloy.github.io");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("\n❌ Failed to publish:", err.message || err);
    process.exit(1);
  }
}

publish();

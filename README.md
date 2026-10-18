# Abu Hurayra Niloy — Portfolio

A small personal website for [abuhurayraniloy.github.io](https://abuhurayraniloy.github.io), built with React, vinext, and Markdown.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by vinext. The site is developed locally and deployed through GitHub Actions.

Run the checks before publishing:

```bash
npm test
npm run lint
```

## Writing & Content Management

You can write and manage content easily using the local **Content Studio**:

```bash
npm run admin
```

This launches a web dashboard at `http://localhost:3333` with:
- **Instant creation**: 1-click new Blog posts, Projects, or Journals
- **Live Markdown preview**: Split-screen typing and rendered view
- **Frontmatter automation**: Auto-generates slugs, today's date, and tags
- **Direct image uploads**: Automatically saves to `public/uploads/` and inserts into Markdown
- **Drafts & Search**: Filter and search across all content
- **Site Settings**: Edit your profile bio, contacts, and home intro (`content/settings.json`)
- **1-Click Publishing**: Click **"🚀 Publish Site"** right in the UI to commit and push changes directly to GitHub
- **Auto-Publish Toggle**: Check "Auto-publish on save" to automatically deploy when saving live posts

## Publishing & Deployment

To publish your local changes to the live site, you can choose any of these methods:

1. **From Content Studio UI**: Click the green **"🚀 Publish Site"** button in the header (or enable **"Auto-publish on save"**).
2. **From Terminal (1-step command)**:
   ```bash
   npm run publish
   ```
   This stages changes, commits with a timestamp, and pushes to GitHub.
3. **Manual Git Push**:
   ```bash
   git add .
   git commit -m "content: update posts"
   git push origin main
   ```

GitHub Actions will automatically build and deploy your static site to [abuhurayraniloy.github.io](https://abuhurayraniloy.github.io).

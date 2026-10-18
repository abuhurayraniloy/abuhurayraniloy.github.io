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

Alternatively, raw Markdown files can be edited in `content/`:
- Blogs: `content/posts/`
- Projects: `content/projects/`
- Journals: `content/journals/`
- Home and contact details: `content/settings.json`

## Deployment

The GitHub Actions workflow builds and deploys the static site. Set GitHub Pages Source to GitHub Actions, then push to main.

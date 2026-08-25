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

## Content editing

Content is stored in `content/` and can be edited through the owner-only Pages CMS setup.

- Blogs: `content/posts/`
- Projects: `content/projects/`
- Journals: `content/journals/`
- Home and contact details: `content/settings.json`

The public website has no editor, search, theme switcher, or content-management controls.

## Deployment

The GitHub Actions workflow builds and deploys the static site. Set GitHub Pages Source to GitHub Actions, then push to main.

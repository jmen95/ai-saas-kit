# Documentation site

Next.js app that renders the markdown guides from the monorepo [`docs/`](../../docs/) folder.

## Development

```bash
npm run dev --workspace=docs
```

Open [http://localhost:3002](http://localhost:3002).

Port **3002** avoids conflicting with the API (3001) and web app (3000).

## How it works

- Markdown files are read from `../../docs` at build time
- Routes map to filenames: `getting-started.md` → `/getting-started`
- Navigation is defined in `lib/docs-nav.ts`

## Add a new page

1. Create `docs/your-page.md` at the repo root `docs/` folder
2. Add an entry to `lib/docs-nav.ts`
3. Rebuild or refresh dev server

# Beauty Professionals Magazine / Journal

A premium black-and-white editorial website built with Next.js, Drizzle,
TipTap, and Vercel Blob.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- ESLint
- npm

## Install

```bash
npm install
```

## Local development

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Public article pages can use development fixtures from
`features/articles/data/article-fixtures.ts` during `next dev`, but the fixture
list is empty by default. Set `USE_DATABASE_ARTICLES=true` when you want the
public site to read local database records instead. Admin pages always use
database records.

## Build

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

## Deploy on Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository into [Vercel](https://vercel.com/).
3. Keep the default Next.js build settings.
4. Deploy.

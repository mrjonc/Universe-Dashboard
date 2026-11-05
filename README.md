# Universe Dashboard

A dashboard for managing shows, a personal roster, and championships in a WWE
Universe. The interface is in English and supports keyboard navigation,
visible focus, reduced motion, and keyboard-accessible dialogs.

## Requirements

- Node.js and npm
- A Supabase project configured with the tables used by the app

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never expose an administrative or `service_role` key in the front end.

## Personal championship titles

Championships created in the app belong to the signed-in account. Before using
the create/delete title actions, apply
[`supabase/migrations/20261105000000_user_owned_championships.sql`](./supabase/migrations/20261105000000_user_owned_championships.sql)
to the Supabase database (for example, in the Supabase SQL Editor). It adds
ownership and row-level security while keeping existing titles with a `NULL`
owner shared and readable.

## Development

```sh
npm install
npm run dev
```

## Verification

```sh
npm run lint
npm run build
```

Pages are loaded on demand to reduce the initial JavaScript bundle.

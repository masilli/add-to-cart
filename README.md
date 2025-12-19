# add-to-cart

Small demo app for a shopping list. Replaced Firebase with a server-side Neon (Postgres) connection via Netlify Functions.

Quick start (local):

```bash
npm install
npm run dev
```

Netlify function development (requires `netlify-cli`):

```bash
npm install
export NEON_CONNECTION_STRING="your-neon-connection-string"
npm run dev:netlify
```

Neon DB setup (Postgres):

1. In Neon console create a database and run this SQL to create the table:

```sql
CREATE TABLE shopping_list (
	id SERIAL PRIMARY KEY,
	item TEXT UNIQUE NOT NULL,
	created_at TIMESTAMP DEFAULT now()
);
```

2. Set `NEON_CONNECTION_STRING` (or `DATABASE_URL`) in Netlify Site > Site settings > Build & deploy > Environment variables.

API secret (optional)
- You can set `API_SECRET` in Netlify environment variables to add a minimal protection layer for mutating requests.
- If `API_SECRET` is set, the client must send the secret in the `x-api-key` header for `POST` and `DELETE` calls. Note: embedding a secret in client-side code exposes it publicly — for stronger protection use Netlify Identity or a server-side-only flow.

Migration file
- A migration file is included at `scripts/migrate.sql`. Run it in the Neon SQL console to create the `shopping_list` table.


3. Deploy to Netlify. The site will call `/.netlify/functions/items` for CRUD.

Notes:
- The server enforces uniqueness and prevents exposing DB credentials to the client.
- To test functions locally use `netlify dev` and set the same env var in your shell.


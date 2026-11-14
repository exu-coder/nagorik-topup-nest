<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Product catalog and prices live in `src/lib/catalog.ts`; `quote()` is the only price source and the server recomputes it before every payment. Why: the browser must never choose its own amount.
- NagorikPay calls go only through `src/lib/nagorikpay.server.ts` (server-only); webhooks land on `/api/public/nagorikpay` and must pass the HMAC check in `src/lib/nagorikpay-signature.ts` (Web Crypto) before anything else. Why: the webhook URL is public.
- The app is dark-only; theme tokens live in `:root` in `src/styles.css` with no `.dark` block. Why: single brand look, no theme toggle.
- Accounts, wallet, orders and admin are pending until the owner's external database project is connected. Why: the owner chose their own project over the built-in backend.

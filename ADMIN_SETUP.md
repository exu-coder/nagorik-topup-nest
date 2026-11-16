# MFJ TOP UP Admin Panel

The admin area is integrated into the existing TanStack Start application.

## Routes

- `/dev` — private admin sign-in and first-admin setup.
- `/dev/dashboard` — protected admin workspace.

## First-time setup

1. Confirm the app's Supabase URL and publishable key are configured in the deployment environment.
2. In Supabase Authentication, enable Email + Password sign-in.
3. Deploy the application and open `/dev`.
4. Enter the email address and password you want to use for the owner account, then choose **Create the first admin account**.
5. If email confirmation is enabled, confirm the email, return to `/dev`, and sign in with that account. The first authenticated account claims the admin role only while no admin exists.
6. After setup, sign in normally. Additional accounts must be granted the `admin` role by an existing trusted administrator through a secure database operation.

## Included features

- Overview: Dhaka-time revenue, paid order totals, delivery queue, last-seven-day revenue and order status breakdown.
- Orders: searchable recent orders, status changes, internal notes and CSV export.
- Products & pricing: edit package title, detail, BDT price, sort order and storefront visibility.
- Customers: search customers and block/unblock accounts.

## Security notes

- Admin access is checked with the database `has_role` function and every table operation is additionally protected by Supabase RLS policies.
- The browser uses only the Supabase publishable key. Never put `SUPABASE_SERVICE_ROLE_KEY` in a `VITE_*` variable or client-side source.
- Keep the `claim_first_admin` function's one-admin-only behavior. Do not expose any browser control that assigns arbitrary roles.
- The admin route sets `noindex,nofollow`; this is not a substitute for authentication.
- Rotate any API/payment secrets that were ever committed to a public repository and remove them from tracked files/history as appropriate.

## Build

```bash
bun install
bun run build
bun run test
```

TanStack's file-route plugin regenerates `src/routeTree.gen.ts` when the app starts/builds and discovers the new route files.

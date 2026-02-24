# HypeShelf

Collect and share the stuff you're hyped about. A full-stack recommendation hub built with Next.js 16, Convex, and Clerk.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui
- **Backend**: Convex (real-time database + serverless functions)
- **Auth**: Clerk (sign-in/sign-up, JWT-based session management)
- **Validation**: Zod (client-side) + manual validation (server-side)
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

## Features

- **Public homepage** -- browse the latest 5 recommendations without signing in
- **Staff Pick** -- a single highlighted recommendation chosen by an admin, displayed prominently
- **Authenticated dashboard** -- add, delete, and browse all recommendations with genre filtering
- **RBAC** -- role-based access control with `user` and `admin` roles enforced server-side
- **Real-time updates** -- Convex subscriptions push changes instantly to all connected clients

## Data Model

### `recommendations`

| Field        | Type      | Description                              |
| ------------ | --------- | ---------------------------------------- |
| `title`      | `string`  | 1-120 characters                         |
| `genre`      | `string`  | One of: horror, action, comedy, drama, sci-fi, other |
| `link`       | `string`  | Valid URL                                |
| `blurb`      | `string`  | Up to 300 characters                     |
| `userId`     | `string`  | Clerk user ID (set server-side)          |
| `userName`   | `string`  | Display name (denormalized)              |
| `isStaffPick`| `boolean` | Only one can be true at a time           |
| `createdAt`  | `number`  | Timestamp for ordering                   |

### `users`

| Field     | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| `clerkId` | `string` | Clerk user subject ID                    |
| `name`    | `string` | Display name from Clerk                  |
| `role`    | `string` | `"user"` (default) or `"admin"`          |

## RBAC

Roles are stored in the Convex `users` table and enforced **server-side** in every mutation. The client never sends a role or userId -- both are derived from the authenticated JWT via `ctx.auth.getUserIdentity()`.

| Action                  | `user` role | `admin` role |
| ----------------------- | ----------- | ------------ |
| View public homepage    | Yes         | Yes          |
| Create recommendation   | Yes         | Yes          |
| Delete own recommendation | Yes       | Yes          |
| Delete any recommendation | No        | Yes          |
| Mark/unmark Staff Pick  | No          | Yes          |

To promote a user to admin, edit their `role` field to `"admin"` in the Convex dashboard under **Data > users**.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A [Convex](https://convex.dev) account (free tier)
- A [Clerk](https://clerk.com) account (free tier)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CONVEX_URL=<your Convex deployment URL>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your Clerk publishable key>
CLERK_SECRET_KEY=<your Clerk secret key>
CLERK_JWT_ISSUER_DOMAIN=<your Clerk issuer domain>
```

**How to get these values:**

1. **NEXT_PUBLIC_CONVEX_URL** -- Sign in to [dashboard.convex.dev](https://dashboard.convex.dev), create a project, and copy the Deployment URL from Settings.
2. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY** -- Sign in to [dashboard.clerk.com](https://dashboard.clerk.com), create an application, and copy the keys from API Keys.
3. **CLERK_JWT_ISSUER_DOMAIN** -- In Clerk, go to JWT Templates, create a new "Convex" template, and copy the Issuer URL (e.g. `https://your-app.clerk.accounts.dev`).

### 3. Connect Clerk to Convex

In the Convex dashboard, go to **Settings > Authentication**, click **Add Auth Provider**, and paste the same Clerk Issuer URL.

### 4. Start the development servers

Terminal 1 (Convex -- deploys functions and watches for changes):

```bash
npx convex dev
```

Terminal 2 (Next.js):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  layout.tsx                    Root layout (ClerkProvider + ConvexProvider)
  page.tsx                      Public homepage
  dashboard/page.tsx            Authenticated dashboard
  globals.css                   Theme tokens (warm palette + staff-pick accent)

components/
  convex-client-provider.tsx    ConvexProviderWithClerk wiring
  recommendation-card.tsx       Card display + delete/staff-pick controls
  add-recommendation-form.tsx   Dialog form with Zod validation
  genre-filter.tsx              Genre select dropdown

convex/
  auth.config.ts                Clerk JWT issuer configuration
  schema.ts                     Database schema (recommendations + users)
  recommendations.ts            Queries (3) and mutations (3)
  users.ts                      User upsert, current user query, auth helper

lib/
  constants.ts                  Genre enum + type guard
  utils.ts                      cn() utility

middleware.ts                   Clerk route protection
```

## Deployment

### Backend (Convex)

```bash
npx convex deploy
```

This pushes functions and schema to a production Convex deployment.

### Frontend (Vercel)

1. Push the repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all four environment variables (use the **production** Convex URL and Clerk keys)
4. Deploy

### Post-deploy

- In the Convex production dashboard, add the Clerk issuer as an auth provider under **Settings > Authentication**
- To set up an admin, sign in to the deployed app, then find your user in the Convex dashboard's **Data > users** table and change the `role` to `"admin"`

## License

MIT

# SHARKMKT (Vite + React)

SHARKMKT is a bilingual (AR/EN) marketplace app with RTL/LTR support, onboarding, partner discovery, and admin operations using a local mock data layer (localStorage) plus Supabase auth/profile integration when env vars are configured.

## Run locally

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Environment variables

Create `.env` with:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If missing, auth/profile calls use a safe no-op fallback and local mock data still works.

## Admin account

- Only this email is treated as admin: `sharkmkt@sharkmkt.io`
- All other emails are regular users.

## Auth and onboarding flow

1. User logs in / signs up from `/auth`
2. If `onboardingCompleted !== true`, user is forced to `/onboarding`
3. After save/skip, user is redirected by account type:
   - Partner -> `/partner`
   - Seller -> `/sell`
   - Buyer -> `/browse`
   - Investor -> `/browse?filter=investor`
4. `/admin/*` routes are guarded for admin role only

## Main routes

- `/` Home
- `/auth` Auth
- `/onboarding` Onboarding
- `/partner` Partner search/list
- `/partner/publish` 5-step publish wizard
- `/messages` Messages
- `/browse` Browse listings
- `/pricing` Pricing
- `/help` Help center (user ticket submission)

Admin:

- `/admin` (redirects to dashboard)
- `/admin/dashboard`
- `/admin/users`
- `/admin/listings`
- `/admin/conversations`
- `/admin/help-center`
- `/admin/services`

## Local mock services

Service layer is under `src/services/`:

- `usersService` (user records + onboarding state + role assignment)
- `listingsService` (listings + service submissions)
- `conversationsService` (conversations/messages)
- `ticketsService` (help tickets + admin replies)
- `notificationsService` (admin-only notifications to `sharkmkt@sharkmkt.io`)

User actions (partner publish, listing CRUD, messages, help tickets) are synced into this layer so admin pages reflect live local activity.

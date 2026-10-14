# CineWave

CineWave is a Nepal-focused movie ticket booking system built with the existing React/Vite storefront and an Express/MongoDB API. Movies, cinemas, showtimes, and prices are managed in MongoDB by authorized administrators.

## Features

- Movie catalogue, search, filters and detail pages.
- City selection with cinema, movie, and showtime filtering backed by MongoDB.
- Showtime dates based on `Asia/Kathmandu`.
- Visual seat selection with server-side, conflict-safe reservations.
- Customer registration/login, private ticket history and cancellation.
- Admin-only movie, cinema, showtime, and booking management with server-side role checks.
- Live city and cinema counts, NPR pricing, and a pay-at-counter reservation flow.
- Online payment remains disabled; a backend preparation module documents future eSewa/Khalti integration points.

## Requirements

- Node.js 20 or newer
- MongoDB 6 or newer, running locally or hosted

## Run locally

1. Install packages:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` (PowerShell: `Copy-Item .env.example .env`) and set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and the admin seed email/password. Use a unique strong seed password; do not use the example values unchanged.

3. Create or update the initial admin account and worldwide catalogue:

   ```bash
   npm run seed
   ```

   This creates or resets the configured admin account, upserts verified worldwide movie records (with data notes for unverified fields), and upserts Nepal cinema venues. **No Nepal showtimes are invented** — schedule those in Admin → Showtimes only when confirmed. Set `SEED_CATALOGUE=false` to skip movies/venues. Existing booking and showtime records are left unchanged.

4. Start the API and frontend together:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). Sign up as a customer, or use the admin credentials configured in `.env`. The frontend proxies `/api` to `http://localhost:5000`.

If Vite reports `ECONNREFUSED` for `/api`, check the API startup output and confirm `http://localhost:5000/api/health` reports `"database":"connected"`. `npm run dev` starts the API alongside Vite; if you run Vite independently, start the API with `npm run dev:server`. The API requires a configured `.env` and a running MongoDB. Add cinemas, movies, then showtimes through the admin interface.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite frontend and API |
| `npm run dev:server` | Start the API with Node watch mode |
| `npm run start:server` | Start the API |
| `npm run seed` | Create or reset the configured admin account |
| `npm run build` | Create the production frontend build |
| `npm run preview` | Preview the production frontend |

The API defaults to port `5000`; set `PORT` to change it. Configure `FRONTEND_URL` if the frontend is hosted at a different origin. `VITE_API_URL` can override the frontend API base path.

## API overview

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Signed in |
| `POST` | `/api/auth/logout` | Signed in; invalidates issued sessions |
| `GET` | `/api/auth/users` | Admin |
| `GET` | `/api/movies` | Public |
| `GET` | `/api/movies/:id` | Public |
| `POST`, `PUT`, `DELETE` | `/api/movies[/:id]` | Admin |
| `GET` | `/api/theaters`, `/api/theaters?city=...` | Public |
| `GET` | `/api/theaters/stats` | Public; MongoDB city/cinema counts |
| `POST`, `PUT`, `DELETE` | `/api/theaters[/:id]` | Admin |
| `GET` | `/api/showtimes` | Public |
| `POST`, `PUT`, `DELETE` | `/api/showtimes[/:id]` | Admin |
| `GET` | `/api/bookings` | Signed in (own bookings; admin sees all) |
| `POST` | `/api/bookings` | Signed in |
| `PATCH` | `/api/bookings/:id/cancel` | Booking owner or admin |
| `PATCH` | `/api/bookings/:id/status` | Admin |

The API returns JSON errors with a `message` field. Booking totals are calculated by the API; clients cannot set price, user identity, booking status or cinema details. A reservation uses an atomic seat update and conflicts return HTTP 409. Movie, cinema, and showtime writes are validated on the server.

## Payment Preparation

`server/src/services/paymentService.js` is an inactive adapter boundary. It reports online payments as disabled and does not create payment sessions or collect payment data. Future integration work belongs at the provider adapter boundary: create a provider order from a server-verified booking amount, redirect to eSewa or Khalti, verify the signed provider callback server-side, then persist a verified transaction reference and update payment state. Do not mark a reservation as paid based only on a browser redirect. Until those steps are implemented and configured, reservations remain payable at the cinema counter.

No payment gateway credentials or additional environment variables are required or used.

## Project layout

```text
src/
  components/       Reusable storefront/admin UI
  context/          Authentication and booking-wizard state
   data/             No bundled catalogue fixtures
  layouts/          Storefront and admin layouts
  pages/            Customer and admin screens
  services/         Frontend API clients
server/src/
  middleware/       Authentication, role checks and errors
  models/           Mongoose schemas
  routes/           REST API routes
   seed.js           Admin account seed only
```

## Operational Notes

- Customer accounts are created through registration; there are no hard-coded customer credentials or client-side role switch.
- Admin role is assigned only to the account created through the environment-configured seed process.
- Logout invalidates issued tokens through a MongoDB-backed session version.
- Dates use `Asia/Kathmandu`; all displayed amounts are NPR. Online payments are not enabled, and a confirmed reservation is not a payment confirmation.
- `npm run build` is the available frontend verification command; no automated test script is configured in `package.json`.

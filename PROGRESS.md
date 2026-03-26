# RentFit — Progress Tracker

---

## ✅ Done So Far

### Project Structure
- Monorepo scaffold created (`apps/`, `server/`, `packages/`, `docs/`)
- `.gitignore`, `.gitattributes` configured

### Frontend (`apps/web`)
- Vite + React + Tailwind CSS v4 initialized
- `react-router-dom` installed and configured
- Routing: `/` → Home, `/listing/:id` → Detail, `/create` → Create Listing
- `Navbar.jsx` — fixed nav, scroll-aware, mobile hamburger
- `Button.jsx` — reusable, 4 variants, 3 sizes
- `ListingCard.jsx` — supports both API shape and dummy data shape
- `Home.jsx` — fetches real listings, loading skeleton, error state, search + category filter
- `ListingDetail.jsx` — fetches real listing by ID, loading skeleton, booking widget
- `CreateListing.jsx` — connected to API, auto deposit suggestion, redirects on success
- `constants/index.js` — categories list
- `hooks/useListings.js` — `useListings(filters)` + `useListing(id)` — real API
- `hooks/useAuth.js` — connected to real backend auth APIs
- `services/api.js` — centralized fetch wrapper with JWT + auth + listings endpoints
- `utils/helpers.js` — formatPrice, calculateDays, calculateRentalTotal, truncate

### Backend (`server/`)
- Express + MongoDB (Mongoose) setup
- Middleware order correct (cors + json before routes)
- `GET /api/test` — health check route
- **Auth System (MVP)**
  - `POST /api/auth/phone/send-otp` + `verify-otp`
  - `POST /api/auth/email/send-otp` + `verify-otp`
  - `POST /api/auth/google` — mock Google login
  - JWT middleware — protects private routes
- **Listings System (MVP)**
  - `GET /api/listings` — all active listings (filter by category, occasion, city)
  - `GET /api/listings/:id` — single listing
  - `POST /api/listings` — create listing (JWT protected)
- `Listing` model — full schema with userId ref, category, occasion, size, condition, location, images
- `listingService.js` — createListing, getAllListings, getListingById
- `listingController.js` — clean handlers, delegates to service
- `listingRoutes.js` — GET public, POST protected
- `User` model — phone, email, googleId, name, timestamps
- `authService.js`, `authController.js`, `authMiddleware.js`
- `helper.js` — successResponse + errorResponse

### Docs
- `docs/PRD.md` — product overview, MVP scope
- `docs/API.md` — endpoint list
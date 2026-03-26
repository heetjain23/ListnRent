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
- `ListingCard.jsx` — image, badge, price, rating, availability
- `Home.jsx` — hero, search, category filter, listing grid
- `ListingDetail.jsx` — image gallery, pricing, booking date picker
- `CreateListing.jsx` — full form, image upload preview, validation
- `constants/index.js` — 6 dummy listings + categories
- `hooks/useListings.js` — stub ready for API
- `hooks/useAuth.js` — connected to real backend auth APIs
- `services/api.js` — centralized fetch wrapper with JWT + all auth endpoints
- `utils/helpers.js` — formatPrice, calculateDays, calculateRentalTotal, truncate

### Backend (`server/`)
- Express + MongoDB (Mongoose) setup
- Middleware order fixed (cors + json before routes)
- `GET /api/test` — health check route
- **Auth System (MVP)**
  - `POST /api/auth/phone/send-otp` — generates + stores OTP in memory
  - `POST /api/auth/phone/verify-otp` — validates OTP, returns JWT + user
  - `POST /api/auth/email/send-otp` — same as phone flow
  - `POST /api/auth/email/verify-otp` — same as phone flow
  - `POST /api/auth/google` — mock Google login, returns JWT + user
- `User` model — phone, email, googleId, name, timestamps
- `authService.js` — OTP gen/store/validate, JWT gen, find-or-create user
- `authController.js` — clean handlers, no business logic
- `authMiddleware.js` — real JWT verification, attaches `req.user`
- `helper.js` — `successResponse` + `errorResponse`
- `jsonwebtoken` added to dependencies
- `.env.example` created

### Docs
- `docs/PRD.md` — product overview, MVP scope
- `docs/API.md` — endpoint list
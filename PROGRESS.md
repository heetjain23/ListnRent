# RentFit — Progress Tracker

---

## ✅ Done So Far

### Project Structure
- Monorepo scaffold created (`apps/`, `server/`, `packages/`, `docs/`)
- `.gitignore`, `.gitattributes` configured

### Frontend (`apps/web`)
- Vite + React + Tailwind CSS v4 initialized
- Folder structure created: `components/`, `pages/`, `services/`, `hooks/`, `utils/`, `constants/`
- `react-router-dom` installed and configured

### Routing (`App.jsx`)
- `/` → Home
- `/listing/:id` → Listing Detail
- `/create` → Create Listing

### Components
- `Navbar.jsx` — fixed nav, scroll-aware, mobile hamburger, active route highlight
- `Button.jsx` — reusable, supports 4 variants (primary, secondary, accent, ghost) and 3 sizes
- `ListingCard.jsx` — outfit card with image, category badge, price, owner rating, availability overlay

### Pages
- `Home.jsx` — hero section, search input, category filter pills, listing grid with dummy data
- `ListingDetail.jsx` — image gallery, pricing breakdown, dynamic booking date picker with total calculator
- `CreateListing.jsx` — full form with image upload preview, validation, error states, success screen

### Data & Logic
- `constants/index.js` — 6 dummy listings + category list
- `hooks/useListings.js` — stub ready to swap in real API call
- `hooks/useAuth.js` — OTP send/verify stub ready for backend
- `utils/helpers.js` — `formatPrice`, `calculateDays`, `calculateRentalTotal`, `truncate`

### Docs
- `docs/PRD.md` — product overview, MVP scope
- `docs/API.md` — endpoint list

### Backend (`server/`) — Boilerplate Only
- Express + MongoDB setup
- `POST /api/auth/send-otp` stubbed
- User model, auth middleware placeholder exist
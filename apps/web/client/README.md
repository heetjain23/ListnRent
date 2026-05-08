# ListnRent Web App 🌐

Frontend web application for ListnRent.

---

## ⚙️ Tech Stack

- React (Vite)
- Tailwind CSS

---

## 🚀 Setup

```bash
npm install
npm run dev

```

## 🌍 Environment Variables

Create a .env file:

VITE_API_URL=http://localhost:5000

### Site Rendering Mode

The client supports environment-based rendering via `VITE_SITE_MODE`.

- `VITE_SITE_MODE=production` -> renders only the Coming Soon page
- `VITE_SITE_MODE=preview` -> renders the full app (routes + features)
- `VITE_SITE_MODE=development` -> renders the full app
- `VITE_SITE_MODE=comingsoon` -> force Coming Soon page in any environment

Default files included:

- `.env.production` sets `VITE_SITE_MODE=production`
- `.env.preview` sets `VITE_SITE_MODE=preview`
- `.env.development` sets `VITE_SITE_MODE=development`

Vercel behavior:

- Production deployments build with `VITE_SITE_MODE=production`
- Preview deployments build with `VITE_SITE_MODE=preview`
- Development deployments build with `VITE_SITE_MODE=development`

## 📁 Structure

src/
├── assets/
├── components/
├── pages/
├── services/
├── hooks/
├── utils/
├── constants/

## 🎯 Features

Browse listings
View outfit details
Create listings
Booking flow (MVP)

## 🧠 Notes

Uses centralized API service
Designed for scalability with mobile app


---

# 📱 4. MOBILE README (`apps/mobile/README.md`)

```md
# ListnRent Mobile App 📱

Mobile application for ListnRent (iOS + Android).

---

## ⚙️ Tech Stack

- React Native (planned)

---

## 📌 Status

🚧 Not implemented yet

---

## 🎯 Goal

- Provide seamless mobile experience
- Reuse backend APIs from web

---

## 🔮 Planned Features

- Browse outfits
- Book rentals
- Manage listings
- Notifications

---

## 🧠 Notes

- Will use same backend APIs as web
- Designed after MVP validation

 just checking
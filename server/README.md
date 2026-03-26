# RentFit Backend 🖥️

Backend API for RentFit platform.

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)

---

## 🚀 Setup

```bash
npm install
npm run dev
```

## 🌍 Environment Variables

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret

## 📁 Structure

src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
├── utils/

## 🔌 API Overview

- Auth
POST /auth/send-otp
POST /auth/verify-otp

- Listings
POST /listings
GET /listings

- Bookings
POST /bookings

- Payments
POST /payments/create-order

## 🧠 Notes
Designed for both web and mobile apps
Follows REST API architecture

---

# 🚀 What You Do Now

1. Create all these files  
2. Paste content  
3. Run:

```bash
git add .
git commit -m "Initial project setup with structure and docs"
git push
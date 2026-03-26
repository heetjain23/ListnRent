# API Documentation (MVP)

## Base URL
http://localhost:5000/api

---

## Auth
POST /auth/send-otp  
POST /auth/verify-otp  

---

## Listings
POST /listings  
GET /listings  
GET /listings/:id  

---

## Bookings
POST /bookings  

---

## Payments
POST /payments/create-order  

---

## Notes
- All endpoints return JSON
- JWT authentication (planned)
# RentFit Mobile App 📱

## 🚧 Status
This mobile application is **planned for future development**.

This document serves as a **guideline for developers and AI tools** to build the mobile app consistently with the existing web platform and backend.

---

## 🎯 Objective

Build a **cross-platform mobile application (iOS + Android)** for RentFit that:

- Reuses the existing backend (Node.js + Express + MongoDB)
- Maintains consistent UI/UX with the web app
- Provides a smooth and fast mobile experience

---

## 🧠 Core Principle

> The mobile app is only a **client**.
> All business logic must remain in the backend.

- Do NOT duplicate backend logic in the app
- Always consume APIs from the server

---

## ⚙️ Recommended Tech Stack

- React Native (Expo preferred)
- JavaScript (or TypeScript)
- Axios / Fetch for API calls
- React Navigation for routing

---

## 🔌 Backend Integration

### Base URL

http://localhost:5000/api


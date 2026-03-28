import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
import "./config/firebase-admin.js";

import { connectDB } from "./config/db.js";
import listingRoutes from "./routes/listingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

// Routes
app.use("/api/listings", listingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/newsletter", newsletterRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Database + Start Server
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
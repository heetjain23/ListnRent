import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
import "./src/config/firebase-admin.js";

import { connectDB } from "./src/config/db.js";
import listingRoutes from "./src/routes/listingRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import newsletterRoutes from "./src/routes/newsletterRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import categoryVideoRoutes from "./src/routes/categoryVideoRoutes.js";

const app = express();

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({
  limit: "50mb",
}));
app.use(express.urlencoded({
  limit: "50mb",
  extended: true,
}));

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

// Routes
app.use("/api/listings", listingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/category-videos", categoryVideoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Database + Start Server
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  const NODE_ENV = process.env.NODE_ENV || "development";

  const server = app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Server running on port ${PORT} [${NODE_ENV}]`);
    console.log(`Allowed Origins: ${allowedOrigins.join(", ")}`);
    console.log(`${'='.repeat(60)}\n`);
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT signal received: closing HTTP server");
    server.close();
    process.exit(0);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
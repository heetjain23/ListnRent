import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
import "./src/config/firebase-admin.js";

import { connectDB } from "./src/config/db.js";
import listingRoutes from "./src/features/listings/listingRoutes.js";
import paymentRoutes from "./src/features/payments/paymentRoutes.js";
import cartRoutes from "./src/features/cart/cartRoutes.js";
import newsletterRoutes from "./src/features/newsletter/newsletterRoutes.js";
import userRoutes from "./src/features/users/userRoutes.js";
import adminRoutes from "./src/features/admin/adminRoutes.js";
import categoryVideoRoutes from "./src/features/category-videos/categoryVideoRoutes.js";
import messageRoutes from "./src/features/messages/messageRoutes.js";

// Socket.io
import { initSocketServer, attachIO } from "./src/socket/socketServer.js";

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/test", (req, res) => res.json({ message: "API working" }));

app.use("/api/listings", listingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/category-videos", categoryVideoRoutes);
app.use("/api/messages", messageRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  const NODE_ENV = process.env.NODE_ENV || "development";

  // Wrap Express in a raw HTTP server so Socket.io can share the same port
  const httpServer = createServer(app);

  // Init Socket.io and stash the io instance for use in controllers
  const io = initSocketServer(httpServer, allowedOrigins);
  attachIO(io);

  httpServer.listen(PORT, () => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Server + Socket.io running on port ${PORT} [${NODE_ENV}]`);
    console.log(`Allowed Origins: ${allowedOrigins.join(", ")}`);
    console.log(`${"=".repeat(60)}\n`);
  });

  const graceful = async (signal) => {
    console.log(`${signal} received: closing server`);
    httpServer.close(() => process.exit(0));
  };
  process.on("SIGTERM", () => graceful("SIGTERM"));
  process.on("SIGINT",  () => graceful("SIGINT"));
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
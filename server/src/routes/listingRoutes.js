import express from "express";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import {
  handleCreateListing,
  handleGetAllListings,
  handleGetListingById,
} from "../controllers/listingController.js";

const router = express.Router();

// Public routes
router.get("/", handleGetAllListings);
router.get("/:id", handleGetListingById);

// Protected routes - require Firebase authentication
router.post("/", verifyFirebaseToken, handleCreateListing);

export default router;
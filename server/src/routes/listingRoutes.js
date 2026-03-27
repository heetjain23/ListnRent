import express from "express";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import {
  handleCreateListing,
  handleGetAllListings,
  handleGetListingById,
  handleGetUserListings,
  handleUpdateListing,
  handleDeleteListing,
} from "../controllers/listingController.js";

const router = express.Router();

// Public routes
router.get("/", handleGetAllListings);

// Protected routes - require Firebase authentication
router.post("/", verifyFirebaseToken, handleCreateListing);
router.get("/user/listings/all", verifyFirebaseToken, handleGetUserListings);

// Public routes - single listing by ID (must come after specific routes)
router.get("/:id", handleGetListingById);
router.patch("/:id", verifyFirebaseToken, handleUpdateListing);
router.delete("/:id", verifyFirebaseToken, handleDeleteListing);

export default router;
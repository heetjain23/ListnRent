import express from "express";
import {
  handleCreateListing,
  handleGetAllListings,
  handleGetListingById,
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", handleGetAllListings);
router.get("/:id", handleGetListingById);

// Protected
router.post("/", protect, handleCreateListing);

export default router;
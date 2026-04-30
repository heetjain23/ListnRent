import express from "express";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import * as adminService from "../services/adminService.js";
import {
  handleDeleteCategoryVideo,
  handleGetAllCategoryVideos,
  handleGetCategoryVideoByCategory,
  handleUpsertCategoryVideo,
  handleUpdateCategoryVideo,
} from "../controllers/categoryVideoController.js";

const router = express.Router();

const requireAdminAccess = async (req, res, next) => {
  try {
    const email = req.user?.email;

    if (!email) {
      return res.status(403).json({
        success: false,
        message: "Admin email is required",
      });
    }

    const admin = await adminService.getAdminByEmail(email);

    if (!admin || admin.status !== "active" || !["admin", "super_admin"].includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage category videos",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Category video admin check error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify admin access",
    });
  }
};

router.get("/", handleGetAllCategoryVideos);
router.get("/:category", handleGetCategoryVideoByCategory);
router.post("/", verifyFirebaseToken, requireAdminAccess, handleUpsertCategoryVideo);
router.patch("/:id", verifyFirebaseToken, requireAdminAccess, handleUpdateCategoryVideo);
router.delete("/:id", verifyFirebaseToken, requireAdminAccess, handleDeleteCategoryVideo);

export default router;
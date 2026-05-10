import express from "express";
import { subscribeToNewsletter } from "./newsletterController.js";

const router = express.Router();

// POST: Subscribe to newsletter
router.post("/subscribe", subscribeToNewsletter);

export default router;

import express from "express";
import { handleValidationErrors } from "../../middleware/validationMiddleware.js";
import { validateSubscribeNewsletter } from "./newsletterValidation.js";
import { subscribeToNewsletter } from "./newsletterController.js";

const router = express.Router();

// POST: Subscribe to newsletter
router.post("/subscribe", validateSubscribeNewsletter, handleValidationErrors, subscribeToNewsletter);

export default router;

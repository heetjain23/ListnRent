import admin from "../config/firebase-admin.js";
import { errorResponse } from "../utils/helper.js";

// ----------------------------
// Firebase Token Verification
// Verifies Firebase ID tokens from frontend
// ----------------------------
export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Not authorized. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      firebaseUid: decodedToken.uid,
    };

    next();
  } catch (err) {
    console.error("[Auth Error]", err.message);
    return errorResponse(res, "Invalid or expired token.", 401);
  }
};
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { errorResponse } from "../utils/helper.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Not authorized. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-__v");

    if (!user) {
      return errorResponse(res, "User not found.", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, "Invalid or expired token.", 401);
  }
};
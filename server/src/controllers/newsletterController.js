import { addEmailToNewsletter } from "../services/newsletterService.js";

export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Add email to Google Sheet
    const result = await addEmailToNewsletter(email);

    return res.status(200).json({
      success: true,
      message: "Successfully subscribed to newsletter",
      data: result,
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to subscribe to newsletter",
    });
  }
};

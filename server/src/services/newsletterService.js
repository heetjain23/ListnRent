import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const sheets = google.sheets("v4");

// Initialize Auth
const auth = new google.auth.GoogleAuth({
  keyFile: "./firebase-service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_NEWSLETTER_ID;

export const addEmailToNewsletter = async (email) => {
  try {
    const authClient = await auth.getClient();

    // Get current data to find the next empty row
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:A",
    });

    const rows = response.data.values ? response.data.values.length : 0;
    const nextRow = rows + 1;

    // Append email with timestamp
    const timestamp = new Date().toISOString();
    const range = `Sheet1!A${nextRow}:C${nextRow}`;

    await sheets.spreadsheets.values.update({
      auth: authClient,
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: "RAW",
      resource: {
        values: [[email, new Date().toLocaleDateString(), timestamp]],
      },
    });

    return {
      success: true,
      message: "Email added to newsletter successfully",
      email: email,
    };
  } catch (error) {
    console.error("Error adding email to newsletter:", error);
    throw new Error("Failed to add email to newsletter");
  }
};

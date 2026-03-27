import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, "../../firebase-service-account.json");

let serviceAccount;

try {
  // Read service account key from file
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Service account file not found at: ${serviceAccountPath}\n` +
      "Please copy your Firebase service account key to: server/firebase-service-account.json\n" +
      "Get it from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key"
    );
  }

  const fileContent = fs.readFileSync(serviceAccountPath, "utf-8");
  serviceAccount = JSON.parse(fileContent);

  if (!serviceAccount.project_id) {
    throw new Error("Invalid Firebase service account configuration in firebase-service-account.json");
  }

  console.log(`[Firebase] Initialized with project: ${serviceAccount.project_id}`);
} catch (error) {
  console.error("[Firebase Error]", error.message);
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

export default admin;


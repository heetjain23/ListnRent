import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const renderSecretPath = "/etc/secrets/firebase-service-account.json"; // Render secret file
const localPath = path.join(__dirname, "../../firebase-service-account.json"); // Local development

let serviceAccountPath;
let serviceAccount;

// Determine which path to use (Render secret file takes priority)
if (fs.existsSync(renderSecretPath)) {
  serviceAccountPath = renderSecretPath;
} else {
  serviceAccountPath = localPath;
}

try {
  // Read service account key from file
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Service account file not found at: ${serviceAccountPath}\n` +
      "For Render: Add 'firebase-service-account.json' in Secret Files\n" +
      "For Local Development: Copy your Firebase service account key to: server/firebase-service-account.json\n" +
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

// Initialize Firebase Admin SDK (idempotent for hot-reload / nodemon restarts)
const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

const admin = {
  auth: () => getAuth(app),
};

export default admin;


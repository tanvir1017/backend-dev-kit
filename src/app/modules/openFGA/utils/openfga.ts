import { OpenFgaClient } from "@openfga/sdk";
import "dotenv/config";
import fs from "fs";
import path from "path";
import env from "../../../config/clean-env";

export const fga = new OpenFgaClient({
  apiUrl: `http://${env.FGA_API_HOST || "localhost"}:${env.FGA_API_PORT || "8080"}`,
  storeId: env.FGA_STORE_ID || undefined,
});

export async function ensureFGAStoreAndModel() {
  try {
    // Step 1: Handle store creation/retrieval
    let storeId = env.FGA_STORE_ID;

    if (!storeId) {
      console.log("No store ID found, creating new store...");
      const created = await fga.createStore({
        name: "Mityahuangs Store",
      });
      storeId = created.id;
      fga.storeId = storeId;

      // Update environment and .env file
      await persistStoreIdToEnv(storeId);
      console.log("✅ Created new FGA store:", storeId);
    } else {
      fga.storeId = storeId;
      console.log("✅ Using existing FGA store:", storeId);
    }

    // Step 2: Load and deploy authorization model
    await deployAuthorizationModel();

    console.log("🎉 FGA store and model setup complete!");
  } catch (error) {
    console.error("❌ Error initializing FGA:", error);
    throw error;
  }
}

async function persistStoreIdToEnv(storeId: string) {
  const envPath = path.join(process.cwd(), ".env");
  const storeIdLine = `FGA_STORE_ID=${storeId}`;

  try {
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");

      // Check if FGA_STORE_ID already exists
      if (envContent.includes("FGA_STORE_ID=")) {
        // Replace existing FGA_STORE_ID
        envContent = envContent.replace(/FGA_STORE_ID=.*/, storeIdLine);
      } else {
        // Append to end of file
        envContent += `\n${storeIdLine}\n`;
      }

      fs.writeFileSync(envPath, envContent);
    } else {
      // Create new .env file
      fs.writeFileSync(envPath, `${storeIdLine}\n`);
    }

    // Update process environment for current session
    process.env.FGA_STORE_ID = storeId;
  } catch (error) {
    console.warn("⚠️ Could not persist FGA_STORE_ID to .env:", error);
  }
}

async function deployAuthorizationModel() {
  try {
    const modelPath = path.join(__dirname, "openFGA.schema.json");

    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model file not found at: ${modelPath}`);
    }

    const modelContent = fs.readFileSync(modelPath, "utf8");
    const model = JSON.parse(modelContent);

    console.log("📋 Loading authorization model...");

    // Write the authorization model
    const response = await fga.writeAuthorizationModel(model);

    if (response.authorization_model_id) {
      console.log(
        "✅ Authorization model deployed. Model ID:",
        response.authorization_model_id,
      );

      // Optional: Store model ID in environment if needed
      process.env.FGA_AUTHORIZATION_MODEL_ID = response.authorization_model_id;
    }
  } catch (error) {
    console.error("❌ Failed to deploy authorization model:", error);
    throw error;
  }
}

// Helper function to check store health
export async function checkFGAHealth() {
  try {
    await fga.listStores();
    return true;
  } catch (error) {
    console.error("FGA health check failed:", error);
    return false;
  }
}

export default { fga, ensureFGAStoreAndModel, checkFGAHealth };

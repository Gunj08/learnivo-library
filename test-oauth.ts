import { uploadToGoogleDrive } from "./src/lib/googleDrive";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testUpload() {
    try {
        console.log("Starting OAuth2 upload test...");
        
        const buffer = Buffer.from("Hello world from Learnivo OAuth2 TypeScript test!");
        
        const fileId = await uploadToGoogleDrive({
            fileName: "oauth2-test-upload.txt",
            buffer,
            mimeType: "text/plain",
        });

        console.log("✅ Upload successful! File ID:", fileId);
    } catch (error) {
        console.error("❌ Test upload failed:");
        console.error(error);
    }
}

testUpload();

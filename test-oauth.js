const { uploadToGoogleDrive } = require("./src/lib/googleDrive");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function testUpload() {
    try {
        console.log("Starting OAuth2 upload test...");
        
        // Mock a simple text file buffer
        const buffer = Buffer.from("Hello world from Learnivo OAuth2 test!");
        
        const fileId = await uploadToGoogleDrive({
            fileName: "oauth2-test-upload.txt",
            buffer,
            mimeType: "text/plain",
        });

        console.log("✅ Upload successful! File ID:", fileId);
    } catch (error) {
        console.error("❌ Test upload failed:", error);
    }
}

testUpload();

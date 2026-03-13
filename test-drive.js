const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
require("dotenv").config({ path: ".env.local" });

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getGoogleAuth() {
    const credentialsPath = path.join(process.cwd(), "credentials.json");
    if (!fs.existsSync(credentialsPath)) {
        throw new Error("Google credentials.json not found at project root");
    }

    const raw = fs.readFileSync(credentialsPath, "utf-8");
    const credentials = JSON.parse(raw);

    const clientEmail = credentials.client_email;
    const privateKey = credentials.private_key;

    if (!clientEmail || !privateKey) {
        throw new Error("Invalid Google service account credentials");
    }

    return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: DRIVE_SCOPES,
    });
}

function bufferToStream(buffer) {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
}

async function testUpload() {
    try {
        console.log("Starting test upload...");
        console.log("Folder ID:", process.env.GOOGLE_DRIVE_FOLDER_ID);
        const auth = getGoogleAuth();
        const drive = google.drive({ version: "v3", auth });

        const targetFolder = process.env.GOOGLE_DRIVE_FOLDER_ID || "1wSsJDpDzJ9Nw6Mc-nX1GYzUCs-sMUaFl";

        const res = await drive.files.create({
            requestBody: {
                name: "test-upload.txt",
                parents: [targetFolder],
            },
            media: {
                mimeType: "text/plain",
                body: bufferToStream(Buffer.from("Hello world")),
            },
            fields: "id",
        });

        console.log("Upload successful! File ID:", res.data.id);
    } catch (error) {
        console.error("Test upload failed:", error.message);
        if (error.response && error.response.data) {
            console.error("Response data:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

testUpload();

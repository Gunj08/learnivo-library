import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

const DRIVE_SCOPES: string[] = ["https://www.googleapis.com/auth/drive.file"];

function loadEnvVariable(key: string): string | undefined {
    if (process.env[key]) return process.env[key];

    try {
        const candidatePaths = [
            path.join(process.cwd(), "..", ".env.local"),
            path.join(process.cwd(), ".env.local"),
        ];

        for (const p of candidatePaths) {
            if (!fs.existsSync(p)) continue;
            const content = fs.readFileSync(p, "utf-8");
            const line = content
                .split(/\r?\n/)
                .find((l) => l.trim().startsWith(`${key}=`));
            if (line) {
                const value = line.split("=", 2)[1]?.trim();
                if (value) return value;
            }
        }
    } catch {
        // ignore
    }
    return undefined;
}

function getGoogleAuth() {
    const clientId = loadEnvVariable("GOOGLE_CLIENT_ID");
    const clientSecret = loadEnvVariable("GOOGLE_CLIENT_SECRET");
    const refreshToken = loadEnvVariable("GOOGLE_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Missing Google OAuth2 credentials in .env.local (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)");
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return oauth2Client;
}

function bufferToStream(buffer: Buffer) {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
}

export async function uploadToGoogleDrive(options: {
    fileName: string;
    buffer: Buffer;
    mimeType: string;
    folderId?: string;
}): Promise<string> {
    const { fileName, buffer, mimeType, folderId } = options;

    const auth = getGoogleAuth();
    const drive = google.drive({ version: "v3", auth });

    const FALLBACK_FOLDER_ID = "1wSsJDpDzJ9Nw6Mc-nX1GYzUCs-sMUaFl";
    const envFolder =
        folderId ||
        loadEnvVariable("GOOGLE_DRIVE_FOLDER_ID") ||
        FALLBACK_FOLDER_ID;
    const targetFolder = envFolder;

    if (!targetFolder) {
        throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured");
    }

    const parents = [targetFolder];

    const res = await drive.files.create({
        requestBody: {
            name: fileName,
            parents,
        },
        media: {
            mimeType,
            body: bufferToStream(buffer),
        },
        fields: "id",
    });

    if (!res.data.id) {
        throw new Error("Failed to get file ID from Google Drive");
    }

    return res.data.id;
}

export async function deleteFromGoogleDrive(fileId: string): Promise<void> {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: "v3", auth });

    try {
        await drive.files.delete({ fileId });
    } catch (error: any) {
        console.error(`Failed to delete file ${fileId} from Google Drive:`, error);
        throw error;
    }
}

export async function createGoogleDriveFolder(folderName: string, parentFolderId?: string): Promise<string> {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: "v3", auth });

    const FALLBACK_FOLDER_ID = "1wSsJDpDzJ9Nw6Mc-nX1GYzUCs-sMUaFl";
    const envFolder =
        parentFolderId ||
        loadEnvVariable("GOOGLE_DRIVE_FOLDER_ID") ||
        FALLBACK_FOLDER_ID;

    if (!envFolder) {
        throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured");
    }

    const res = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [envFolder],
        },
        fields: "id",
    });

    if (!res.data.id) {
        throw new Error("Failed to create folder in Google Drive");
    }

    return res.data.id;
}


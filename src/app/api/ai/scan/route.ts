import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import getDb from "@/lib/db";
import { parseOcrText } from "@/lib/ocr-parser";
import { createWorker } from "tesseract.js";
import path from "path";
import fs from "fs";

async function authenticate() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");
        if (!session) return null;
        const db = getDb();
        return db.prepare("SELECT * FROM users WHERE id = ?").get(session.value) as any;
    } catch (e) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tmpDir = path.resolve(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tmpFile = path.resolve(tmpDir, `ocr-${Date.now()}.jpg`);

    let worker: any = null;

    try {
        const { imageBase64 } = await request.json();
        if (!imageBase64) return NextResponse.json({ error: "No image" }, { status: 400 });

        fs.writeFileSync(tmpFile, Buffer.from(imageBase64, "base64"));
        console.log("[OCR] Image saved to:", tmpFile);

        console.log("[OCR] Initializing worker...");
        worker = await createWorker("eng+hin", 1, {
            langPath: path.resolve(process.cwd()),
            gzip: false,
            // Minimal logger to avoid spam/memory issues
            logger: m => {
                if (m.status === 'recognizing text' && Math.round(m.progress * 100) % 25 === 0) {
                    console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        console.log("[OCR] Starting recognition...");
        const result = await worker.recognize(tmpFile);
        const { data } = result;

        console.log("[OCR] Recognition done. Confidence:", data.confidence);

        // Terminate immediately to free memory
        await worker.terminate();
        worker = null;
        console.log("[OCR] Worker cleaned up.");

        try { fs.unlinkSync(tmpFile); } catch { }

        console.log("[OCR] Parsing text...");
        const parsed = await parseOcrText(data.text);
        console.log("[OCR] Parsed Title:", parsed.title);

        return NextResponse.json({
            ...parsed,
            _debug: {
                ocrText: data.text,
                confidence: Math.round(data.confidence),
            }
        });

    } catch (error: any) {
        console.error("[OCR] Route Error:", error);
        if (worker) {
            try { await worker.terminate(); } catch { }
        }
        try { fs.unlinkSync(tmpFile); } catch { }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

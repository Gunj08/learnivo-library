import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import getDb from "@/lib/db";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import { uploadToGoogleDrive, createGoogleDriveFolder } from "@/lib/googleDrive";

// Next.js App Router: disable body size limit so large PDFs can be uploaded
export const maxDuration = 60; // seconds
export const dynamic = "force-dynamic";

// Helper to check auth
async function authenticate() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return null;
    const db = getDb();
    return db.prepare("SELECT * FROM users WHERE id = ?").get(session.value) as any;
}

// GET /api/books - List all books with search & filters
export async function GET(request: NextRequest) {
    const user = await authenticate();
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const board = searchParams.get("board");
    const grade = searchParams.get("grade");
    const subject = searchParams.get("subject");
    const language = searchParams.get("language");
    let status = searchParams.get("status");

    // Public users and regular users see ONLY approved books
    // Only admins can see pending or rejected books
    if (!user || user.role !== "admin") {
        status = "approved";
    }

    let query = "SELECT * FROM books WHERE 1=1";
    const params: any[] = [];

    if (q) {
        query += " AND (title LIKE ? OR author LIKE ? OR description LIKE ? OR tags LIKE ?)";
        const searchParam = `%${q}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
    }
    if (board) { query += " AND board = ?"; params.push(board); }
    if (grade) { query += " AND grade = ?"; params.push(grade); }
    if (subject) { query += " AND subject = ?"; params.push(subject); }
    if (language) { query += " AND language = ?"; params.push(language); }
    if (status) { query += " AND status = ?"; params.push(status); }

    query += " ORDER BY created_at DESC";

    const books = db.prepare(query).all(...params);
    return NextResponse.json(books);
}

// POST /api/books - Upload a new book
export async function POST(request: NextRequest) {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const subtitle = formData.get("subtitle") as string || "";
        const author = formData.get("author") as string;
        const publisher = formData.get("publisher") as string || "";
        const description = formData.get("description") as string || "";
        const board = formData.get("board") as string || "CBSE";
        const grade = formData.get("grade") as string || "10";
        const subject = formData.get("subject") as string || "";
        const language = formData.get("language") as string || "English";
        const tags = formData.get("tags") as string || "";
        const chapterTitles = formData.get("chapterTitles") as string;
        const bookFile = formData.get("bookFile") as File | null;
        const coverImage = formData.get("coverImage") as File | null;
        const chapterFiles = formData.getAll("chapterFiles") as File[];

        if (!title || !author) {
            return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
        }

        if (!bookFile && chapterFiles.length === 0) {
            return NextResponse.json({ error: "No book file or chapters uploaded" }, { status: 400 });
        }

        // Generate UID early to use as the folder name
        const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") + "-" + Date.now().toString().slice(-4);
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        const bytes = randomBytes(6);
        const uid = Array.from(bytes).map(b => chars[b % chars.length]).join("");

        // Local uploads dir is still used for cover images only
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Create a specific folder for this book in Google Drive using its UID
        let driveFolderId: string | undefined = undefined;
        let isAdmin = user.role === "admin";
        let status = isAdmin ? "approved" : "pending";

        if (isAdmin) {
            try {
                driveFolderId = await createGoogleDriveFolder(uid);
            } catch (err) {
                console.error("Failed to create Google Drive folder for book:", err);
            }
        }

        // 1. Upload main book PDF
        let bookFileName: string | null = null;
        if (bookFile) {
            const safeName = bookFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const buffer = Buffer.from(await bookFile.arrayBuffer());
            
            if (isAdmin) {
                try {
                    const driveFileId = await uploadToGoogleDrive({
                        fileName: safeName,
                        buffer,
                        mimeType: bookFile.type || "application/pdf",
                        folderId: driveFolderId,
                    });
                    bookFileName = driveFileId;
                } catch (err) {
                    console.error("Failed to upload book to Google Drive, falling back to local storage:", err);
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                    const localName = uniqueSuffix + "-" + safeName;
                    fs.writeFileSync(path.join(uploadsDir, localName), buffer);
                    bookFileName = localName;
                }
            } else {
                // Regular user: Save locally only
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const localName = `pending-${uniqueSuffix}-${safeName}`;
                fs.writeFileSync(path.join(uploadsDir, localName), buffer);
                bookFileName = localName;
            }
        }

        // 2. Save cover image to local disk (always local for thumbnails)
        let coverImageName: string | null = null;
        if (coverImage && coverImage.size > 0) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = coverImage.name.split(".").pop() || "jpg";
            coverImageName = `cover-${uniqueSuffix}.${ext}`;
            const buffer = Buffer.from(await coverImage.arrayBuffer());
            fs.writeFileSync(path.join(uploadsDir, coverImageName), buffer);
        }

        // 3. Upload chapter files
        const savedChapters: { fileName: string; title: string }[] = [];
        if (chapterFiles.length > 0) {
            const titles = JSON.parse(chapterTitles || "[]");
            for (let i = 0; i < chapterFiles.length; i++) {
                const cf = chapterFiles[i];
                if (cf.size === 0) continue;
                const safeName = cf.name.replace(/[^a-zA-Z0-9.-]/g, "_");
                const buffer = Buffer.from(await cf.arrayBuffer());
                let storedName: string;

                if (isAdmin) {
                    try {
                        const driveFileId = await uploadToGoogleDrive({
                            fileName: safeName,
                            buffer,
                            mimeType: cf.type || "application/pdf",
                            folderId: driveFolderId,
                        });
                        storedName = driveFileId;
                    } catch (err) {
                        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9) + i;
                        const localName = `ch-${uniqueSuffix}-${safeName}`;
                        fs.writeFileSync(path.join(uploadsDir, localName), buffer);
                        storedName = localName;
                    }
                } else {
                    // Regular user: Save chapters locally
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9) + i;
                    const localName = `pending-ch-${uniqueSuffix}-${safeName}`;
                    fs.writeFileSync(path.join(uploadsDir, localName), buffer);
                    storedName = localName;
                }
                
                savedChapters.push({
                    fileName: storedName,
                    title: titles[i] || `Chapter ${i + 1}`,
                });
            }
        }

        // 4. Insert into DB
        const db = getDb();

        const transaction = db.transaction(() => {
            const bookStmt = db.prepare(`
                INSERT INTO books (uid, title, subtitle, slug, author, publisher, description, board, grade, subject, language, tags, file_name, cover_image, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const info = bookStmt.run(
                uid, title, subtitle, slug, author, publisher, description,
                board, grade, subject, language, tags,
                bookFileName, coverImageName, status
            );
            const bookId = info.lastInsertRowid;

            // Insert chapter records
            if (savedChapters.length > 0) {
                const chapterStmt = db.prepare(
                    "INSERT INTO chapters (book_id, title, file_name, order_index) VALUES (?, ?, ?, ?)"
                );
                for (let i = 0; i < savedChapters.length; i++) {
                    chapterStmt.run(bookId, savedChapters[i].title, savedChapters[i].fileName, i);
                }
            }

            // Log activity
            db.prepare(
                "INSERT INTO activity_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)"
            ).run("upload", "book", bookId, `Book "${title}" uploaded (Status: ${status})`, user.id);

            return { id: bookId, slug, uid, status };
        });

        const result = transaction();
        return NextResponse.json({ ...result, message: status === "approved" ? "Book uploaded successfully" : "Book submitted for approval" });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


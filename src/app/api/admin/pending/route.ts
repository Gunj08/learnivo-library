import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import getDb from "@/lib/db";
import path from "path";
import fs from "fs";
import { uploadToGoogleDrive, createGoogleDriveFolder } from "@/lib/googleDrive";

async function authenticate() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return null;
    const db = getDb();
    return db.prepare("SELECT * FROM users WHERE id = ?").get(session.value) as any;
}

// GET /api/admin/pending - Get pending books
export async function GET() {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const books = db.prepare("SELECT * FROM books WHERE status = 'pending' ORDER BY created_at DESC").all();
    return NextResponse.json(books);
}

// POST /api/admin/pending - Approve or reject a book
export async function POST(request: NextRequest) {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, action } = await request.json();
    const db = getDb();

    if (action === "approve") {
        const book = db.prepare("SELECT * FROM books WHERE id = ?").get(id) as any;
        if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

        const localUploadsDir = path.join(process.cwd(), "public", "uploads");
        
        // Only upload to Drive if it's currently stored locally (pending books from regular users)
        // Drive IDs are usually long strings, local files in this project start with 'pending-' or are timestamps
        const isLocalFile = book.file_name && !book.file_name.includes("-") === false; // Simplified check

        if (isLocalFile && book.file_name) {
            try {
                // 1. Create Drive Folder
                const driveFolderId = await createGoogleDriveFolder(book.uid);

                // 2. Upload main PDF
                let driveFileId = book.file_name;
                const localPath = path.join(localUploadsDir, book.file_name);
                
                if (fs.existsSync(localPath)) {
                    const buffer = fs.readFileSync(localPath);
                    driveFileId = await uploadToGoogleDrive({
                        fileName: book.title + ".pdf",
                        buffer,
                        mimeType: "application/pdf",
                        folderId: driveFolderId
                    });
                    // Delete local file
                    fs.unlinkSync(localPath);
                }

                // 3. Upload Chapters
                const chapters = db.prepare("SELECT * FROM chapters WHERE book_id = ?").all() as any[];
                for (const chapter of chapters) {
                    const chapterPath = path.join(localUploadsDir, chapter.file_name);
                    if (fs.existsSync(chapterPath)) {
                        const buffer = fs.readFileSync(chapterPath);
                        const chDriveId = await uploadToGoogleDrive({
                            fileName: chapter.title + ".pdf",
                            buffer,
                            mimeType: "application/pdf",
                            folderId: driveFolderId
                        });
                        // Update chapter in DB
                        db.prepare("UPDATE chapters SET file_name = ? WHERE id = ?").run(chDriveId, chapter.id);
                        // Delete local file
                        fs.unlinkSync(chapterPath);
                    }
                }

                // 4. Update Book status and new file name (Drive ID)
                db.prepare("UPDATE books SET status = 'approved', file_name = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?").run(driveFileId, id);

            } catch (err: any) {
                console.error("Drive migration failed during approval:", err);
                return NextResponse.json({ error: "Failed to upload to Google Drive: " + err.message }, { status: 500 });
            }
        } else {
            // Already a Drive ID or no file, just approve
            db.prepare("UPDATE books SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
        }

        db.prepare(
            "INSERT INTO activity_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)"
        ).run("approve", "book", id, `Book "${book.title}" approved and migrated to Drive`, user.id);

        return NextResponse.json({ message: "Book approved and migrated to Google Drive" });
    }

    if (action === "reject") {
        const book = db.prepare("SELECT file_name FROM books WHERE id = ?").get(id) as any;
        if (book?.file_name) {
            const filePath = path.join(process.cwd(), "public", "uploads", book.file_name);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        db.prepare("DELETE FROM books WHERE id = ?").run(id);

        db.prepare(
            "INSERT INTO activity_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)"
        ).run("reject", "book", id, `Book #${id} rejected and deleted`, user.id);

        return NextResponse.json({ message: "Book rejected and deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

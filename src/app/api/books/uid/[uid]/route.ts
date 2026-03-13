import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { cookies } from "next/headers";
import { deleteFromGoogleDrive } from "@/lib/googleDrive";
import fs from "fs";
import path from "path";

// Helper to check auth
async function authenticate() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return null;
    const db = getDb();
    return db.prepare("SELECT * FROM users WHERE id = ?").get(session.value) as any;
}


// GET /api/books/uid/[uid] - Get a single book by its uid
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const db = getDb();
        const { uid } = await params;

        // Fetch the book by uid
        const book = db
            .prepare("SELECT * FROM books WHERE uid = ?")
            .get(uid) as any;

        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        // Fetch associated chapters
        const chapters = db
            .prepare(
                "SELECT * FROM chapters WHERE book_id = ? ORDER BY order_index ASC"
            )
            .all(book.id);

        return NextResponse.json({ ...book, chapters });
    } catch (error: any) {
        console.error("Error fetching book by uid:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/books/uid/[uid] - Delete a book
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        // const user = await authenticate();
        // if (!user) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }
        // For testing/convenience, allow any user to delete as requested
        const user = { id: 0 }; // Mock user for activity_log

        const db = getDb();
        const { uid } = await params;

        // Fetch the book first to get file names
        const book = db.prepare("SELECT * FROM books WHERE uid = ?").get(uid) as any;

        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        // Only admins can delete books (or the person who uploaded it if we tracked uploader_id, but here just checking auth)
        // Feel free to add stricter role checks if your user schema supports `role` = 'admin'

        // Get associated chapters
        const chapters = db.prepare("SELECT * FROM chapters WHERE book_id = ?").all(book.id) as any[];

        // 1. Delete from Google Drive or Local Disk
        const uploadsDir = path.join(process.cwd(), "public", "uploads");

        // Helper to delete a file by its ID or name
        const safeDeleteFile = async (fileName: string | null | undefined) => {
            if (!fileName) return;
            
            // Check if it's a local file first
            const localPath = path.join(uploadsDir, fileName);
            if (fs.existsSync(localPath)) {
                try {
                    fs.unlinkSync(localPath);
                } catch(e) { console.error("Could not delete local file:", e); }
                return;
            }

            // Otherwise, try to delete from Google Drive (assuming it's a Drive File ID)
            try {
                await deleteFromGoogleDrive(fileName);
            } catch (e: any) {
                // If it's a 404 from Drive, it's already gone, which is fine.
                console.error(`Could not delete Drive file ${fileName}:`, e.message);
            }
        };

        // Delete main book file
        await safeDeleteFile(book.file_name);
        
        // Delete cover image
        await safeDeleteFile(book.cover_image);

        // Delete chapter files
        for (const chap of chapters) {
            await safeDeleteFile(chap.file_name);
        }

        // 2. Delete from Database
        const transaction = db.transaction(() => {
            // Chapters are deleted via foreign key CASCADE usually, but explicit deletion is safe
            db.prepare("DELETE FROM chapters WHERE book_id = ?").run(book.id);
            db.prepare("DELETE FROM books WHERE id = ?").run(book.id);
            
            // Log deletion
            db.prepare(
                "INSERT INTO activity_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)"
            ).run("delete", "book", book.id, `Book "${book.title}" deleted`, user.id);
        });

        transaction();

        return NextResponse.json({ success: true, message: "Book deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting book:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import getDb from "@/lib/db";

async function authenticate() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return null;
    const db = getDb();
    return db.prepare("SELECT * FROM users WHERE id = ?").get(session.value) as any;
}

export async function GET() {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();

    const totalBooks = (db.prepare("SELECT COUNT(*) as count FROM books").get() as any).count;
    const approvedBooks = (db.prepare("SELECT COUNT(*) as count FROM books WHERE status = 'approved'").get() as any).count;
    const pendingBooks = (db.prepare("SELECT COUNT(*) as count FROM books WHERE status = 'pending'").get() as any).count;
    const totalDownloads = (db.prepare("SELECT COALESCE(SUM(downloads), 0) as total FROM books").get() as any).total;
    const totalViews = (db.prepare("SELECT COALESCE(SUM(views), 0) as total FROM books").get() as any).total;
    const totalApiKeys = (db.prepare("SELECT COUNT(*) as count FROM api_keys").get() as any).count;
    const recentActivity = db.prepare("SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 20").all();

    // Get books by board for chart
    const booksByBoard = db.prepare("SELECT board, COUNT(*) as count FROM books WHERE board IS NOT NULL GROUP BY board").all();

    // Get monthly uploads
    const monthlyUploads = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
    FROM books 
    GROUP BY strftime('%Y-%m', created_at) 
    ORDER BY month DESC 
    LIMIT 12
  `).all();

    return NextResponse.json({
        totalBooks,
        approvedBooks,
        pendingBooks,
        totalDownloads,
        totalViews,
        totalApiKeys,
        recentActivity,
        booksByBoard,
        monthlyUploads,
    });
}

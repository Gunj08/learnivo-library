import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

// External API - requires X-API-Key header
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) return NextResponse.json({ error: "API Key required" }, { status: 401 });

    const db = getDb();
    const validKey = db.prepare("SELECT * FROM api_keys WHERE key = ?").get(apiKey);
    if (!validKey) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const board = searchParams.get("board");
    const grade = searchParams.get("grade");
    const subject = searchParams.get("subject");

    let query = "SELECT id, title, subtitle, slug, author, publisher, description, board, grade, subject, language, tags, downloads, created_at FROM books WHERE status = 'approved'";
    const params: any[] = [];

    if (q) {
        query += " AND (title LIKE ? OR author LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
    }
    if (board) { query += " AND board = ?"; params.push(board); }
    if (grade) { query += " AND grade = ?"; params.push(grade); }
    if (subject) { query += " AND subject = ?"; params.push(subject); }

    query += " ORDER BY created_at DESC";

    const books = db.prepare(query).all(...params);
    return NextResponse.json({
        success: true,
        count: books.length,
        data: books,
    });
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import getDb from "@/lib/db";

async function authenticate() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return null;
    const db = getDb();
    return db.prepare("SELECT * FROM users WHERE id = ?").get(session.value) as any;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const db = getDb();
    const book = db.prepare("SELECT * FROM books WHERE slug = ?").get(slug) as any;
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const chapters = db.prepare("SELECT * FROM chapters WHERE book_id = ? ORDER BY order_index ASC").all(book.id);
    book.chapters = chapters;

    // Track view
    db.prepare("UPDATE books SET views = views + 1 WHERE id = ?").run(book.id);

    return NextResponse.json(book);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const db = getDb();
    const book = db.prepare("SELECT * FROM books WHERE slug = ?").get(slug) as any;
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    db.prepare("DELETE FROM books WHERE id = ?").run(book.id);

    // Log activity
    db.prepare(
        "INSERT INTO activity_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)"
    ).run("delete", "book", book.id, `Book "${book.title}" deleted`, user.id);

    return NextResponse.json({ message: "Book deleted" });
}

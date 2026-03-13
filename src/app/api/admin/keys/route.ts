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

// GET /api/admin/keys - Get all API keys
export async function GET() {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const keys = db.prepare("SELECT * FROM api_keys ORDER BY created_at DESC").all();
    return NextResponse.json(keys);
}

// POST /api/admin/keys - Create new API key
export async function POST(request: NextRequest) {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await request.json();
    const key = "lrn_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const db = getDb();
    db.prepare("INSERT INTO api_keys (key, name) VALUES (?, ?)").run(key, name);

    db.prepare(
        "INSERT INTO activity_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)"
    ).run("create", "api_key", null, `API key "${name}" created`, user.id);

    return NextResponse.json({ key, name });
}

// DELETE /api/admin/keys - Delete an API key
export async function DELETE(request: NextRequest) {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    const db = getDb();
    db.prepare("DELETE FROM api_keys WHERE id = ?").run(id);

    db.prepare(
        "INSERT INTO activity_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)"
    ).run("delete", "api_key", id, `API key #${id} revoked`, user.id);

    return NextResponse.json({ message: "Key deleted" });
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");
        if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

        const db = getDb();
        const user = db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(session.value);
        if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

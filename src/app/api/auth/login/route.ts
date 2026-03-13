import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        const db = getDb();
        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;

        if (user && bcrypt.compareSync(password, user.password)) {
            const cookieStore = await cookies();
            cookieStore.set("session", String(user.id), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            // Log activity
            db.prepare(
                "INSERT INTO activity_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)"
            ).run("login", "user", user.id, `User ${user.username} logged in`, user.id);

            return NextResponse.json({
                id: user.id,
                username: user.username,
                role: user.role,
            });
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

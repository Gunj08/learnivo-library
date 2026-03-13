import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        const db = getDb();

        // Check if user exists
        const existingUser = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
        if (existingUser) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        const hash = bcrypt.hashSync(password, 10);
        const result = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(
            username,
            hash,
            "user"
        );

        return NextResponse.json({
            message: "User registered successfully",
            id: result.lastInsertRowid
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

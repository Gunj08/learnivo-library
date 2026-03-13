import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const db = getDb();

        const boards = db.prepare("SELECT DISTINCT board FROM books WHERE board IS NOT NULL AND board != '' ORDER BY board ASC").all() as { board: string }[];
        const grades = db.prepare("SELECT DISTINCT grade FROM books WHERE grade IS NOT NULL AND grade != '' ORDER BY grade ASC").all() as { grade: string }[];
        const subjects = db.prepare("SELECT DISTINCT subject FROM books WHERE subject IS NOT NULL AND subject != '' ORDER BY subject ASC").all() as { subject: string }[];

        return NextResponse.json({
            boards: boards.map(b => b.board),
            grades: grades.map(g => g.grade),
            subjects: subjects.map(s => s.subject)
        });
    } catch (error: any) {
        console.error("Error fetching filters:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

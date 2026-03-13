import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "library.db");
const db = new Database(DB_PATH);

try {
    // Set all existing books to 'approved' if they were previously uploaded
    // (Since previously all books were auto-approved)
    const result = db.prepare("UPDATE books SET status = 'approved' WHERE status IS NULL OR status = 'pending'").run();
    console.log(`Updated ${result.changes} books to 'approved' status.`);
} catch (err) {
    console.error("Migration error:", err);
} finally {
    db.close();
}

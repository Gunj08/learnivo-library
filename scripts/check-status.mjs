import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "library.db");
const db = new Database(DB_PATH);

try {
    const books = db.prepare("SELECT title, status FROM books LIMIT 10").all();
    console.log("Current Books Status:", JSON.stringify(books, null, 2));
} catch (err) {
    console.error("Query error:", err);
} finally {
    db.close();
}

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'data', 'library.db');

if (!fs.existsSync(DB_PATH)) {
    console.log("DB file not found at", DB_PATH);
    process.exit(1);
}

const db = new Database(DB_PATH);

try {
    const columns = db.prepare("PRAGMA table_info(books)").all();
    console.log("Books columns:", columns.map(c => c.name));
    const hasUid = columns.some(c => c.name === 'uid');
    if (!hasUid) {
        console.log("Adding uid column...");
        db.exec("ALTER TABLE books ADD COLUMN uid TEXT");
        db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_books_uid ON books(uid)");
        console.log("Done.");
    } else {
        console.log("Uid column already exists.");
    }
} catch (error) {
    console.error("Error:", error);
} finally {
    db.close();
}

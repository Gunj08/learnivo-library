const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'data', 'library.db');

if (!fs.existsSync(DB_PATH)) {
    console.log("DB file not found at", DB_PATH);
    process.exit(1);
}

const db = new Database(DB_PATH);

function fixTable(tableName, expectedColumns) {
    try {
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const existingNames = columns.map(c => c.name);
        console.log(`${tableName} columns:`, existingNames);

        for (const col of expectedColumns) {
            if (!existingNames.includes(col.name)) {
                console.log(`Adding ${col.name} to ${tableName}...`);
                db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type}`);
            }
        }
    } catch (e) {
        console.error(`Error fixing ${tableName}:`, e.message);
    }
}

fixTable('books', [
    { name: 'uid', type: 'TEXT' },
    { name: 'subtitle', type: 'TEXT' },
    { name: 'slug', type: 'TEXT' },
    { name: 'status', type: 'TEXT DEFAULT "pending"' }
]);

fixTable('chapters', [
    { name: 'order_index', type: 'INTEGER DEFAULT 0' }
]);

db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_books_uid ON books(uid)");
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_books_slug ON books(slug)");

console.log("Database schema check complete.");
db.close();

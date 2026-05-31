const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
  console.log("Testing SELECT with raw().all():");
  const stmtAll = db.prepare('SELECT id, kode, nama FROM barang LIMIT 2');
  console.log("Raw all:", stmtAll.raw(true).all());

  console.log("\nTesting SELECT with raw().get():");
  const stmtGet = db.prepare('SELECT id, kode, nama FROM barang LIMIT 1');
  console.log("Raw get:", stmtGet.raw(true).get());

  console.log("\nTesting RUN statement:");
  const stmtRun = db.prepare('UPDATE barang SET kode = kode WHERE id = 2');
  console.log("Run:", stmtRun.run());
} catch (e) {
  console.error("Error:", e);
} finally {
  db.close();
}

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// 📁 Assure la présence du dossier data/
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Dossier /data créé');
}

// 📦 Base SQLite dans /data/db.sqlite
const dbPath = path.join(dataDir, 'db.sqlite');
const db = new Database(dbPath);
console.log(`✅ Base SQLite ouverte à : ${dbPath}`);

function init() {
  // Création des tables si elles n'existent pas
  db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    title TEXT,
    price REAL,
    category TEXT,
    stock INTEGER,
    description TEXT
  );`);

  db.exec(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer TEXT,
    items TEXT,
    total REAL,
    createdAt TEXT
  );`);

  // Insertion d'exemples si vide
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO products (title,price,category,stock,description) VALUES (?, ?, ?, ?, ?)');
    insert.run('Casual T-Shirt', 19.99, 'Clothing', 12, 'Comfortable cotton t-shirt.');
    insert.run('Running Sneakers', 79.99, 'Footwear', 8, 'Lightweight running shoes.');
    insert.run('Wireless Headphones', 129.99, 'Electronics', 5, 'Noise-cancelling over-ear headphones.');
    console.log('🧩 Données par défaut insérées dans products');
  }
}

module.exports = { db, init };

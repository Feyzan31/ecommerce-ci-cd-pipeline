const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs'); // ⬅️ N'oublie pas d'importer bcrypt
const db = new Database('db.sqlite');

function init() {
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
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);

  const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (productCount === 0) {
    const insert = db.prepare('INSERT INTO products (title,price,category,stock,description) VALUES (?, ?, ?, ?, ?)');
    insert.run('Casual T-Shirt', 19.99, 'Clothing', 12, 'Comfortable cotton t-shirt.');
    insert.run('Running Sneakers', 79.99, 'Footwear', 8, 'Lightweight running shoes.');
    insert.run('Wireless Headphones', 129.99, 'Electronics', 5, 'Noise-cancelling over-ear headphones.');
  }

  // ⭐ AJOUT DE L'UTILISATEUR SOUAD et d'un admin ⭐
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    insertUser.run('Admin', 'admin@eshop.com', hashedPassword, 'admin');
    insertUser.run('Souad', 'souad@gtest.com', bcrypt.hashSync('password', 10), 'user');
    console.log('✅ Utilisateur Souad et admin créés avec succès');
  }
}

module.exports = { db, init };
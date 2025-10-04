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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);

  const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (productCount === 0) {
    const insert = db.prepare('INSERT INTO products (title,price,category,stock,description) VALUES (?, ?, ?, ?, ?)');
    insert.run('Casual T-Shirt', 19.99, 'Clothing', 12, 'Comfortable cotton t-shirt.');
    insert.run('Running Sneakers', 79.99, 'Footwear', 8, 'Lightweight running shoes.');
    insert.run('Wireless Headphones', 129.99, 'Electronics', 5, 'Noise-cancelling over-ear headphones.');
  }

  // ⭐ AJOUT DE L'UTILISATEUR SOUAD ⭐
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    const hashedPassword = bcrypt.hashSync('password', 10); // Hash du mot de passe
    const insertUser = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    insertUser.run('Souad', 'souad@gtest.com', hashedPassword);
    console.log('✅ Utilisateur Souad créé avec succès');
  }
}

module.exports = { db, init };
const Database = require('better-sqlite3');
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

  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO products (title,price,category,stock,description) VALUES (?, ?, ?, ?, ?)');
    insert.run('Casual T-Shirt', 19.99, 'Clothing', 12, 'Comfortable cotton t-shirt.');
    insert.run('Running Sneakers', 79.99, 'Footwear', 8, 'Lightweight running shoes.');
    insert.run('Wireless Headphones', 129.99, 'Electronics', 5, 'Noise-cancelling over-ear headphones.');
  }
}

module.exports = { db, init };

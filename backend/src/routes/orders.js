const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.post('/', (req,res) => {
  const { customer, items, total } = req.body;
  const stmt = db.prepare('INSERT INTO orders (customer, items, total, createdAt) VALUES (?, ?, ?, ?)');
  const info = stmt.run(JSON.stringify(customer), JSON.stringify(items), total, new Date().toISOString());
  res.status(201).json({ id: info.lastInsertRowid });
});

router.get('/', (req,res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  res.json(rows);
});

module.exports = router;

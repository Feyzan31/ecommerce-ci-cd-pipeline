const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req,res) => {
  const rows = db.prepare('SELECT * FROM products').all();
  res.json(rows);
});

router.get('/:id', (req,res) => {
  const row = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

module.exports = router;

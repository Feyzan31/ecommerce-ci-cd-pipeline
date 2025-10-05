const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/admin/products - Récupérer tous les produits (admin)
router.get('/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/products - Créer un produit
router.post('/products', (req, res) => {
  const { title, price, category, stock, description, image } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO products (title, price, category, stock, description, image) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, price, category, stock, description, image);
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/products/:id - Modifier un produit
router.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { title, price, category, stock, description, image } = req.body;
  try {
    db.prepare(
      'UPDATE products SET title=?, price=?, category=?, stock=?, description=?, image=? WHERE id=?'
    ).run(title, price, category, stock, description, image, id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/products/:id - Supprimer un produit
router.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM products WHERE id=?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { db } = require("../db");

// 🟢 Tous les produits
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM products").all();
  res.json(rows);
});

// 🟢 Un seul produit
router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Produit non trouvé" });
  res.json(row);
});

// 🟢 Ajouter un produit
router.post("/", (req, res) => {
  const { title, price, category, stock, description } = req.body;
  try {
    const stmt = db.prepare(
      "INSERT INTO products (title, price, category, stock, description) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(title, price, category, stock, description);
    res.status(201).json({ id: info.lastInsertRowid, message: "Produit ajouté" });
  } catch (err) {
    console.error("Erreur ajout produit :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 Modifier un produit
router.put("/:id", (req, res) => {
  const { title, price, category, stock, description } = req.body;
  try {
    const stmt = db.prepare(
      "UPDATE products SET title=?, price=?, category=?, stock=?, description=? WHERE id=?"
    );
    const result = stmt.run(title, price, category, stock, description, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Produit introuvable" });
    res.json({ message: "Produit mis à jour" });
  } catch (err) {
    console.error("Erreur modification :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 Supprimer un produit
router.delete("/:id", (req, res) => {
  try {
    const result = db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Produit introuvable" });
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    console.error("Erreur suppression :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

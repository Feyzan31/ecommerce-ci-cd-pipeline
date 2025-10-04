const express = require("express");
const router = express.Router();
const { db } = require("../db");

// 🟢 Tous les produits
router.get("/", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM products").all();
    res.status(200).json(rows);
  } catch (err) {
    console.error("Erreur lecture produits :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 Un seul produit
router.get("/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM products WHERE id=?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Produit non trouvé" });
    res.status(200).json(row);
  } catch (err) {
    console.error("Erreur lecture produit :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 Ajouter un produit
router.post("/", (req, res) => {
  const { title, price, category, stock, description } = req.body;

  // 🧩 Validation de base
  if (!title || !category || price == null) {
    return res.status(400).json({ error: "Champs requis manquants (title, category, price)" });
  }
  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ error: "Le prix doit être un nombre positif" });
  }
  if (stock != null && stock < 0) {
    return res.status(400).json({ error: "Le stock ne peut pas être négatif" });
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO products (title, price, category, stock, description) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(title, price, category, stock ?? 0, description ?? "");
    res.status(201).json({ id: info.lastInsertRowid, message: "Produit ajouté" });
  } catch (err) {
    console.error("Erreur ajout produit :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 Modifier un produit
router.put("/:id", (req, res) => {
  const { title, price, category, stock, description } = req.body;

  if (!title || !category || price == null) {
    return res.status(400).json({ error: "Champs requis manquants pour mise à jour" });
  }

  try {
    const stmt = db.prepare(
      "UPDATE products SET title=?, price=?, category=?, stock=?, description=? WHERE id=?"
    );
    const result = stmt.run(title, price, category, stock ?? 0, description ?? "", req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Produit introuvable" });
    res.status(200).json({ message: "Produit mis à jour" });
  } catch (err) {
    console.error("Erreur modification produit :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 Supprimer un produit
router.delete("/:id", (req, res) => {
  try {
    const result = db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Produit introuvable" });
    res.status(200).json({ message: "Produit supprimé" });
  } catch (err) {
    console.error("Erreur suppression produit :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

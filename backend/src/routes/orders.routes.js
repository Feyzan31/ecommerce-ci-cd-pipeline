const express = require("express");
const router = express.Router();
const { db } = require("../db");

// 🔹 Créer une commande
router.post("/", (req, res) => {
  const { customer, items, total } = req.body;
  try {
    const stmt = db.prepare(
      "INSERT INTO orders (customer, items, total, createdAt) VALUES (?, ?, ?, ?)"
    );
    const info = stmt.run(
      JSON.stringify(customer),
      JSON.stringify(items),
      total,
      new Date().toISOString()
    );
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error("Erreur ajout commande :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Lister les commandes
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
  res.json(rows);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { db } = require("../db");

// 🔹 Créer une commande
router.post("/", (req, res) => {
  const { customer, items, total } = req.body;

  // ✅ Vérifications de validité des champs
  if (!customer || !customer.name || !customer.email) {
    return res.status(400).json({ error: "Informations client manquantes" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Aucun article dans la commande" });
  }

  if (typeof total !== "number" || total <= 0) {
    return res.status(400).json({ error: "Total invalide" });
  }

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

    res.status(201).json({ id: info.lastInsertRowid, message: "Commande créée avec succès" });
  } catch (err) {
    console.error("Erreur ajout commande :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Lister les commandes
router.get("/", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
    res.status(200).json(rows);
  } catch (err) {
    console.error("Erreur récupération commandes :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

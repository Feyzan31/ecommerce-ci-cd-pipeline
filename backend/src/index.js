const express = require("express");
const cors = require("cors");
const { init } = require("./db");

const productsRouter = require("./routes/products.routes");
const ordersRouter = require("./routes/orders.routes");

const app = express();

// ✅ Autoriser toutes les origines (tu peux restreindre plus tard)
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// ✅ Initialisation de la base SQLite
try {
  init();
  console.log("Base de données initialisée avec succès");
} catch (err) {
  console.error("❌ Erreur d'initialisation de la base :", err);
  process.exit(1); // stoppe le conteneur proprement
}

// ✅ Routes principales
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

// ✅ Routes de test / santé
app.get("/", (req, res) => res.send("🚀 API e-commerce opérationnelle !"));
app.get("/api/ping", (req, res) => res.json({ status: "ok" }));

// ✅ Lancement du serveur uniquement si exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`);
  });
}

module.exports = app;

const express = require("express");
const cors = require("cors");
const { init } = require("./db");

// Import des routeurs
const productsRouter = require("./routes/products.routes");
const ordersRouter = require("./routes/orders.routes");

const app = express();

// ✅ Autoriser toutes les méthodes et en-têtes
app.use(cors({
  origin: "http://localhost:5173", // ton frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());
init();

// Routes
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

// ✅ Route test
app.get("/", (req, res) => res.send("🚀 API e-commerce opérationnelle !"));

// ✅ Ne démarre le serveur que si on exécute ce fichier directement
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`));
}

// ✅ Exporter app pour les tests
module.exports = app;

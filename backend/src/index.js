const express = require("express");
const cors = require("cors");
const { init, db } = require("./db");
const { requireAdmin } = require('./middleware/admin'); // ⬅️ IMPORT AJOUTÉ

// Import des routeurs
const productsRouter = require("./routes/products.routes");
const ordersRouter = require("./routes/orders.routes");
const adminRouter = require("./routes/admin"); // ⬅️ IMPORT AJOUTÉ

const app = express();

// ✅ Autoriser toutes les méthodes et en-têtes
app.use(cors({
  origin: "http://localhost:5173", // ton frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // ⬅️ AJOUT Authorization
}));

app.use(express.json());
init();

// Routes
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use('/api/auth', require('./routes/auth')); // TES routes d'authentification
app.use('/api/admin', requireAdmin, adminRouter); // ⬅️ ROUTES ADMIN PROTÉGÉES

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend opérationnel' });
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend e-commerce opérationnel!',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders', 
      auth: '/api/auth',
      admin: '/api/admin', // ⬅️ AJOUT
      health: '/api/health'
    },
    instructions: 'Le frontend doit être démarré séparément sur localhost:5173'
  });
});

// 🔍 ROUTES DE DEBUG (à mettre avant app.listen)
app.get('/api/debug/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all();
    res.json({ users });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/api/debug/tables', (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    res.json({ tables: tables.map(t => t.name) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Ne démarre le serveur que si on exécute ce fichier directement
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`));
}

// ✅ Exporter app pour les tests
module.exports = app;
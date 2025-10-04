const express = require('express');
const cors = require('cors');
const { init, db } = require('./db'); // ⬅️ IMPORT AUSSI 'db' maintenant

const app = express();

// ⭐ INITIALISATION DE LA BASE DE DONNÉES ⭐
init();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend opérationnel' });
});

const PORT = process.env.PORT || 4000;

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend e-commerce opérationnel!',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders', 
      auth: '/api/auth',
      health: '/api/health'
    },
    instructions: 'Le frontend doit être démarré séparément sur localhost:5173'
  });
});

// 🔍 ROUTES DE DEBUG (à mettre avant app.listen)
app.get('/api/debug/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, created_at FROM users').all();
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

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend sur http://localhost:${PORT}`);
});
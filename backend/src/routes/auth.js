const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { db } = require('../db');

const JWT_SECRET = 'ton_secret_super_securise';

// Route d'inscription
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Vérifier si l'utilisateur existe (avec better-sqlite3)
    const userExists = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (userExists) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur (avec better-sqlite3)
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
                    .run(name, email, hashedPassword);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email: email, role: 'user' }, // ⬅️ AJOUT DU ROLE
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: { 
        id: result.lastInsertRowid, 
        name, 
        email,
        role: 'user'  // ⬅️ AJOUT DU ROLE
      },
      token
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    // Trouver l'utilisateur (avec better-sqlite3)
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // ⬅️ AJOUT DU ROLE
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role  // ⬅️ AJOUT DU ROLE
      },
      token
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
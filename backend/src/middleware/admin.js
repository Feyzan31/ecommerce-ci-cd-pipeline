const { authenticateToken } = require('./auth');

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }
    next();
  });
}

module.exports = { requireAdmin };
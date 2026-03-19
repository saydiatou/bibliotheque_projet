const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  // Récupérer le header Authorization
  const authHeader = req.headers['authorization'];

  // Vérifier qu'il existe et qu'il commence par "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  // Extraire le token
  const token = authHeader.split(' ')[1];

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // on attache l'utilisateur à la requête
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expire' });
  }
};

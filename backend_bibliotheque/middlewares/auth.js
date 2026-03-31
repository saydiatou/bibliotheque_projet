const jwt = require('jsonwebtoken'); // Importe jsonwebtoken pour vérifier les tokens
require('dotenv').config(); // Charge les variables d'environnement

module.exports = (req, res, next) => { // Middleware d'authentification (vérifie le token JWT)
  // Récupérer le header Authorization
  const authHeader = req.headers['authorization']; // Récupère le header 'Authorization'

  // Vérifier qu'il existe et qu'il commence par "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) { // Si header manquant ou mal formé
    return res.status(401).json({ message: 'Token manquant ou invalide' }); // Erreur 401
  }

  // Extraire le token
  const token = authHeader.split(' ')[1]; // Extrait le token après 'Bearer '

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifie avec la clé secrète
    req.user = decoded; // Attache les données décodées (id, email) à req.user
    next(); // Passe au middleware/route suivant
  } catch (error) { // Si token invalide ou expiré
    return res.status(401).json({ message: 'Token invalide ou expire' }); // Erreur 401
  }
};

const express = require('express'); // Importe Express
const router = express.Router(); // Crée un routeur Express
const authMiddleware = require('../middlewares/auth'); // Importe le middleware d'auth
const { register, login, profile } = require('../controllers/authController'); // Importe les contrôleurs

// Routes publiques (pas de token requis)
router.post('/register', register); // Route POST pour inscription
router.post('/login',    login); // Route POST pour connexion

// Route protégée
router.get('/profile', authMiddleware, profile); // Route GET pour profil (avec auth)

module.exports = router; // Exporte le routeur

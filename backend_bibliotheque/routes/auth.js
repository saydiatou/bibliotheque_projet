const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { register, login, profile } = require('../controllers/authController');

// Routes publiques (pas de token requis)
router.post('/register', register);
router.post('/login',    login);

// Route protégée
router.get('/profile', authMiddleware, profile);

module.exports = router;

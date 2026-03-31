const express = require('express'); // Importe Express
const router = express.Router(); // Crée un routeur
const authMiddleware = require('../middlewares/auth'); // Middleware d'auth
const { getBooksStats, getMembersStats, getBorrowsStats } = require('../controllers/statsController'); // Contrôleurs de stats

router.get('/books',   authMiddleware, getBooksStats); // GET /stats/books : stats des livres
router.get('/members', authMiddleware, getMembersStats); // GET /stats/members : stats des membres
router.get('/borrows', authMiddleware, getBorrowsStats); // GET /stats/borrows : stats des emprunts

module.exports = router; // Exporte le routeur

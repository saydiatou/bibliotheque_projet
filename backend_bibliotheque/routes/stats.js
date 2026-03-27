const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getBooksStats, getMembersStats, getBorrowsStats } = require('../controllers/statsController');

router.get('/books',   authMiddleware, getBooksStats);
router.get('/members', authMiddleware, getMembersStats);
router.get('/borrows', authMiddleware, getBorrowsStats);

module.exports = router;

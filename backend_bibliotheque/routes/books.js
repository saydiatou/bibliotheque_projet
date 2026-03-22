const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { getBooks, createBook, updateBook, deleteBook } = require('../controllers/bookController');

router.get('/',       authMiddleware,                              getBooks);
router.post('/',      authMiddleware, upload.single('cover_image'), createBook);
router.put('/:id',    authMiddleware, upload.single('cover_image'), updateBook);
router.delete('/:id', authMiddleware,                              deleteBook);

module.exports = router;

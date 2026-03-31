const express = require('express'); // Importe Express
const router = express.Router(); // Crée un routeur
const authMiddleware = require('../middlewares/auth'); // Middleware d'auth
const upload = require('../middlewares/upload'); // Middleware d'upload
const { getBooks, createBook, updateBook, deleteBook } = require('../controllers/bookController'); // Contrôleurs

router.get('/',       authMiddleware,                              getBooks); // GET /books : liste (protégé)
router.post('/',      authMiddleware, upload.single('cover_image'), createBook); // POST /books : créer (avec image)
router.put('/:id',    authMiddleware, upload.single('cover_image'), updateBook); // PUT /books/:id : mettre à jour
router.delete('/:id', authMiddleware,                              deleteBook); // DELETE /books/:id : supprimer

module.exports = router; // Exporte le routeur

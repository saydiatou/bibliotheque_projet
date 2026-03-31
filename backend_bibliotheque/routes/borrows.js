const express = require('express'); // Importe Express
const router  = express.Router(); // Crée un routeur
const auth    = require('../middlewares/auth'); // Middleware d'auth
const ctrl    = require('../controllers/borrowsController'); // Contrôleur des emprunts

router.use(auth); // Applique auth à toutes les routes
router.get('/',           ctrl.getAll); // GET /borrows : liste des emprunts
router.post('/',          ctrl.create); // POST /borrows : créer un emprunt
router.put('/return/:id', ctrl.returnBook); // PUT /borrows/return/:id : retourner un livre

module.exports = router; // Exporte le routeur

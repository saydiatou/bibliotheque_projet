const express = require('express'); // Importe Express
const router  = express.Router(); // Crée un routeur
const auth    = require('../middlewares/auth'); // Middleware d'auth
const ctrl    = require('../controllers/membersController'); // Contrôleur des membres

router.use(auth); // Applique auth à toutes les routes
router.get('/',       ctrl.getAll); // GET /members : liste
router.post('/',      ctrl.create); // POST /members : créer
router.put('/:id',    ctrl.update); // PUT /members/:id : mettre à jour
router.delete('/:id', ctrl.remove); // DELETE /members/:id : supprimer

module.exports = router; // Exporte le routeur

const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const ctrl    = require('../controllers/borrowsController');

router.use(auth);
router.get('/',           ctrl.getAll);
router.post('/',          ctrl.create);
router.put('/return/:id', ctrl.returnBook);

module.exports = router;

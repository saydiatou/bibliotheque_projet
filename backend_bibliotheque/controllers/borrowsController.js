const Joi  = require('joi'); // Importe Joi pour validation
const { Borrow, Member, Book } = require('../models'); // Importe les modèles

// GET /api/borrows
exports.getAll = async (req, res) => { // Fonction pour récupérer la liste des emprunts
  try {
    const page   = parseInt(req.query.page)  || 1; // Page par défaut 1
    const limit  = parseInt(req.query.limit) || 10; // Limite par défaut 10
    const offset = (page - 1) * limit; // Calcule l'offset

    const where = {}; // Conditions WHERE
    if (req.query.status) where.status = req.query.status; // Filtre par statut si fourni

    const { count, rows } = await Borrow.findAndCountAll({ // Récupère avec pagination
      where,
      include: [ // Inclut les relations
        { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
        { model: Book,   as: 'book',   attributes: ['id', 'title', 'author'] },
      ],
      limit, offset,
    });

    return res.json({ // Retourne la réponse JSON
      total:      count,
      page,
      totalPages: Math.ceil(count / limit),
      borrows:    rows,
    });
  } catch (err) {
    console.error('Erreur GET /borrows :', err.message); // Log l'erreur
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

// POST /api/borrows
exports.create = async (req, res) => { // Fonction pour créer un emprunt
  const schema = Joi.object({ // Schéma de validation
    member_id: Joi.number().integer().required(), // ID membre obligatoire
    book_id:   Joi.number().integer().required(), // ID livre obligatoire
    due_date:  Joi.date().iso().required(), // Date d'échéance obligatoire
  });
  const { error, value } = schema.validate(req.body); // Valide les données
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) }); // Erreur si invalide

  try {
    const member = await Member.findByPk(value.member_id); // Vérifie le membre
    if (!member) return res.status(404).json({ message: 'Membre introuvable' }); // Erreur si non trouvé
    if (member.status !== 'active') return res.status(400).json({ message: 'Le membre est inactif' }); // Erreur si inactif

    const book = await Book.findByPk(value.book_id); // Vérifie le livre
    if (!book) return res.status(404).json({ message: 'Livre introuvable' }); // Erreur si non trouvé
    if (book.available_quantity < 1) return res.status(400).json({ message: "Ce livre n'est plus disponible" }); // Erreur si indisponible

    const borrow = await Borrow.create({ // Crée l'emprunt
      member_id:   value.member_id,
      book_id:     value.book_id,
      due_date:    value.due_date,
      borrow_date: new Date(), // Date actuelle
    });

    await book.update({ available_quantity: book.available_quantity - 1 }); // Décrémente la quantité disponible

    const full = await Borrow.findByPk(borrow.id, { // Récupère l'emprunt complet avec relations
      include: [
        { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
        { model: Book,   as: 'book',   attributes: ['id', 'title', 'author'] },
      ],
    });

    return res.status(201).json(full); // Retourne 201 avec l'emprunt
  } catch (err) {
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

// PUT /api/borrows/return/:id
exports.returnBook = async (req, res) => { // Fonction pour retourner un livre
  try {
    const borrow = await Borrow.findByPk(req.params.id, { // Recherche l'emprunt
      include: [{ model: Book, as: 'book' }], // Inclut le livre
    });
    if (!borrow) return res.status(404).json({ message: 'Emprunt introuvable' }); // Erreur si non trouvé
    if (borrow.status === 'returned') return res.status(400).json({ message: 'Ce livre a déjà été retourné' }); // Erreur si déjà retourné

    await borrow.update({ status: 'returned', return_date: new Date() }); // Met à jour l'emprunt
    await borrow.book.update({ available_quantity: borrow.book.available_quantity + 1 }); // Incrémente la quantité disponible

    const full = await Borrow.findByPk(borrow.id, { // Récupère l'emprunt mis à jour
      include: [
        { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
        { model: Book,   as: 'book',   attributes: ['id', 'title', 'author'] },
      ],
    });

    return res.json({ message: 'Livre retourné avec succès', borrow: full }); // Retourne le message et l'emprunt
  } catch (err) {
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

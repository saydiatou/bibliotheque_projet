const Joi  = require('joi'); // Importe Joi pour validation
const { Category, Book } = require('../models'); // Importe les modèles

// GET /api/categories
exports.getAll = async (req, res) => { // Fonction pour récupérer toutes les catégories
  try {
    const categories = await Category.findAll({ // Récupère toutes les catégories
      include: [{ model: Book, as: 'books', attributes: ['id'] }], // Inclut les livres (seulement ID)
      order: [['name', 'ASC']], // Trie par nom ascendant
    });
    return res.json(categories); // Retourne les catégories
  } catch (err) {
    console.error('Erreur GET /categories :', err.message); // Log l'erreur
    // Si le problème vient de l'association, on retourne sans les livres
    try {
      const categories = await Category.findAll({ order: [['name', 'ASC']] }); // Récupère sans livres
      return res.json(categories.map(c => ({ ...c.toJSON(), books: [] }))); // Ajoute books vide
    } catch (err2) {
      return res.status(500).json({ message: err.message }); // Erreur 500
    }
  }
};

// POST /api/categories
exports.create = async (req, res) => { // Fonction pour créer une catégorie
  const schema = Joi.object({ // Schéma de validation
    name:        Joi.string().min(2).max(100).required(), // Nom obligatoire, 2-100 chars
    description: Joi.string().max(500).allow('', null), // Description optionnelle
  });
  const { error, value } = schema.validate(req.body); // Valide les données
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) }); // Erreur si invalide

  try {
    const category = await Category.create(value); // Crée la catégorie
    return res.status(201).json(category); // Retourne 201 avec la catégorie
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') // Si nom déjà utilisé
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' }); // Erreur 400
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

// PUT /api/categories/:id
exports.update = async (req, res) => { // Fonction pour mettre à jour une catégorie
  const schema = Joi.object({ // Schéma de validation (champs optionnels)
    name:        Joi.string().min(2).max(100),
    description: Joi.string().max(500).allow('', null),
  });
  const { error, value } = schema.validate(req.body); // Valide
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) }); // Erreur

  try {
    const category = await Category.findByPk(req.params.id); // Recherche par ID
    if (!category) return res.status(404).json({ message: 'Catégorie introuvable' }); // Erreur si non trouvée

    await category.update(value); // Met à jour
    return res.json(category); // Retourne la catégorie mise à jour
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') // Si nom déjà utilisé
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' }); // Erreur 400
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

// DELETE /api/categories/:id
exports.remove = async (req, res) => { // Fonction pour supprimer une catégorie
  try {
    const category = await Category.findByPk(req.params.id); // Recherche par ID
    if (!category) return res.status(404).json({ message: 'Catégorie introuvable' }); // Erreur si non trouvée

    await category.destroy(); // Supprime
    return res.json({ message: 'Catégorie supprimée' }); // Retourne le message
  } catch (err) {
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};
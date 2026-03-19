const Joi  = require('joi');
const { Category, Book } = require('../models');

// GET /api/categories
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Book, as: 'books', attributes: ['id'] }],
      order: [['name', 'ASC']],
    });
    return res.json(categories);
  } catch (err) {
    console.error('Erreur GET /categories :', err.message);
    // Si le problème vient de l'association, on retourne sans les livres
    try {
      const categories = await Category.findAll({ order: [['name', 'ASC']] });
      return res.json(categories.map(c => ({ ...c.toJSON(), books: [] })));
    } catch (err2) {
      return res.status(500).json({ message: err.message });
    }
  }
};

// POST /api/categories
exports.create = async (req, res) => {
  const schema = Joi.object({
    name:        Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow('', null),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) });

  try {
    const category = await Category.create(value);
    return res.status(201).json(category);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/categories/:id
exports.update = async (req, res) => {
  const schema = Joi.object({
    name:        Joi.string().min(2).max(100),
    description: Joi.string().max(500).allow('', null),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) });

  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Catégorie introuvable' });

    await category.update(value);
    return res.json(category);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/categories/:id
exports.remove = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Catégorie introuvable' });

    await category.destroy();
    return res.json({ message: 'Catégorie supprimée' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const { Op } = require('sequelize');
const Joi = require('joi');
const { Book, Category } = require('../models');

// ---- Schémas Joi ----
const bookSchema = Joi.object({
  title:              Joi.string().min(1).max(255).required(),
  author:             Joi.string().min(1).max(255).required(),
  isbn:               Joi.string().max(20).optional().allow('', null),
  category_id:        Joi.number().required(),
  description:        Joi.string().max(1000).optional().allow('', null),
  quantity:           Joi.number().integer().min(1).required(),
  available_quantity: Joi.number().integer().min(0).optional(),
});

const bookUpdateSchema = Joi.object({
  title:              Joi.string().min(1).max(255).optional(),
  author:             Joi.string().min(1).max(255).optional(),
  isbn:               Joi.string().max(20).optional().allow('', null),
  category_id:        Joi.number().optional(),
  description:        Joi.string().max(1000).optional().allow('', null),
  quantity:           Joi.number().integer().min(1).optional(),
  available_quantity: Joi.number().integer().min(0).optional(),
});

// GET /api/books
const getBooks = async (req, res) => {
  try {
    const { search, category_id, page = 1, limit = 10 } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { title:  { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category_id) {
      where.category_id = category_id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Book.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      limit:   parseInt(limit),
      offset,
      order:   [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      total:      count,
      page:       parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      books:      rows,
    });

  } catch (error) {
    console.error('Erreur getBooks :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// POST /api/books
const createBook = async (req, res) => {
  try {
    // Validation Joi
    const { error } = bookSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Donnees invalides',
        errors: error.details.map((e) => e.message),
      });
    }

    const { title, author, isbn, category_id, description, quantity, available_quantity } = req.body;

    // Vérifier que la catégorie existe
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ message: 'Categorie introuvable' });
    }

    const book = await Book.create({
      title,
      author,
      isbn:               isbn || null,
      category_id,
      description:        description || null,
      quantity:           parseInt(quantity),
      available_quantity: available_quantity ? parseInt(available_quantity) : parseInt(quantity),
      cover_image:        req.file ? req.file.filename : null,
    });

    return res.status(201).json(book);

  } catch (error) {
    console.error('Erreur createBook :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre introuvable' });
    }

    // Validation Joi
    const { error } = bookUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Donnees invalides',
        errors: error.details.map((e) => e.message),
      });
    }

    const { title, author, isbn, category_id, description, quantity, available_quantity } = req.body;

    // Remplacer image seulement si nouveau fichier envoyé
    const cover_image = req.file ? req.file.filename : book.cover_image;

    await book.update({
      title:              title              || book.title,
      author:             author             || book.author,
      isbn:               isbn               !== undefined ? isbn : book.isbn,
      category_id:        category_id        || book.category_id,
      description:        description        !== undefined ? description : book.description,
      quantity:           quantity           ? parseInt(quantity)           : book.quantity,
      available_quantity: available_quantity ? parseInt(available_quantity) : book.available_quantity,
      cover_image,
    });

    return res.status(200).json(book);

  } catch (error) {
    console.error('Erreur updateBook :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre introuvable' });
    }

    await book.destroy();
    return res.status(200).json({ message: 'Livre supprime' });

  } catch (error) {
    console.error('Erreur deleteBook :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = { getBooks, createBook, updateBook, deleteBook };

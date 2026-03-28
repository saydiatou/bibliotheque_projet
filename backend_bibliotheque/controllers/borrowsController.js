const Joi  = require('joi');
const { Borrow, Member, Book } = require('../models');

// GET /api/borrows
exports.getAll = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await Borrow.findAndCountAll({
      where,
      include: [
        { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
        { model: Book,   as: 'book',   attributes: ['id', 'title', 'author'] },
      ],
      limit, offset,
    });

    return res.json({
      total:      count,
      page,
      totalPages: Math.ceil(count / limit),
      borrows:    rows,
    });
  } catch (err) {
    console.error('Erreur GET /borrows :', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/borrows
exports.create = async (req, res) => {
  const schema = Joi.object({
    member_id: Joi.number().integer().required(),
    book_id:   Joi.number().integer().required(),
    due_date:  Joi.date().iso().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) });

  try {
    const member = await Member.findByPk(value.member_id);
    if (!member) return res.status(404).json({ message: 'Membre introuvable' });
    if (member.status !== 'active') return res.status(400).json({ message: 'Le membre est inactif' });

    const book = await Book.findByPk(value.book_id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    if (book.available_quantity < 1) return res.status(400).json({ message: "Ce livre n'est plus disponible" });

    const borrow = await Borrow.create({
      member_id:   value.member_id,
      book_id:     value.book_id,
      due_date:    value.due_date,
      borrow_date: new Date(),
    });

    await book.update({ available_quantity: book.available_quantity - 1 });

    const full = await Borrow.findByPk(borrow.id, {
      include: [
        { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
        { model: Book,   as: 'book',   attributes: ['id', 'title', 'author'] },
      ],
    });

    return res.status(201).json(full);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/borrows/return/:id
exports.returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, {
      include: [{ model: Book, as: 'book' }],
    });
    if (!borrow) return res.status(404).json({ message: 'Emprunt introuvable' });
    if (borrow.status === 'returned') return res.status(400).json({ message: 'Ce livre a déjà été retourné' });

    await borrow.update({ status: 'returned', return_date: new Date() });
    await borrow.book.update({ available_quantity: borrow.book.available_quantity + 1 });

    const full = await Borrow.findByPk(borrow.id, {
      include: [
        { model: Member, as: 'member', attributes: ['id', 'first_name', 'last_name'] },
        { model: Book,   as: 'book',   attributes: ['id', 'title', 'author'] },
      ],
    });

    return res.json({ message: 'Livre retourné avec succès', borrow: full });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

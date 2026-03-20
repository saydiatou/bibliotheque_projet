const Joi  = require('joi');
const { Op } = require('sequelize');
const { Member } = require('../models');

// GET /api/members
exports.getAll = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${req.query.search}%` } },
        { last_name:  { [Op.like]: `%${req.query.search}%` } },
        { email:      { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await Member.findAndCountAll({
      where, limit, offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      total:      count,
      page,
      totalPages: Math.ceil(count / limit),
      members:    rows,
    });
  } catch (err) {
    console.error('Erreur GET /members :', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/members
exports.create = async (req, res) => {
  const schema = Joi.object({
    first_name:      Joi.string().min(1).max(100).required(),
    last_name:       Joi.string().min(1).max(100).required(),
    email:           Joi.string().email().allow('', null),
    phone:           Joi.string().max(20).allow('', null),
    address:         Joi.string().max(500).allow('', null),
    membership_date: Joi.date().iso(),
    status:          Joi.string().valid('active', 'inactive'),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) });

  try {
    const member = await Member.create(value);
    return res.status(201).json(member);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/members/:id
exports.update = async (req, res) => {
  const schema = Joi.object({
    first_name:      Joi.string().min(1).max(100),
    last_name:       Joi.string().min(1).max(100),
    email:           Joi.string().email().allow('', null),
    phone:           Joi.string().max(20).allow('', null),
    address:         Joi.string().max(500).allow('', null),
    membership_date: Joi.date().iso(),
    status:          Joi.string().valid('active', 'inactive'),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) });

  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Membre introuvable' });

    await member.update(value);
    return res.json(member);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/members/:id
exports.remove = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Membre introuvable' });

    await member.destroy();
    return res.json({ message: 'Membre supprimé' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

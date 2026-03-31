const Joi  = require('joi'); // Importe Joi pour validation
const { Op } = require('sequelize'); // Importe les opérateurs Sequelize
const { Member } = require('../models'); // Importe le modèle Member

// GET /api/members
exports.getAll = async (req, res) => { // Fonction pour récupérer la liste des membres
  try {
    const page   = parseInt(req.query.page)  || 1; // Page par défaut 1
    const limit  = parseInt(req.query.limit) || 10; // Limite par défaut 10
    const offset = (page - 1) * limit; // Calcule l'offset

    const where = {}; // Conditions WHERE
    if (req.query.search) { // Si recherche fournie
      where[Op.or] = [ // Condition OR : prénom, nom OU email contient la recherche
        { first_name: { [Op.like]: `%${req.query.search}%` } },
        { last_name:  { [Op.like]: `%${req.query.search}%` } },
        { email:      { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status; // Filtre par statut

    const { count, rows } = await Member.findAndCountAll({ // Récupère avec pagination
      where, limit, offset,
      order: [['createdAt', 'DESC']], // Trie par date de création décroissante
    });

    return res.json({ // Retourne la réponse JSON
      total:      count,
      page,
      totalPages: Math.ceil(count / limit),
      members:    rows,
    });
  } catch (err) {
    console.error('Erreur GET /members :', err.message); // Log l'erreur
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

// POST /api/members
exports.create = async (req, res) => { // Fonction pour créer un membre
  const schema = Joi.object({ // Schéma de validation
    first_name:      Joi.string().min(1).max(100).required(), // Prénom obligatoire
    last_name:       Joi.string().min(1).max(100).required(), // Nom obligatoire
    email:           Joi.string().email().allow('', null), // Email optionnel, doit être email
    phone:           Joi.string().max(20).allow('', null), // Téléphone optionnel
    address:         Joi.string().max(500).allow('', null), // Adresse optionnelle
    membership_date: Joi.date().iso(), // Date d'adhésion optionnelle
    status:          Joi.string().valid('active', 'inactive'), // Statut optionnel
  });
  const { error, value } = schema.validate(req.body); // Valide les données
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) }); // Erreur si invalide

  try {
    const member = await Member.create(value); // Crée le membre
    return res.status(201).json(member); // Retourne 201 avec le membre
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') // Si email déjà utilisé
      return res.status(400).json({ message: 'Cet email est déjà utilisé' }); // Erreur 400
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

// PUT /api/members/:id
exports.update = async (req, res) => { // Fonction pour mettre à jour un membre
  const schema = Joi.object({ // Schéma de validation (champs optionnels)
    first_name:      Joi.string().min(1).max(100),
    last_name:       Joi.string().min(1).max(100),
    email:           Joi.string().email().allow('', null),
    phone:           Joi.string().max(20).allow('', null),
    address:         Joi.string().max(500).allow('', null),
    membership_date: Joi.date().iso(),
    status:          Joi.string().valid('active', 'inactive'),
  });
  const { error, value } = schema.validate(req.body); // Valide
  if (error) return res.status(400).json({ message: 'Données invalides', errors: error.details.map(d => d.message) }); // Erreur

  try {
    const member = await Member.findByPk(req.params.id); // Recherche par ID
    if (!member) return res.status(404).json({ message: 'Membre introuvable' }); // Erreur si non trouvé

    await member.update(value); // Met à jour
    return res.json(member); // Retourne le membre mis à jour
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') // Si email déjà utilisé
      return res.status(400).json({ message: 'Cet email est déjà utilisé' }); // Erreur 400
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

// DELETE /api/members/:id
exports.remove = async (req, res) => { // Fonction pour supprimer un membre
  try {
    const member = await Member.findByPk(req.params.id); // Recherche par ID
    if (!member) return res.status(404).json({ message: 'Membre introuvable' }); // Erreur si non trouvé

    await member.destroy(); // Supprime
    return res.json({ message: 'Membre supprimé' }); // Retourne le message
  } catch (err) {
    return res.status(500).json({ message: err.message }); // Erreur 500
  }
};

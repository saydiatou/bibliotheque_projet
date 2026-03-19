/**
 * Middleware de gestion des erreurs globales (Tâche N4)
 * À enregistrer EN DERNIER dans app.js
 */
const errorHandler = (err, req, res, next) => {

  // Erreur Joi
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Données invalides',
      errors: err.details ? err.details.map(d => d.message) : [err.message],
    });
  }

  // Sequelize — contrainte UNIQUE
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'champ';
    return res.status(400).json({
      message: `La valeur du champ "${field}" est déjà utilisée`,
    });
  }

  // Sequelize — validation
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Données invalides',
      errors: err.errors.map(e => e.message),
    });
  }

  // Sequelize — clé étrangère
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      message: "Référence invalide : l'ID lié n'existe pas",
    });
  }

  // JWT invalide
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }

  // Multer — fichier trop grand
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Fichier trop volumineux. Maximum : 5 Mo' });
  }

  // Erreur non gérée — 500
  console.error('❌ Erreur non gérée :', err);
  return res.status(500).json({ message: 'Erreur interne du serveur' });
};

module.exports = errorHandler;

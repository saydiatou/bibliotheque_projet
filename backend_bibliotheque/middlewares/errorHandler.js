/**
 * Middleware de gestion des erreurs globales (Tâche N4)
 * À enregistrer EN DERNIER dans app.js
 */
const errorHandler = (err, req, res, next) => { // Fonction middleware d'erreur (4 paramètres)

  // Erreur Joi
  if (err.isJoi || err.name === 'ValidationError') { // Si erreur de validation Joi
    return res.status(400).json({ // Retourne 400
      message: 'Données invalides',
      errors: err.details ? err.details.map(d => d.message) : [err.message], // Liste des erreurs
    });
  }

  // Sequelize — contrainte UNIQUE
  if (err.name === 'SequelizeUniqueConstraintError') { // Si violation de contrainte unique
    const field = err.errors?.[0]?.path || 'champ'; // Récupère le champ concerné
    return res.status(400).json({ // Retourne 400
      message: `La valeur du champ "${field}" est déjà utilisée`,
    });
  }

  // Sequelize — validation
  if (err.name === 'SequelizeValidationError') { // Si erreur de validation Sequelize
    return res.status(400).json({ // Retourne 400
      message: 'Données invalides',
      errors: err.errors.map(e => e.message), // Liste des erreurs
    });
  }

  // Sequelize — clé étrangère
  if (err.name === 'SequelizeForeignKeyConstraintError') { // Si clé étrangère invalide
    return res.status(400).json({ // Retourne 400
      message: "Référence invalide : l'ID lié n'existe pas",
    });
  }

  // JWT invalide
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') { // Si token JWT invalide
    return res.status(401).json({ message: 'Token invalide ou expiré' }); // Retourne 401
  }

  // Multer — fichier trop grand
  if (err.code === 'LIMIT_FILE_SIZE') { // Si fichier upload trop grand
    return res.status(400).json({ message: 'Fichier trop volumineux. Maximum : 5 Mo' }); // Retourne 400
  }

  // Erreur non gérée — 500
  console.error('❌ Erreur non gérée :', err); // Log l'erreur en console
  return res.status(500).json({ message: 'Erreur interne du serveur' }); // Retourne 500 générique
};

module.exports = errorHandler;

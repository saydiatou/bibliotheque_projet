const { DataTypes } = require('sequelize'); // Importe DataTypes
const sequelize = require('../config/database'); // Importe Sequelize

const Borrow = sequelize.define('Borrow', { // Définit le modèle Borrow (emprunt)
  id: { // ID
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  member_id: { // ID du membre emprunteur
    type: DataTypes.INTEGER,
    allowNull: false, // Obligatoire
  },
  book_id: { // ID du livre emprunté
    type: DataTypes.INTEGER,
    allowNull: false, // Obligatoire
  },
  borrow_date: { // Date d'emprunt
    type: DataTypes.DATEONLY, // Date sans heure
    defaultValue: DataTypes.NOW, // Défaut : maintenant
  },
  due_date: { // Date d'échéance
    type: DataTypes.DATEONLY,
    allowNull: false, // Obligatoire
  },
  return_date: { // Date de retour
    type: DataTypes.DATEONLY,
    allowNull: true, // Optionnel (null si pas retourné)
  },
  status: { // Statut de l'emprunt
    type: DataTypes.ENUM('borrowed', 'returned', 'overdue'), // Enum
    defaultValue: 'borrowed', // Défaut : emprunté
  },
});

module.exports = Borrow; // Exporte le modèle

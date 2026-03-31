const { DataTypes } = require('sequelize'); // Importe DataTypes
const sequelize = require('../config/database'); // Importe Sequelize

const Member = sequelize.define('Member', { // Définit le modèle Member
  id: { // ID
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: { // Prénom
    type: DataTypes.STRING,
    allowNull: false, // Obligatoire
  },
  last_name: { // Nom de famille
    type: DataTypes.STRING,
    allowNull: false, // Obligatoire
  },
  email: { // Email
    type: DataTypes.STRING,
    allowNull: true, // Optionnel
    unique: true, // Unique
  },
  phone: { // Téléphone
    type: DataTypes.STRING(20), // Max 20 chars
    allowNull: true,
  },
  address: { // Adresse
    type: DataTypes.TEXT, // Texte long
    allowNull: true,
  },
  membership_date: { // Date d'adhésion
    type: DataTypes.DATEONLY, // Date sans heure
    defaultValue: DataTypes.NOW, // Défaut : maintenant
  },
  status: { // Statut
    type: DataTypes.ENUM('active', 'inactive'), // Enum avec valeurs
    defaultValue: 'active', // Défaut : active
  },
});

module.exports = Member; // Exporte le modèle

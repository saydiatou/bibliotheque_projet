const { DataTypes } = require('sequelize'); // Importe DataTypes
const sequelize = require('../config/database'); // Importe Sequelize

const User = sequelize.define('User', { // Définit le modèle User (utilisateur admin)
  id: { // ID
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: { // Nom
    type: DataTypes.STRING,
    allowNull: false, // Obligatoire
  },
  email: { // Email
    type: DataTypes.STRING,
    allowNull: false, // Obligatoire
    unique: true, // Unique
  },
  password: { // Mot de passe haché
    type: DataTypes.STRING,
    allowNull: false, // Obligatoire
  },
});

module.exports = User; // Exporte le modèle

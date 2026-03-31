const { DataTypes } = require('sequelize'); // Importe DataTypes pour typer les colonnes
const sequelize = require('../config/database'); // Importe l'instance Sequelize

const Categories = sequelize.define('Categories', { // Définit le modèle 'Categories' (table 'Categories')
  id: { // Colonne ID
    type: DataTypes.INTEGER, // Type entier
    primaryKey: true, // Clé primaire
    autoIncrement: true, // Auto-incrémentation
  },
  name: { // Colonne nom
    type: DataTypes.STRING, // Chaîne
    allowNull: false, // Obligatoire
    unique: true, // Valeur unique
  },
  description: { // Colonne description
    type: DataTypes.TEXT, // Texte long
    allowNull: true, // Optionnel
  },
});

module.exports = Categories; // Exporte le modèle

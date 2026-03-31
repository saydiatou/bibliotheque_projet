const { Sequelize } = require('sequelize'); // Importe la classe Sequelize pour la connexion DB
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const sequelize = new Sequelize( // Crée une instance Sequelize avec les credentials
  process.env.DB_NAME, // Nom de la base de données depuis .env
  process.env.DB_USER, // Utilisateur DB depuis .env
  process.env.DB_PASSWORD, // Mot de passe DB depuis .env
  {
    host: process.env.DB_HOST, // Hôte DB (e.g., localhost)
    port: process.env.DB_PORT, // Port DB (e.g., 3306 pour MySQL)
    dialect: 'mysql', // Dialecte : MySQL
    logging: false, // Désactive les logs SQL en console
  }
);

module.exports = sequelize; // Exporte l'instance pour utilisation dans les modèles

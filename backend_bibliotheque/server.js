require('dotenv').config(); // Charge les variables d'environnement depuis .env
const app = require('./app'); // Importe l'application Express configurée depuis app.js
const { sequelize, User } = require('./models'); // Importe l'instance Sequelize et le modèle User
const bcrypt = require('bcryptjs'); // Importe bcrypt pour hacher les mots de passe
    

const PORT = process.env.PORT || 5000; // Définit le port depuis .env ou 5000 par défaut

async function startServer() { // Fonction asynchrone pour démarrer le serveur et initialiser la DB
  try {
    await sequelize.authenticate(); // Teste la connexion à la base de données MySQL
    console.log('Connexion MySQL OK'); // Affiche un message de succès

    await sequelize.sync({ alter: true }); // Synchronise les modèles avec la DB, modifie le schéma si nécessaire
    console.log('Tables synchronisees'); // Affiche un message de synchronisation

    // Seeder : créer admin par défaut si aucun utilisateur
    const count = await User.count(); // Compte le nombre d'utilisateurs dans la DB
    if (count === 0) { // Si aucun utilisateur, crée un admin par défaut
      const hashedPassword = await bcrypt.hash('admin123', 10); // Hache le mot de passe avec bcrypt (10 rounds)
      await User.create({ // Crée un nouvel utilisateur admin
        name: 'Administrateur',
        email: 'admin@bibliotheque.com',
        password: hashedPassword, // Stocke le mot de passe haché
      });
      console.log('Compte admin cree : admin@bibliotheque.com / admin123'); // Affiche les infos de l'admin créé
    }

    app.listen(PORT, () => { // Démarre le serveur Express sur le port défini
      console.log(`Serveur demarre sur http://localhost:${PORT}`); // Affiche l'URL du serveur
    });

  } catch (error) { // Capture les erreurs lors du démarrage
    console.error('Erreur au demarrage :', error); // Affiche l'erreur dans la console
    process.exit(1); // Quitte le processus avec un code d'erreur
  }
}

startServer(); // Appelle la fonction pour démarrer le serveur

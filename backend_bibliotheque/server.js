require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');
const { User } = require('./models');      

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connexion MySQL OK');

    await sequelize.sync({ alter: true });
    console.log('Tables synchronisees');

    // Seeder : créer admin par défaut si aucun utilisateur
    const count = await User.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Administrateur',
        email: 'admin@bibliotheque.com',
        password: hashedPassword,
      });
      console.log('Compte admin cree : admin@bibliotheque.com / admin123');
    }

    app.listen(PORT, () => {
      console.log(`Serveur demarre sur http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Erreur au demarrage :', error);
    process.exit(1);
  }
}

startServer();

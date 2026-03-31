const express = require('express'); // Importe le framework Express.js pour construire l'API REST
const cors = require('cors'); // Importe le middleware CORS pour permettre les requêtes cross-origin depuis le frontend
require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env

const errorHandler = require('./middlewares/errorHandler'); // Importe le middleware personnalisé pour gérer les erreurs globales

const app = express(); // Crée une instance de l'application Express

// Middlewares globaux
app.use(cors()); // Applique le middleware CORS à toutes les routes pour éviter les blocages cross-origin
app.use(express.json()); // Active le parsing automatique des corps de requêtes JSON (req.body)
app.use(express.urlencoded({ extended: true })); // Active le parsing des données URL-encodées (formulaires)

// Dossier statique pour les images uploadées
app.use('/uploads', express.static('uploads')); // Sert les fichiers statiques du dossier 'uploads' à l'URL '/uploads'

// Routes
app.use('/api/auth',       require('./routes/auth')); // Monte les routes d'authentification sous /api/auth
app.use('/api/categories', require('./routes/categories')); // Monte les routes des catégories sous /api/categories
app.use('/api/books',      require('./routes/books')); // Monte les routes des livres sous /api/books
app.use('/api/members',    require('./routes/members')); // Monte les routes des membres sous /api/members
app.use('/api/borrows',    require('./routes/borrows')); // Monte les routes des emprunts sous /api/borrows
app.use('/api/stats',      require('./routes/stats')); // Monte les routes des statistiques sous /api/stats

// 404
app.use((req, res) => { // Middleware de catch-all pour les routes non trouvées
  res.status(404).json({ message: 'Route introuvable' }); // Retourne une réponse JSON 404 avec un message
});

// Middleware erreurs globales
app.use(errorHandler); // Applique le middleware de gestion d'erreurs personnalisé

module.exports = app; // Exporte l'instance de l'application pour utilisation dans server.js

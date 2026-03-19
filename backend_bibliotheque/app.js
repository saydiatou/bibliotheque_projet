const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globaux
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dossier statique pour les images uploadées
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/books',      require('./routes/books'));
app.use('/api/members',    require('./routes/members'));
app.use('/api/borrows',    require('./routes/borrows'));
app.use('/api/stats',      require('./routes/stats'));

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// Middleware erreurs globales (Tâche N4 - Ndoumbe)
app.use(errorHandler);

module.exports = app;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation manuelle simple
    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Le nom doit avoir au moins 2 caracteres' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Email invalide' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit avoir au moins 6 caracteres' });
    }

    // Vérifier si l'email existe déjà
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Cet email est deja utilise' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error('Erreur register :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Chercher l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error('Erreur login :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// GET /api/auth/profile (protégé)
const profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error('Erreur profile :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = { register, login, profile };

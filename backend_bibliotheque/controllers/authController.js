const bcrypt = require('bcryptjs'); // Importe bcrypt pour hacher et vérifier les mots de passe
const jwt = require('jsonwebtoken'); // Importe jsonwebtoken pour générer et vérifier les tokens JWT
const { User } = require('../models'); // Importe le modèle User depuis les modèles
require('dotenv').config(); // Charge les variables d'environnement (e.g., JWT_SECRET)

// Générer un token JWT
const generateToken = (user) => { // Fonction helper pour créer un token JWT avec les infos utilisateur
  return jwt.sign( // Signe le token avec les données payload
    { id: user.id, email: user.email }, // Payload : ID et email de l'utilisateur
    process.env.JWT_SECRET, // Clé secrète depuis .env pour signer le token
    { expiresIn: process.env.JWT_EXPIRES_IN } // Durée d'expiration du token (e.g., '1h')
  );
};

// POST /api/auth/register
const register = async (req, res) => { // Fonction pour enregistrer un nouvel utilisateur
  try {
    const { name, email, password } = req.body; // Extrait les données du corps de la requête

    // Validation manuelle simple
    if (!name || name.length < 2) { // Vérifie si le nom est valide (au moins 2 caractères)
      return res.status(400).json({ message: 'Le nom doit avoir au moins 2 caracteres' }); // Retourne une erreur 400 si invalide
    }
    if (!email || !email.includes('@')) { // Vérifie si l'email contient '@'
      return res.status(400).json({ message: 'Email invalide' }); // Erreur si email invalide
    }
    if (!password || password.length < 6) { // Vérifie la longueur du mot de passe
      return res.status(400).json({ message: 'Le mot de passe doit avoir au moins 6 caracteres' }); // Erreur si trop court
    }

    // Vérifier si l'email existe déjà
    const existing = await User.findOne({ where: { email } }); // Recherche un utilisateur avec cet email
    if (existing) { // Si trouvé, email déjà utilisé
      return res.status(400).json({ message: 'Cet email est deja utilise' }); // Erreur 400
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10); // Hache le mot de passe avec 10 rounds

    // Créer l'utilisateur
    const user = await User.create({ name, email, password: hashedPassword }); // Crée l'utilisateur en DB

    const token = generateToken(user); // Génère un token JWT pour l'utilisateur

    return res.status(201).json({ // Retourne une réponse 201 (créé) avec token et infos utilisateur
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (error) { // Capture les erreurs (e.g., DB)
    console.error('Erreur register :', error); // Log l'erreur en console
    return res.status(500).json({ message: 'Erreur interne du serveur' }); // Erreur 500 générique
  }
};

// POST /api/auth/login
const login = async (req, res) => { // Fonction pour connecter un utilisateur existant
  try {
    const { email, password } = req.body; // Extrait email et password du corps

    if (!email || !password) { // Vérifie si email et password sont fournis
      return res.status(400).json({ message: 'Email et mot de passe requis' }); // Erreur si manquant
    }

    // Chercher l'utilisateur par email
    const user = await User.findOne({ where: { email } }); // Recherche l'utilisateur en DB
    if (!user) { // Si non trouvé
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' }); // Erreur 401 (non autorisé)
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password); // Compare le password fourni avec le haché
    if (!isValid) { // Si ne correspond pas
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' }); // Erreur 401
    }

    const token = generateToken(user); // Génère le token JWT

    return res.status(200).json({ // Retourne 200 avec token et infos
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (error) { // Capture les erreurs
    console.error('Erreur login :', error); // Log l'erreur
    return res.status(500).json({ message: 'Erreur interne du serveur' }); // Erreur 500
  }
};

// GET /api/auth/profile (protégé)
const profile = async (req, res) => { // Fonction pour récupérer le profil de l'utilisateur connecté (via middleware auth)
  try {
    const user = await User.findByPk(req.user.id, { // Recherche l'utilisateur par ID (ajouté par le middleware)
      attributes: ['id', 'name', 'email'], // Sélectionne seulement ces champs (exclut password)
    });

    if (!user) { // Si utilisateur non trouvé
      return res.status(404).json({ message: 'Utilisateur introuvable' }); // Erreur 404
    }

    return res.status(200).json(user); // Retourne les infos utilisateur

  } catch (error) { // Capture les erreurs
    console.error('Erreur profile :', error); // Log l'erreur
    return res.status(500).json({ message: 'Erreur interne du serveur' }); // Erreur 500
  }
};

module.exports = { register, login, profile }; // Exporte les fonctions pour utilisation dans les routes

const { Op } = require('sequelize'); // Importe les opérateurs Sequelize pour les requêtes (e.g., Op.like)
const Joi = require('joi'); // Importe Joi pour la validation des données d'entrée
const { Book, Category } = require('../models'); // Importe les modèles Book et Category

// ---- Schémas Joi ----
const bookSchema = Joi.object({ // Schéma de validation pour créer un livre (tous champs requis sauf optionnels)
  title:              Joi.string().min(1).max(255).required(), // Titre : chaîne obligatoire, 1-255 chars
  author:             Joi.string().min(1).max(255).required(), // Auteur : chaîne obligatoire
  isbn:               Joi.string().max(20).optional().allow('', null), // ISBN : optionnel, max 20 chars
  category_id:        Joi.number().required(), // ID catégorie : nombre obligatoire
  description:        Joi.string().max(1000).optional().allow('', null), // Description : optionnelle, max 1000 chars
  quantity:           Joi.number().integer().min(1).required(), // Quantité : entier >=1 obligatoire
  available_quantity: Joi.number().integer().min(0).optional(), // Quantité disponible : optionnelle, >=0
});

const bookUpdateSchema = Joi.object({ // Schéma pour mettre à jour un livre (tous champs optionnels)
  title:              Joi.string().min(1).max(255).optional(), // Titre : optionnel
  author:             Joi.string().min(1).max(255).optional(), // Auteur : optionnel
  isbn:               Joi.string().max(20).optional().allow('', null), // ISBN : optionnel
  category_id:        Joi.number().optional(), // ID catégorie : optionnel
  description:        Joi.string().max(1000).optional().allow('', null), // Description : optionnelle
  quantity:           Joi.number().integer().min(1).optional(), // Quantité : optionnelle
  available_quantity: Joi.number().integer().min(0).optional(), // Quantité disponible : optionnelle
});

// GET /api/books
const getBooks = async (req, res) => { // Fonction pour récupérer la liste des livres avec pagination et filtres
  try {
    const { search, category_id, page = 1, limit = 10 } = req.query; // Extrait les paramètres de requête

    const where = {}; // Objet de conditions WHERE pour Sequelize

    if (search) { // Si recherche fournie
      where[Op.or] = [ // Condition OR : titre OU auteur contient la recherche
        { title:  { [Op.like]: `%${search}%` } }, // Recherche dans le titre
        { author: { [Op.like]: `%${search}%` } }, // Recherche dans l'auteur
      ];
    }

    if (category_id) { // Si filtre par catégorie
      where.category_id = category_id; // Ajoute la condition category_id
    }

    const offset = (parseInt(page) - 1) * parseInt(limit); // Calcule l'offset pour la pagination

    const { count, rows } = await Book.findAndCountAll({ // Récupère les livres et le total
      where, // Conditions de filtrage
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }], // Inclut la catégorie liée
      limit:   parseInt(limit), // Nombre max par page
      offset, // Décalage pour la page
      order:   [['createdAt', 'DESC']], // Trie par date de création décroissante
    });

    return res.status(200).json({ // Retourne la réponse JSON
      total:      count, // Nombre total de livres
      page:       parseInt(page), // Page actuelle
      totalPages: Math.ceil(count / parseInt(limit)), // Nombre total de pages
      books:      rows, // Liste des livres
    });

  } catch (error) { // Capture les erreurs
    console.error('Erreur getBooks :', error); // Log l'erreur
    return res.status(500).json({ message: 'Erreur interne du serveur' }); // Erreur 500
  }
};

// POST /api/books
const createBook = async (req, res) => { // Fonction pour créer un nouveau livre
  try {
    // Validation Joi
    const { error } = bookSchema.validate(req.body, { abortEarly: false }); // Valide les données avec Joi (toutes erreurs)
    if (error) { // Si erreurs de validation
      return res.status(400).json({ // Retourne 400 avec détails des erreurs
        message: 'Donnees invalides',
        errors: error.details.map((e) => e.message), // Liste des messages d'erreur
      });
    }

    const { title, author, isbn, category_id, description, quantity, available_quantity } = req.body; // Extrait les données

    // Vérifier que la catégorie existe
    const category = await Category.findByPk(category_id); // Recherche la catégorie par ID
    if (!category) { // Si non trouvée
      return res.status(400).json({ message: 'Categorie introuvable' }); // Erreur 400
    }

    const book = await Book.create({ // Crée le livre en DB
      title,
      author,
      isbn:               isbn || null, // ISBN ou null
      category_id,
      description:        description || null, // Description ou null
      quantity:           parseInt(quantity), // Convertit en entier
      available_quantity: available_quantity ? parseInt(available_quantity) : parseInt(quantity), // Défaut = quantity
      cover_image:        req.file ? req.file.filename : null, // Image uploadée ou null
    });

    return res.status(201).json(book); // Retourne 201 avec le livre créé

  } catch (error) { // Capture les erreurs
    console.error('Erreur createBook :', error); // Log l'erreur
    return res.status(500).json({ message: 'Erreur interne du serveur' }); // Erreur 500
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => { // Fonction pour mettre à jour un livre
  try {
    const book = await Book.findByPk(req.params.id); // Recherche le livre par ID
    if (!book) { // Si non trouvé
      return res.status(404).json({ message: 'Livre introuvable' }); // Erreur 404
    }

    // Validation Joi
    const { error } = bookUpdateSchema.validate(req.body, { abortEarly: false }); // Valide les données de mise à jour
    if (error) { // Si erreurs
      return res.status(400).json({ // Retourne 400 avec erreurs
        message: 'Donnees invalides',
        errors: error.details.map((e) => e.message),
      });
    }

    const { title, author, isbn, category_id, description, quantity, available_quantity } = req.body; // Extrait les données

    // Remplacer image seulement si nouveau fichier envoyé
    const cover_image = req.file ? req.file.filename : book.cover_image; // Nouvelle image ou garde l'ancienne

    await book.update({ // Met à jour le livre
      title:              title              || book.title, // Garde l'ancien si non fourni
      author:             author             || book.author,
      isbn:               isbn               !== undefined ? isbn : book.isbn, // Permet null
      category_id:        category_id        || book.category_id,
      description:        description        !== undefined ? description : book.description, // Permet null
      quantity:           quantity           ? parseInt(quantity)           : book.quantity,
      available_quantity: available_quantity ? parseInt(available_quantity) : book.available_quantity,
      cover_image, // Met à jour l'image
    });

    return res.status(200).json(book); // Retourne 200 avec le livre mis à jour

  } catch (error) { // Capture les erreurs
    console.error('Erreur updateBook :', error); // Log l'erreur
    return res.status(500).json({ message: 'Erreur interne du serveur' }); // Erreur 500
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => { // Fonction pour supprimer un livre
  try {
    const book = await Book.findByPk(req.params.id); // Recherche le livre par ID
    if (!book) { // Si non trouvé
      return res.status(404).json({ message: 'Livre introuvable' }); // Erreur 404
    }

    await book.destroy(); // Supprime le livre de la DB
    return res.status(200).json({ message: 'Livre supprime' }); // Retourne 200 avec message

  } catch (error) { // Capture les erreurs
    console.error('Erreur deleteBook :', error); // Log l'erreur
    return res.status(500).json({ message: 'Erreur interne du serveur' }); // Erreur 500
  }
};

module.exports = { getBooks, createBook, updateBook, deleteBook }; // Exporte les fonctions pour les routes

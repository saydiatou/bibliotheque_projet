const multer = require('multer'); // Importe Multer pour gérer les uploads de fichiers
const path = require('path'); // Importe path pour manipuler les chemins de fichiers

const storage = multer.diskStorage({ // Définit le stockage sur disque
  destination: (req, file, cb) => { // Fonction pour définir le dossier de destination
    cb(null, 'uploads/'); // Sauvegarde dans le dossier 'uploads/'
  },
  filename: (req, file, cb) => { // Fonction pour générer le nom du fichier
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9); // Nom unique avec timestamp + random
    const ext = path.extname(file.originalname); // Récupère l'extension du fichier original
    cb(null, uniqueName + ext); // Nom final : unique + extension
  },
});

const fileFilter = (req, file, cb) => { // Filtre pour valider le type de fichier
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']; // Types autorisés
  if (allowed.includes(file.mimetype)) { // Si le type est autorisé
    cb(null, true); // Accepte le fichier
  } else { // Sinon
    cb(new Error('Format non autorise (jpeg, jpg, png, webp uniquement)'), false); // Rejette avec erreur
  }
};

const upload = multer({ // Crée l'instance Multer
  storage, // Utilise le stockage défini
  fileFilter, // Applique le filtre
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite : 5 Mo max
});

module.exports = upload; // Exporte l'instance pour utilisation dans les routes

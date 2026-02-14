const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const rateLimit = require('express-rate-limit');
const db = require('./database');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'votre_cle_secrete_eglise_2026';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware d'authentification JWT
const verifierToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.userId = decoded.id;
    next();
  });
};

// Route de connexion
app.post('/api/login', loginLimiter, (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  db.get('SELECT * FROM utilisateurs WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    bcrypt.compare(mot_de_passe, user.mot_de_passe, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: '24h'
      });

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom
        }
      });
    });
  });
});

// Créer un nouveau membre
app.post('/api/membres', verifierToken, (req, res) => {
  const {
    nom,
    prenom,
    phone,
    email,
    adresse,
    statut_matrimonial,
    nombre_enfants,
    nationalite,
    langue_parlee,
    niveau_etude
  } = req.body;

  if (!nom || !prenom) {
    return res.status(400).json({ message: 'Nom et prénom sont requis' });
  }

  const query = `INSERT INTO membres (
    nom, prenom, phone, email, adresse, statut_matrimonial, 
    nombre_enfants, nationalite, langue_parlee, niveau_etude
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    query,
    [nom, prenom, phone, email, adresse, statut_matrimonial, nombre_enfants, nationalite, langue_parlee, niveau_etude],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de l\'ajout du membre' });
      }

      res.status(201).json({
        message: 'Membre ajouté avec succès',
        id: this.lastID
      });
    }
  );
});

// Récupérer tous les membres
app.get('/api/membres', verifierToken, (req, res) => {
  db.all('SELECT * FROM membres ORDER BY created_at DESC', [], (err, membres) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des membres' });
    }

    res.json(membres);
  });
});

// Récupérer un membre spécifique
app.get('/api/membres/:id', verifierToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM membres WHERE id = ?', [id], (err, membre) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération du membre' });
    }

    if (!membre) {
      return res.status(404).json({ message: 'Membre non trouvé' });
    }

    res.json(membre);
  });
});

// Modifier un membre
app.put('/api/membres/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const {
    nom,
    prenom,
    phone,
    email,
    adresse,
    statut_matrimonial,
    nombre_enfants,
    nationalite,
    langue_parlee,
    niveau_etude
  } = req.body;

  if (!nom || !prenom) {
    return res.status(400).json({ message: 'Nom et prénom sont requis' });
  }

  const query = `UPDATE membres SET 
    nom = ?, prenom = ?, phone = ?, email = ?, adresse = ?, 
    statut_matrimonial = ?, nombre_enfants = ?, nationalite = ?, 
    langue_parlee = ?, niveau_etude = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?`;

  db.run(
    query,
    [nom, prenom, phone, email, adresse, statut_matrimonial, nombre_enfants, nationalite, langue_parlee, niveau_etude, id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la modification du membre' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Membre non trouvé' });
      }

      res.json({ message: 'Membre modifié avec succès' });
    }
  );
});

// Supprimer un membre
app.delete('/api/membres/:id', verifierToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM membres WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression du membre' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Membre non trouvé' });
    }

    res.json({ message: 'Membre supprimé avec succès' });
  });
});

// Rechercher des membres
app.get('/api/membres/rechercher/query', verifierToken, (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Paramètre de recherche manquant' });
  }

  const query = `SELECT * FROM membres WHERE 
    nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR phone LIKE ?
    ORDER BY created_at DESC`;

  const searchTerm = `%${q}%`;

  db.all(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, membres) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la recherche' });
    }

    res.json(membres);
  });
});

// Statistiques
app.get('/api/statistiques', verifierToken, (req, res) => {
  db.get('SELECT COUNT(*) as total FROM membres', [], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }

    res.json({
      total_membres: result.total
    });
  });
});

// Route par défaut pour rediriger vers login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📂 Frontend accessible sur http://localhost:${PORT}/login.html`);
});

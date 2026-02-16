const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { supabase, initDatabase } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'votre_cle_secrete_eglise_2026';

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
app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const { data: utilisateur, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !utilisateur) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ id: utilisateur.id, email: utilisateur.email }, SECRET_KEY, {
      expiresIn: '24h'
    });

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Endpoint d'initialisation des comptes admin (À SUPPRIMER APRÈS UTILISATION)
app.get('/api/init-admin', async (req, res) => {
    try {
        // Générer les hashes
        const adminPassword = await bcrypt.hash('admin123', 10);
        const pasteurPassword = await bcrypt.hash('pasteur123', 10);

        // Supprimer les anciens comptes
        await supabase
            .from('utilisateurs')
            .delete()
            .in('email', ['admin@eglise.com', 'pasteur@eglise.com']);

        // Créer les nouveaux comptes
        const { data: admin, error: adminError } = await supabase
            .from('utilisateurs')
            .insert([{
                email: 'admin@eglise.com',
                mot_de_passe: adminPassword,
                nom: 'Administrateur'
            }])
            .select()
            .single();

        const { data: pasteur, error: pasteurError } = await supabase
            .from('utilisateurs')
            .insert([{
                email: 'pasteur@eglise.com',
                mot_de_passe: pasteurPassword,
                nom: 'Pasteur'
            }])
            .select()
            .single();

        if (adminError || pasteurError) {
            throw new Error('Erreur lors de la création des comptes');
        }

        res.json({
            message: 'Comptes administrateurs créés avec succès',
            instructions: 'Vous pouvez maintenant vous connecter avec admin@eglise.com ou pasteur@eglise.com',
            note: 'Pour des raisons de sécurité, supprimez cet endpoint après utilisation'
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des admins:', error);
        res.status(500).json({ message: 'Erreur lors de l\'initialisation des comptes admin' });
    }
});

// Créer un nouveau membre
app.post('/api/membres', verifierToken, async (req, res) => {
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

  try {
    const { data, error } = await supabase
      .from('membres')
      .insert([{
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
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Membre ajouté avec succès',
      membre: data
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du membre' });
  }
});

// Récupérer tous les membres
app.get('/api/membres', verifierToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('membres')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des membres' });
  }
});

// Récupérer un membre spécifique
app.get('/api/membres/:id', verifierToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('membres')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: 'Membre non trouvé' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du membre' });
  }
});

// Modifier un membre
app.put('/api/membres/:id', verifierToken, async (req, res) => {
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

  try {
    const { data, error } = await supabase
      .from('membres')
      .update({
        nom,
        prenom,
        phone,
        email,
        adresse,
        statut_matrimonial,
        nombre_enfants,
        nationalite,
        langue_parlee,
        niveau_etude,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Membre modifié avec succès', membre: data });
  } catch (error) {
    console.error('Erreur lors de la modification du membre:', error);
    res.status(500).json({ message: 'Erreur lors de la modification du membre' });
  }
});

// Supprimer un membre
app.delete('/api/membres/:id', verifierToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('membres')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Membre non trouvé' });
    }

    res.json({ message: 'Membre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du membre' });
  }
});

// Rechercher des membres
app.get('/api/membres/rechercher/query', verifierToken, async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Paramètre de recherche manquant' });
  }

  // Validate and sanitize search input to prevent injection
  const searchTerm = String(q).trim();
  if (searchTerm.length === 0 || searchTerm.length > 100) {
    return res.status(400).json({ message: 'Paramètre de recherche invalide' });
  }

  try {
    const { data, error } = await supabase
      .from('membres')
      .select('*')
      .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche' });
  }
});

// Statistiques
app.get('/api/statistiques', verifierToken, async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('membres')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.json({
      total_membres: count || 0
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// Route par défaut pour rediriger vers login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Démarrer le serveur
initDatabase().then((success) => {
  if (success) {
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur le port ${PORT}`);
      console.log(`🌐 API disponible sur http://localhost:${PORT}`);
    });
  } else {
    console.log('⚠️  Serveur démarré mais la base de données nécessite une configuration');
    app.listen(PORT);
  }
});

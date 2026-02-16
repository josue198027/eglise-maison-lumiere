const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Créer ou ouvrir la base de données
const dbPath = path.join(__dirname, 'eglise.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données:', err);
  } else {
    console.log('✅ Connexion à la base de données SQLite réussie');
  }
});

// Créer les tables
db.serialize(() => {
  // Table utilisateurs
  db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    nom TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table utilisateurs:', err);
    } else {
      console.log('✅ Table utilisateurs créée ou déjà existante');
    }
  });

  // Table membres
  db.run(`CREATE TABLE IF NOT EXISTS membres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    adresse TEXT,
    statut_matrimonial TEXT,
    nombre_enfants INTEGER,
    nationalite TEXT,
    langue_parlee TEXT,
    niveau_etude TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table membres:', err);
    } else {
      console.log('✅ Table membres créée ou déjà existante');
    }
  });

  // Insérer les comptes administrateurs par défaut
  const comptes = [
    { email: 'admin@eglise.com', password: 'admin123', nom: 'Administrateur' },
    { email: 'pasteur@eglise.com', password: 'pasteur123', nom: 'Pasteur' }
  ];

  comptes.forEach((compte) => {
    db.get('SELECT * FROM utilisateurs WHERE email = ?', [compte.email], (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification des utilisateurs:', err);
      } else if (!row) {
        // Hasher le mot de passe
        bcrypt.hash(compte.password, 10, (err, hash) => {
          if (err) {
            console.error('Erreur lors du hashage du mot de passe:', err);
          } else {
            db.run(
              'INSERT INTO utilisateurs (email, mot_de_passe, nom) VALUES (?, ?, ?)',
              [compte.email, hash, compte.nom],
              (err) => {
                if (err) {
                  console.error('Erreur lors de l\'insertion de l\'utilisateur:', err);
                } else {
                  console.log(`✅ Compte créé: ${compte.email}`);
                }
              }
            );
          }
        });
      }
    });
  });
});

module.exports = db;

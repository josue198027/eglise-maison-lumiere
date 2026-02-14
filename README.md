# 🙏 Application de Gestion des Membres - Église de Dieu Maison de Lumière

Application web complète pour la gestion des membres de l'Église de Dieu Maison de Lumière avec authentification sécurisée.

## 📋 Fonctionnalités

### Authentification
- Page de connexion sécurisée avec email et mot de passe
- 2 comptes administrateurs prédéfinis
- Système de tokens JWT pour la sécurité (validité: 24h)
- Hashing des mots de passe avec bcrypt

### Gestion des membres
- **Enregistrer** de nouveaux membres avec informations complètes
- **Rechercher** des membres par nom, prénom, email ou téléphone
- **Afficher** la liste complète des membres
- **Modifier** les données d'un membre existant
- **Supprimer** un membre avec confirmation
- **Statistiques** : nombre total de membres

### Informations des membres
- Nom et prénom (requis)
- Téléphone et email
- Adresse
- Statut matrimonial (Célibataire, Marié(e), Divorcé(e), Veuf/Veuve)
- Nombre d'enfants
- Nationalité
- Langue parlée
- Niveau d'étude (Primaire, Secondaire, Universitaire, Post-universitaire, Autre)

## 🏗️ Structure du projet

```
eglise-maison-lumiere/
├── backend/
│   ├── package.json          # Dépendances Node.js
│   ├── database.js           # Configuration SQLite et tables
│   ├── server.js             # Serveur Express et API
│   └── eglise.db            # Base de données (créée automatiquement)
├── frontend/
│   ├── login.html           # Page de connexion
│   ├── dashboard.html       # Tableau de bord
│   ├── ajouter.html         # Ajouter un membre
│   ├── rechercher.html      # Rechercher/lister membres
│   ├── modifier.html        # Modifier un membre
│   ├── css/
│   │   └── style.css        # Styles complets
│   ├── js/
│   │   └── app.js           # Logique JavaScript
│   └── images/
│       └── logo.png         # Logo de l'église (à ajouter)
├── .gitignore
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm (inclus avec Node.js)

### Étapes d'installation

1. **Cloner le projet** (si depuis Git)
```bash
git clone <url-du-repo>
cd eglise-maison-lumiere
```

2. **Installer les dépendances**
```bash
cd backend
npm install
```

3. **Démarrer le serveur**
```bash
npm start
```

Le serveur démarre sur http://localhost:3000

4. **Accéder à l'application**
Ouvrir dans un navigateur : http://localhost:3000/login.html

## 🔐 Comptes par défaut

Deux comptes administrateurs sont créés automatiquement :

| Email | Mot de passe | Nom |
|-------|-------------|-----|
| admin@eglise.com | admin123 | Administrateur |
| pasteur@eglise.com | pasteur123 | Pasteur |

**⚠️ Important :** Changez ces mots de passe en production !

## 🔧 Technologies utilisées

### Backend
- **Node.js** - Environnement d'exécution JavaScript
- **Express** - Framework web
- **SQLite3** - Base de données
- **bcryptjs** - Hashing des mots de passe
- **jsonwebtoken** - Authentification JWT
- **cors** - Gestion des requêtes cross-origin
- **body-parser** - Parsing des requêtes

### Frontend
- **HTML5** - Structure
- **CSS3** - Design moderne et responsive
- **JavaScript (Vanilla)** - Logique côté client
- **Fetch API** - Requêtes HTTP

## 📡 API Endpoints

Toutes les routes (sauf `/api/login`) nécessitent un token JWT dans l'en-tête `Authorization: Bearer <token>`.

### Authentification
- `POST /api/login` - Connexion

### Membres
- `POST /api/membres` - Créer un membre
- `GET /api/membres` - Liste tous les membres
- `GET /api/membres/:id` - Récupérer un membre spécifique
- `PUT /api/membres/:id` - Modifier un membre
- `DELETE /api/membres/:id` - Supprimer un membre
- `GET /api/membres/rechercher/query?q=` - Rechercher des membres

### Statistiques
- `GET /api/statistiques` - Obtenir les statistiques

## 🎨 Personnalisation

### Ajouter votre logo

1. Préparez une image de logo (format PNG recommandé)
2. Dimensions recommandées : 120x120 pixels
3. Placez le fichier dans `frontend/images/logo.png`
4. Le logo apparaîtra automatiquement sur toutes les pages

### Changer les couleurs

Modifiez les variables dans `frontend/css/style.css` :
- `#667eea` - Violet primaire
- `#764ba2` - Violet secondaire

### Modifier la clé secrète JWT

Dans `backend/server.js`, changez :
```javascript
const SECRET_KEY = 'votre_cle_secrete_eglise_2026';
```

**⚠️ Important :** Utilisez une clé complexe et unique en production !

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ Authentification JWT (tokens valides 24h)
- ✅ Protection CORS
- ✅ Validation des tokens sur toutes les routes API
- ✅ Validation des entrées côté client et serveur

### Recommandations pour la production

1. **Changez la SECRET_KEY** dans `server.js`
2. **Changez les mots de passe** des comptes admin
3. **Utilisez HTTPS** (certificat SSL/TLS)
4. **Ajoutez des variables d'environnement** (.env)
5. **Utilisez une base de données production** (PostgreSQL, MySQL)
6. **Activez les logs** pour le monitoring
7. **Mettez en place des sauvegardes** régulières

## 📱 Design responsive

L'interface s'adapte automatiquement :
- **Desktop** : Vue complète avec grilles multi-colonnes
- **Tablette** : Adaptation des grilles
- **Mobile** : Vue en colonne unique optimisée

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que Node.js est installé : `node --version`
- Vérifiez que les dépendances sont installées : `npm install`
- Vérifiez que le port 3000 n'est pas utilisé

### Erreur "Token invalide"
- Reconnectez-vous
- Vérifiez que le serveur est bien démarré
- Videz le cache du navigateur

### La base de données ne se crée pas
- Vérifiez les permissions du dossier backend
- Supprimez `eglise.db` et redémarrez le serveur

## 📚 Développement

### Mode développement avec auto-reload
```bash
npm run dev
```

Utilise nodemon pour redémarrer automatiquement le serveur lors des modifications.

### Structure de la base de données

**Table utilisateurs:**
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- mot_de_passe (TEXT)
- nom (TEXT)
- created_at (DATETIME)

**Table membres:**
- id (INTEGER PRIMARY KEY)
- nom, prenom (TEXT)
- phone, email, adresse (TEXT)
- statut_matrimonial (TEXT)
- nombre_enfants (INTEGER)
- nationalite, langue_parlee (TEXT)
- niveau_etude (TEXT)
- created_at, updated_at (DATETIME)

## 🚀 Déploiement

### Serveur local
L'application est prête à fonctionner en local.

### Hébergement web
Pour déployer en production :
1. Hébergez le backend sur un serveur Node.js (Heroku, DigitalOcean, AWS, etc.)
2. Servez les fichiers frontend via le serveur Express (déjà configuré)
3. Configurez un nom de domaine
4. Activez HTTPS
5. Utilisez une base de données production

## 📄 Licence

Ce projet est développé pour l'Église de Dieu Maison de Lumière.

## 🙏 Support

Pour toute question ou problème, contactez l'administrateur de l'église.

---

**Développé avec ❤️ pour l'Église de Dieu Maison de Lumière**

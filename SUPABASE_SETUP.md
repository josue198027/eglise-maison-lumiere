# 🗄️ Configuration de Supabase pour l'Application Église

## 📋 Étape 1 : Créer un compte et un projet Supabase

1. Allez sur https://supabase.com
2. Cliquez sur **"Start your project"**
3. Connectez-vous avec GitHub (recommandé)
4. Cliquez sur **"New Project"**
5. Remplissez :
   - **Name:** `eglise-maison-lumiere`
   - **Database Password:** (choisissez un mot de passe fort et notez-le)
   - **Region:** Choisissez la région la plus proche
6. Cliquez sur **"Create new project"**
7. Attendez 2-3 minutes que le projet soit créé

## 📋 Étape 2 : Créer les tables

1. Dans votre projet Supabase, cliquez sur **"SQL Editor"** dans le menu de gauche
2. Cliquez sur **"New query"**
3. Copiez-collez le script SQL ci-dessous :

```sql
-- Table des utilisateurs (administrateurs)
CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des membres de l'église
CREATE TABLE membres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    adresse TEXT,
    statut_matrimonial VARCHAR(50),
    nombre_enfants INTEGER,
    nationalite VARCHAR(100),
    langue_parlee VARCHAR(100),
    niveau_etude VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les comptes administrateurs par défaut
-- Note: Les mots de passe sont hashés avec bcrypt
-- admin123 hashé: $2a$10$eIphYrp4F7NBlJaepqpajup99S7lej9P9/1AOlauQqdAvPSHU9q0i
-- pasteur123 hashé: $2a$10$4ehaDA0GKBBcsyYfOq.gs..oO3jbYfJCx/705FEvWQ9ooxZbw/j5C

INSERT INTO utilisateurs (email, mot_de_passe, nom) VALUES
('admin@eglise.com', '$2a$10$eIphYrp4F7NBlJaepqpajup99S7lej9P9/1AOlauQqdAvPSHU9q0i', 'Administrateur'),
('pasteur@eglise.com', '$2a$10$4ehaDA0GKBBcsyYfOq.gs..oO3jbYfJCx/705FEvWQ9ooxZbw/j5C', 'Pasteur');

-- Créer des index pour améliorer les performances
CREATE INDEX idx_membres_nom ON membres(nom);
CREATE INDEX idx_membres_prenom ON membres(prenom);
CREATE INDEX idx_membres_email ON membres(email);
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
```

4. Cliquez sur **"Run"** pour exécuter le script
5. Vérifiez que les tables ont été créées en allant dans **"Table Editor"**

## 📋 Étape 3 : Récupérer les clés API

1. Cliquez sur **"Settings"** (icône d'engrenage) dans le menu de gauche
2. Cliquez sur **"API"**
3. Notez ces deux valeurs importantes :
   - **Project URL** (commence par `https://xxxxx.supabase.co`)
   - **anon/public key** (longue clé commençant par `eyJ...`)

## 📋 Étape 4 : Configurer les variables d'environnement sur Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur votre service `eglise-maison-lumiere`
3. Cliquez sur **"Environment"** dans le menu de gauche
4. Ajoutez ces variables d'environnement :

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Votre Project URL de Supabase |
| `SUPABASE_KEY` | Votre anon/public key de Supabase |
| `JWT_SECRET` | `votre_cle_secrete_eglise_2026` |
| `PORT` | `3000` |

5. Cliquez sur **"Save Changes"**
6. Votre application va redémarrer automatiquement

## ✅ Étape 5 : Vérifier que tout fonctionne

1. Attendez que Render finisse de redéployer (2-3 minutes)
2. Allez sur https://eglise-maison-lumiere.onrender.com/login.html
3. Connectez-vous avec :
   - Email: `admin@eglise.com`
   - Mot de passe: `admin123`
4. Si la connexion fonctionne, tout est configuré correctement ! 🎉

## 👀 Visualiser vos données sur Supabase

Maintenant vous pouvez voir toutes vos données directement sur Supabase :

1. Allez sur https://supabase.com/dashboard
2. Ouvrez votre projet `eglise-maison-lumiere`
3. Cliquez sur **"Table Editor"**
4. Cliquez sur **"membres"** pour voir tous les membres
5. Cliquez sur **"utilisateurs"** pour voir les administrateurs

Vous pouvez :
- ✅ Voir toutes les données en temps réel
- ✅ Modifier directement depuis le dashboard
- ✅ Exporter en CSV
- ✅ Faire des recherches avancées
- ✅ Voir les statistiques

## 🔒 Sécurité (Optionnel mais recommandé)

Pour sécuriser davantage votre application, activez Row Level Security (RLS) :

1. Dans Supabase, allez dans **"Authentication"** → **"Policies"**
2. Activez RLS pour les tables `membres` et `utilisateurs`
3. Créez des politiques pour autoriser l'accès seulement aux utilisateurs authentifiés

## 🆘 Problèmes courants

**Erreur "Variables d'environnement Supabase manquantes"**
→ Vérifiez que vous avez bien ajouté `SUPABASE_URL` et `SUPABASE_KEY` dans Render

**Erreur "Les tables n'existent pas encore"**
→ Retournez à l'Étape 2 et exécutez le script SQL

**Impossible de se connecter**
→ Vérifiez que les comptes admin ont bien été créés avec le script SQL

## 📞 Support

Si vous avez des questions, consultez :
- Documentation Supabase : https://supabase.com/docs
- Documentation Render : https://render.com/docs

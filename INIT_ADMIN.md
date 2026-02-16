# 🔐 Initialisation des comptes administrateurs

Ce guide explique comment initialiser les comptes administrateurs dans Supabase avec les bons mots de passe hashés.

## 📋 Prérequis

- Supabase configuré avec les tables créées
- Variables d'environnement `SUPABASE_URL` et `SUPABASE_KEY` configurées sur Render

## 🎯 Méthode 1 : Utiliser l'endpoint d'initialisation (RECOMMANDÉ)

Cette méthode est la plus simple et fonctionne directement depuis le navigateur.

### Étapes :

1. **Ouvrez votre navigateur**
2. **Allez sur cette URL** : `https://eglise-maison-lumiere.onrender.com/api/init-admin`
3. Vous verrez un message JSON confirmant la création des comptes
4. **C'est terminé !** Les comptes sont créés avec les bons mots de passe

### Comptes créés :

- **Administrateur**
  - Email : `admin@eglise.com`
  - Mot de passe : `admin123`

- **Pasteur**
  - Email : `pasteur@eglise.com`
  - Mot de passe : `pasteur123`

### Tester la connexion :

1. Allez sur : https://eglise-maison-lumiere.onrender.com/login.html
2. Connectez-vous avec `admin@eglise.com` / `admin123`
3. ✅ Ça devrait fonctionner !

---

## 🎯 Méthode 2 : Exécuter le script localement (AVANCÉ)

Si vous avez cloné le projet localement :

### Étapes :

1. **Ouvrez un terminal** dans le dossier `backend`
2. **Assurez-vous que les dépendances sont installées** :
   ```bash
   npm install
   ```
3. **Créez un fichier `.env`** dans le dossier `backend` avec :
   ```
   SUPABASE_URL=votre_url_supabase
   SUPABASE_KEY=votre_cle_anon_supabase
   ```
4. **Exécutez le script** :
   ```bash
   node init-admin.js
   ```
5. Vous verrez :
   ```
   🔐 Initialisation des comptes administrateurs...
   ✅ Compte créé: admin@eglise.com / admin123
   ✅ Compte créé: pasteur@eglise.com / pasteur123
   🎉 Initialisation terminée avec succès !
   ```

---

## 🔍 Vérifier dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Ouvrez votre projet `eglise-maison-lumiere`
3. Cliquez sur **Table Editor** → **utilisateurs**
4. Vous devriez voir 2 comptes :
   - `admin@eglise.com`
   - `pasteur@eglise.com`

---

## 🔒 Sécurité

⚠️ **IMPORTANT** : Après avoir utilisé l'endpoint `/api/init-admin`, vous devriez le supprimer du code pour des raisons de sécurité, ou le protéger avec une clé secrète.

---

## ❓ Problèmes courants

### "Erreur lors de la création des comptes"
→ Vérifiez que les variables d'environnement sont bien configurées sur Render

### "Cannot connect to Supabase"
→ Vérifiez que `SUPABASE_URL` et `SUPABASE_KEY` sont corrects

### Les comptes existent mais je ne peux pas me connecter
→ Réexécutez le script pour régénérer les mots de passe hashés

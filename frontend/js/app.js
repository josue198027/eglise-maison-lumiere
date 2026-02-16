// Configuration de l'API
const API_URL = 'http://localhost:3000';

/**
 * Vérifier si l'utilisateur est authentifié
 * Redirige vers la page de connexion si non authentifié
 */
function verifierAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }
  
  return true;
}

/**
 * Déconnexion de l'utilisateur
 * Supprime le token et redirige vers la page de connexion
 */
function deconnexion() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

/**
 * Afficher le nom de l'utilisateur connecté dans la navigation
 */
function afficherNomUtilisateur() {
  const userElement = document.getElementById('userName');
  if (userElement) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userElement.textContent = user.nom || 'Utilisateur';
  }
}

/**
 * Wrapper pour les requêtes API avec authentification JWT
 * @param {string} endpoint - L'endpoint de l'API (ex: '/api/membres')
 * @param {object} options - Options de la requête fetch
 * @returns {Promise} - Promesse contenant les données de la réponse
 */
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);

    // Gérer les erreurs d'authentification
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la requête');
    }

    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

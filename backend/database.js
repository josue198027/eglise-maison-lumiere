const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERREUR: Variables d\'environnement Supabase manquantes');
    console.log('👉 Configurez SUPABASE_URL et SUPABASE_KEY dans les variables d\'environnement');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour initialiser la base de données
async function initDatabase() {
    console.log('🔄 Vérification de la connexion à Supabase...');
    
    try {
        // Test de connexion
        const { data, error } = await supabase.from('utilisateurs').select('count');
        
        if (error && error.code === '42P01') {
            console.log('📋 Les tables n\'existent pas encore. Veuillez les créer via le dashboard Supabase.');
            console.log('\n📝 INSTRUCTIONS:');
            console.log('1. Allez sur https://supabase.com/dashboard');
            console.log('2. Ouvrez votre projet');
            console.log('3. Allez dans "SQL Editor"');
            console.log('4. Exécutez le script SQL fourni dans SUPABASE_SETUP.md');
            return false;
        }
        
        console.log('✅ Connexion à Supabase réussie !');
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à Supabase:', error.message);
        return false;
    }
}

module.exports = { supabase, initDatabase };

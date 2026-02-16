const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERREUR: Variables d\'environnement Supabase manquantes');
    console.log('👉 Assurez-vous que SUPABASE_URL et SUPABASE_KEY sont configurés');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initAdminAccounts() {
    console.log('🔐 Initialisation des comptes administrateurs...\n');

    try {
        // Générer les hashes bcrypt pour les mots de passe
        console.log('🔄 Génération des mots de passe hashés...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const pasteurPassword = await bcrypt.hash('pasteur123', 10);
        
        console.log('✅ Mots de passe hashés générés\n');

        // Supprimer les anciens comptes s'ils existent
        console.log('🗑️  Suppression des anciens comptes...');
        const { error: deleteError } = await supabase
            .from('utilisateurs')
            .delete()
            .in('email', ['admin@eglise.com', 'pasteur@eglise.com']);
        
        if (deleteError && deleteError.code !== 'PGRST116') {
            console.error('⚠️  Avertissement lors de la suppression:', deleteError.message);
        } else {
            console.log('✅ Anciens comptes supprimés\n');
        }

        // Créer le compte admin
        console.log('👤 Création du compte Administrateur...');
        const { data: admin, error: adminError } = await supabase
            .from('utilisateurs')
            .insert([{
                email: 'admin@eglise.com',
                mot_de_passe: adminPassword,
                nom: 'Administrateur'
            }])
            .select()
            .single();

        if (adminError) {
            console.error('❌ Erreur lors de la création du compte admin:', adminError.message);
        } else {
            console.log('✅ Compte créé: admin@eglise.com / admin123');
        }

        // Créer le compte pasteur
        console.log('👤 Création du compte Pasteur...');
        const { data: pasteur, error: pasteurError } = await supabase
            .from('utilisateurs')
            .insert([{
                email: 'pasteur@eglise.com',
                mot_de_passe: pasteurPassword,
                nom: 'Pasteur'
            }])
            .select()
            .single();

        if (pasteurError) {
            console.error('❌ Erreur lors de la création du compte pasteur:', pasteurError.message);
        } else {
            console.log('✅ Compte créé: pasteur@eglise.com / pasteur123');
        }

        console.log('\n🎉 Initialisation terminée avec succès !');
        console.log('\n📋 Comptes disponibles:');
        console.log('   - Email: admin@eglise.com   | Mot de passe: admin123');
        console.log('   - Email: pasteur@eglise.com | Mot de passe: pasteur123');
        
        const appUrl = process.env.APP_URL || 'https://eglise-maison-lumiere.onrender.com';
        console.log('\n🌐 Vous pouvez maintenant vous connecter sur:');
        console.log(`   ${appUrl}/login.html\n`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error.message);
        process.exit(1);
    }
}

// Exécuter le script
initAdminAccounts();

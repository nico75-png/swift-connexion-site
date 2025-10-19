import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://onptfjkvnmrshsdspqlm.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucHRmamt2bm1yc2hzZHNzcHFsbSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjcxNjExNjA5LCJleHAiOjE5ODcxODc2MDl9.Srblr47sX2ywG-o5Pv-KA3NuJ21ogGKuhBB0klzks_Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  try {
    const { data: commandesData, error: commandesError } = await supabase
      .from('commandes_invités')
      .select('*');

    if (commandesError) {
      console.error('Erreur lors de la lecture des commandes:', commandesError);
    } else {
      console.log(
        'Lecture des commandes réussie. Nombre de lignes lues :',
        Array.isArray(commandesData) ? commandesData.length : 0,
      );
    }

    const testOrder = {
      'nom et prénom': 'Test Codex',
      entreprise: 'One Connexion',
      'e-mail': 'test@oneconnexion.dev',
      telephone: '0600000000',
      type_colis: 'Test automatique',
      adresse_depart: 'Paris',
      adresse_arrivee: 'Lyon',
      siret: '00000000000000',
      statut: 'PENDING',
    };

    const { data: insertData, error: insertError } = await supabase
      .from('commandes_invités')
      .insert([testOrder])
      .select();

    if (insertError) {
      console.error("Erreur lors de l'insertion de la commande test:", insertError);
    } else {
      console.log('Insertion de la commande test réussie:', insertData);
    }
  } catch (error) {
    console.error('Erreur inattendue:', error);
  }
}

testSupabaseConnection();

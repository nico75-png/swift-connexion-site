import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://onptfjkvnmrshsdspqlm.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucHRmamt2bm1yc2hzZHNzcHFsbSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjcxNjExNjA5LCJleHAiOjE5ODcxODc2MDl9.Srblr47sX2ywG-o5Pv-KA3NuJ21ogGKuhBB0klzks_Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  try {
    const { error: selectError } = await supabase
      .from('commandes_invités')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error(`❌ Erreur de connexion à Supabase : ${selectError.message}`);
      return;
    }

    console.log('✅ Connexion à Supabase réussie.');

    const testOrder = {
      'nom et prénom': 'Test Codex',
      entreprise: 'One Connexion',
      'e-mail': 'test@one-connexion.dev',
      telephone: '0600000000',
      type_colis: 'Test automatique',
      adresse_depart: 'Paris',
      adresse_arrivee: 'Lyon',
      siret: '00000000000000',
      statut: 'PENDING',
    };

    const { error: insertError } = await supabase
      .from('commandes_invités')
      .insert([testOrder]);

    if (insertError) {
      console.error(`❌ Erreur lors de l'insertion : ${insertError.message}`);
      return;
    }

    console.log('✅ Insertion de la commande test réussie.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Erreur inattendue : ${message}`);
  }
}

testSupabaseConnection();

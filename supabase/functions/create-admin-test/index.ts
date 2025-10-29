import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Créer l'utilisateur admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@rapideexpress.fr',
      password: 'AdminTest2024!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Test',
        display_name: 'Admin Test',
      }
    })

    if (authError) {
      // Si l'utilisateur existe déjà, récupérer son ID
      if (authError.message.includes('already registered')) {
        const { data: userData } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = userData.users.find(u => u.email === 'admin@rapideexpress.fr')
        
        if (existingUser) {
          // Appeler la fonction pour configurer le profil et le rôle
          const { error: setupError } = await supabaseAdmin.rpc('setup_admin_test_user', {
            admin_email: 'admin@rapideexpress.fr',
            admin_user_id: existingUser.id
          })

          if (setupError) {
            throw setupError
          }

          return new Response(
            JSON.stringify({ 
              message: 'Utilisateur admin déjà existant, profil et rôle configurés',
              user_id: existingUser.id 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
      throw authError
    }

    // Configurer le profil et le rôle pour le nouvel utilisateur
    const { error: setupError } = await supabaseAdmin.rpc('setup_admin_test_user', {
      admin_email: 'admin@rapideexpress.fr',
      admin_user_id: authData.user.id
    })

    if (setupError) {
      throw setupError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Utilisateur admin créé avec succès',
        user_id: authData.user.id,
        email: 'admin@rapideexpress.fr'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const testUser = {
      email: 'test@rapideexpress.fr',
      password: 'TestUser2024!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      }
    };

    const adminUser = {
      email: 'admin@rapideexpress.fr',
      password: 'AdminUser2024!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User'
      }
    };

    console.log('Creating test user...');
    const { data: testUserData, error: testError } = await supabaseAdmin.auth.admin.createUser(testUser);
    
    if (testError) {
      console.error('Test user error:', testError);
      throw testError;
    }

    console.log('Creating admin user...');
    const { data: adminUserData, error: adminError } = await supabaseAdmin.auth.admin.createUser(adminUser);
    
    if (adminError) {
      console.error('Admin user error:', adminError);
      throw adminError;
    }

    // Assign admin role
    if (adminUserData?.user?.id) {
      console.log('Assigning admin role...');
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: adminUserData.user.id,
          role: 'admin'
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        throw roleError;
      }
    }

    const response = {
      success: true,
      users: {
        test: {
          email: testUser.email,
          password: testUser.password,
          id: testUserData?.user?.id
        },
        admin: {
          email: adminUser.email,
          password: adminUser.password,
          id: adminUserData?.user?.id,
          role: 'admin'
        }
      }
    };

    console.log('Users created successfully:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

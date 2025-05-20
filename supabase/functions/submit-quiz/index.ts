import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userInfo, answers, completedModules, totalModules } = await req.json();

    // Validate required fields
    if (!userInfo?.prenom || !userInfo?.nom || !userInfo?.email) {
      throw new Error('Missing required user information');
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Store the quiz submission in the database
    const { data, error: dbError } = await supabaseAdmin
      .from('quiz_submissions')
      .insert({
        user_first_name: userInfo.prenom,
        user_last_name: userInfo.nom,
        user_email: userInfo.email,
        answer_1: answers[1] || null,
        answer_2: answers[2] || null,
        answer_3: answers[3] || null,
        completed_modules: completedModules,
        total_modules: totalModules
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (!data) {
      throw new Error('No data returned from submission');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: 'Quiz submitted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Failed to submit quiz'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
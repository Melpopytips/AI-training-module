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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Store the quiz submission
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
      throw new Error(`Failed to save submission: ${dbError.message}`);
    }

    if (!data) {
      throw new Error('No data returned from submission');
    }

    // Trigger analysis
    const analyzeResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-quiz`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ submissionId: data.id })
    });

    const analyzeData = await analyzeResponse.json();

    if (!analyzeResponse.ok) {
      throw new Error(analyzeData.error || 'Failed to analyze quiz');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...data,
          analysis: analyzeData.analysis
        },
        message: 'Quiz submitted and analyzed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
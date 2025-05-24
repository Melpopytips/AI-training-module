import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInfo, answers, completedModules, totalModules } = await req.json();

    if (!userInfo?.prenom || !userInfo?.nom || !userInfo?.email) {
      throw new Error('Missing required user information');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: submission, error: dbError } = await supabaseAdmin
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

    if (!submission) {
      throw new Error('No data returned from submission');
    }

    // Wait for analysis to complete before returning
    const analyzeResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-quiz`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ submissionId: submission.id })
    });

    if (!analyzeResponse.ok) {
      const errorData = await analyzeResponse.json();
      throw new Error(errorData.error || 'Failed to analyze quiz');
    }

    const analyzeData = await analyzeResponse.json();

    // Return both submission and analysis data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...submission,
          analysis: analyzeData.analysis
        }
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in submit-quiz:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      {
        headers: corsHeaders,
        status: 500
      }
    );
  }
});
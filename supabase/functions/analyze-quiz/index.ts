import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import OpenAI from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId } = await req.json();

    if (!submissionId) {
      throw new Error('Submission ID is required');
    }

    // Initialize OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch submission data
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('quiz_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      throw new Error(fetchError?.message || 'Submission not found');
    }

    console.log('Processing submission:', submissionId);
    console.log('Answers received:', {
      answer1: submission.answer_1,
      answer2: submission.answer_2,
      answer3: submission.answer_3
    });

    // Prepare analysis prompt
    const analysisPrompt = `
      En tant qu'expert en prompt engineering, analysez ces réponses de quiz et fournissez une évaluation détaillée en français.
      
      Question 1: Transformer ce mauvais prompt "Je veux améliorer les ventes"
      Réponse: "${submission.answer_1 || 'Non répondu'}"

      Question 2: Créer un prompt pour votre pôle spécifique
      Réponse: "${submission.answer_2 || 'Non répondu'}"

      Question 3: Identifier les erreurs dans "Fais quelque chose de bien pour mon équipe qui soit original et utile"
      Réponse: "${submission.answer_3 || 'Non répondu'}"

      Pour chaque réponse :
      1. Note sur 10
      2. Points forts
      3. Points à améliorer
      4. Suggestions concrètes d'amélioration

      Terminez par une évaluation globale du niveau :
      - Novice
      - Intermédiaire
      - Avancé
      - Expert
      - Illuminé

      Format souhaité :
      Question 1 :
      Note : X/10
      Points forts :
      - ...
      Points à améliorer :
      - ...
      Suggestions :
      - ...

      [Répéter pour questions 2 et 3]

      Niveau global : [niveau] avec justification
    `;

    console.log('Sending request to OpenAI...');

    // Generate analysis with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en prompt engineering qui évalue les compétences des apprenants. Vos analyses sont constructives, détaillées et encourageantes."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log('Received response from OpenAI');

    const analysis = completion.choices[0]?.message?.content;
    
    if (!analysis) {
      throw new Error('Failed to generate analysis');
    }

    console.log('Saving analysis to database...');

    // Update submission with analysis
    const { error: updateError } = await supabaseAdmin
      .from('quiz_submissions')
      .update({ analysis })
      .eq('id', submissionId);

    if (updateError) {
      throw new Error(`Failed to save analysis: ${updateError.message}`);
    }

    console.log('Analysis saved successfully');

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: corsHeaders,
        status: 500
      }
    );
  }
});
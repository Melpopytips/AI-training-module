import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'npm:openai@4.28.0';

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

    // Validate environment variables
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OPENAI_API_KEY is missing');
      throw new Error('Configuration error: OpenAI API key is not set');
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('quiz_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError) {
      console.error('Error fetching submission:', fetchError);
      throw new Error('Failed to fetch submission');
    }

    if (!submission) {
      throw new Error('Submission not found');
    }

    const configuration = new Configuration({
      apiKey: openaiKey
    });
    const openai = new OpenAIApi(configuration);

    const analysisPrompt = `
      En tant qu'expert en prompt engineering, analysez ces réponses de quiz et fournissez une évaluation détaillée en français.
      
      Pour chaque réponse :
      1. Donnez une note sur 10
      2. Expliquez les points forts et les points à améliorer
      3. Donnez des suggestions d'amélioration concrètes
      
      À la fin, donnez une évaluation globale du niveau selon cette échelle :
      - Novice : Comprend les bases mais nécessite plus de pratique
      - Intermédiaire : Bonne maîtrise des concepts fondamentaux
      - Avancé : Excellente compréhension et application
      - Expert : Maîtrise exceptionnelle et créativité
      - Illuminé : Niveau remarquable, innovation et excellence

      Question 1: Transformer ce mauvais prompt "Je veux améliorer les ventes"
      Réponse: "${submission.answer_1 || ''}"

      Question 2: Créer un prompt pour votre pôle spécifique
      Réponse: "${submission.answer_2 || ''}"

      Question 3: Identifier les erreurs dans "Fais quelque chose de bien pour mon équipe qui soit original et utile"
      Réponse: "${submission.answer_3 || ''}"

      Basez l'évaluation sur :
      - L'utilisation du modèle universel
      - La précision du contexte
      - La clarté des objectifs
      - La pertinence des contraintes
      - La qualité globale du prompt
    `;

    console.log('Sending request to OpenAI...');
    const completion = await openai.createChatCompletion({
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
      ]
    });

    const analysis = completion.data.choices[0].message.content;
    console.log('Received response from OpenAI');

    // Store the analysis in the database
    const { error: updateError } = await supabaseAdmin
      .from('quiz_submissions')
      .update({ analysis })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission:', updateError);
      throw new Error('Failed to save analysis');
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred during quiz analysis'
      }),
      { 
        headers: corsHeaders,
        status: 500
      }
    );
  }
});
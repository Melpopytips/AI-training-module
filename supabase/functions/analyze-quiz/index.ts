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
      Analyze these quiz answers for a prompting course and provide feedback in French.
      For each answer, provide:
      1. A score out of 10
      2. Detailed feedback
      3. Specific suggestions for improvement

      Question 1: Transform this bad prompt: "Je veux améliorer les ventes"
      Answer: "${submission.answer_1 || ''}"

      Question 2: Create a prompt for your specific department at Enfin Libre
      Answer: "${submission.answer_2 || ''}"

      Question 3: Identify errors in this prompt: "Fais quelque chose de bien pour mon équipe qui soit original et utile"
      Answer: "${submission.answer_3 || ''}"
    `;

    console.log('Sending request to OpenAI...');
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineering instructor. Analyze quiz submissions and provide constructive feedback in French."
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
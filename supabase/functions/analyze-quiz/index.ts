import { Configuration, OpenAIApi } from 'npm:openai@4.28.0';

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
    const { answers } = await req.json();

    if (!Deno.env.get('OPENAI_API_KEY')) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    const analysisPrompt = `
      Analyze these quiz answers for a prompting course and provide feedback in French.
      Format your response as plain text with clear sections for each question.

      Question 1: Transform this bad prompt: "Je veux améliorer les ventes"
      Answer: "${answers[1] || ''}"

      Question 2: Create a prompt for your specific department at Enfin Libre
      Answer: "${answers[2] || ''}"

      Question 3: Identify errors in this prompt: "Fais quelque chose de bien pour mon équipe qui soit original et utile"
      Answer: "${answers[3] || ''}"
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineering instructor. Analyze quiz submissions and provide constructive feedback in French. Format your response in clear sections with scores and feedback."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    });

    const analysisText = completion.data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis: analysisText }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: corsHeaders,
        status: 500
      }
    );
  }
});
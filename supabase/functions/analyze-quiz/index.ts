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
    const { answers } = await req.json();

    // Validate environment variables
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OPENAI_API_KEY is missing');
      throw new Error('Configuration error: OpenAI API key is not set');
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

      Format the response as a JSON object with this structure:
      {
        "1": {
          "score": number,
          "feedback": string,
          "suggestions": string[]
        },
        "2": {...},
        "3": {...}
      }

      Question 1: Transform this bad prompt: "Je veux améliorer les ventes"
      Answer: "${answers[1] || ''}"

      Question 2: Create a prompt for your specific department at Enfin Libre
      Answer: "${answers[2] || ''}"

      Question 3: Identify errors in this prompt: "Fais quelque chose de bien pour mon équipe qui soit original et utile"
      Answer: "${answers[3] || ''}"
    `;

    console.log('Sending request to OpenAI...');
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineering instructor. Analyze quiz submissions and provide constructive feedback in French. Your response must be a valid JSON object following the specified structure."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    });

    const analysisText = completion.data.choices[0].message.content;
    console.log('Received response from OpenAI');
    const analysis = JSON.parse(analysisText);

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
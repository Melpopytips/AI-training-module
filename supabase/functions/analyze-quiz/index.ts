import { Configuration, OpenAIApi } from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json();

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    const analysisPrompt = `
      Analyze these quiz answers for a prompting course. For each answer, provide:
      1. A score out of 10
      2. Detailed feedback on what's good and what could be improved
      3. Specific suggestions for improvement

      Question 1: Transform this bad prompt: "Je veux améliorer les ventes"
      Answer: "${answers[1]}"

      Question 2: Create a prompt for your specific department at Enfin Libre
      Answer: "${answers[2]}"

      Question 3: Identify errors in this prompt: "Fais quelque chose de bien pour mon équipe qui soit original et utile"
      Answer: "${answers[3]}"
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineering instructor. Analyze quiz submissions and provide constructive feedback in French. For each answer, return a JSON object with: score (number), feedback (string), and suggestions (array of strings)."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    });

    const analysis = {
      1: {
        score: 0,
        feedback: "",
        suggestions: []
      },
      2: {
        score: 0,
        feedback: "",
        suggestions: []
      },
      3: {
        score: 0,
        feedback: "",
        suggestions: []
      }
    };

    // Parse the response and structure it
    const responseText = completion.data.choices[0].message.content;
    const sections = responseText.split(/Question \d+/g).filter(Boolean);
    
    sections.forEach((section, index) => {
      const questionNumber = index + 1;
      
      // Extract score (assuming it's written as "Score: X/10" or similar)
      const scoreMatch = section.match(/\b(\d+)\/10\b/);
      if (scoreMatch) {
        analysis[questionNumber].score = parseInt(scoreMatch[1]);
      }

      // Extract feedback (assuming it's the first paragraph after the score)
      const feedbackMatch = section.match(/[^.!?]+[.!?]+/);
      if (feedbackMatch) {
        analysis[questionNumber].feedback = feedbackMatch[0].trim();
      }

      // Extract suggestions (assuming they're listed with bullet points or numbers)
      const suggestions = section.match(/[-•]\s+([^•\n]+)/g);
      if (suggestions) {
        analysis[questionNumber].suggestions = suggestions.map(s => 
          s.replace(/^[-•]\s+/, '').trim()
        );
      }
    });

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
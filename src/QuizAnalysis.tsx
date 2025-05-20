import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const QuizAnalysis = () => {
  const { submissionId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // First check if we already have an analysis
        const { data: submission, error: fetchError } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('id', submissionId)
          .single();

        if (fetchError) throw fetchError;

        if (submission.analysis) {
          setAnalysis(submission.analysis);
          setLoading(false);
          return;
        }

        // If no analysis exists, request one
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-quiz`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ submissionId })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyse de vos réponses en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-red-50 p-6 rounded-lg">
          <h2 className="text-red-800 text-xl font-semibold mb-4">Une erreur est survenue</h2>
          <p className="text-red-600">{error}</p>
          <Link to="/" className="mt-4 inline-flex items-center text-red-700 hover:text-red-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la formation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la formation
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Analyse de vos réponses</h1>
          
          <div className="prose max-w-none">
            {analysis.split('\n').map((line, index) => {
              if (line.trim().startsWith('Question')) {
                return <h2 key={index} className="text-xl font-semibold mt-8 mb-4">{line}</h2>;
              }
              if (line.trim().startsWith('Score')) {
                return <p key={index} className="text-lg font-medium text-blue-600">{line}</p>;
              }
              return <p key={index} className="mb-2">{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnalysis;
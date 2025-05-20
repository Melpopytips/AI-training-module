import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { BarChart, Clock, User, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface QuizSubmission {
  id: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  completed_modules: number;
  total_modules: number;
  created_at: string;
}

function FormationDashboard() {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Erreur lors du chargement des soumissions');
    } finally {
      setLoading(false);
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 10;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(24);
    doc.text('Formation Prompting IA', margin, yPos);
    yPos += lineHeight * 2;

    // Introduction
    doc.setFontSize(16);
    doc.text('Introduction : Pourquoi le prompting ?', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    doc.text('L\'IA n\'est pas devin - Elle a besoin d\'instructions claires', margin, yPos);
    yPos += lineHeight * 2;

    // Les 5 éléments clés
    doc.setFontSize(16);
    doc.text('Les 5 éléments clés', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    const elements = [
      '1. Objectif clair - Ce que tu veux obtenir exactement',
      '2. Contexte - Ton rôle, pôle, outils, situation',
      '3. Contraintes - Limites, ce que tu veux éviter',
      '4. Format souhaité - Liste, plan, modèle, etc.',
      '5. Niveau attendu - Basique, expert, vulgarisé'
    ];
    elements.forEach(element => {
      doc.text(element, margin, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Le modèle universel
    doc.setFontSize(16);
    doc.text('Le modèle universel', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    const template = [
      'Je suis [rôle, pôle, contexte précis].',
      'Voici mon objectif : [objectif mesurable].',
      'Contraintes/outils : [infos techniques, limites].',
      'Je souhaite obtenir : [type de réponse].',
      'Fais-le de manière : [précise, experte, etc.]'
    ];
    template.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Erreurs à éviter
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(16);
    doc.text('Erreurs à éviter', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    const errors = [
      'Trop vague - "Aide-moi à améliorer mon équipe"',
      'Pas de contexte - "Propose-moi une idée de post"',
      'Demandes floues - "Sois original"'
    ];
    errors.forEach(error => {
      doc.text(error, margin, yPos);
      yPos += lineHeight;
    });

    // Quiz final
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(16);
    doc.text('Quiz final', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    const quiz = [
      '1. Transformez ce mauvais prompt en bon prompt',
      '2. Créez un prompt pour votre pôle spécifique',
      '3. Identifiez les erreurs dans un prompt donné'
    ];
    quiz.forEach(question => {
      doc.text(question, margin, yPos);
      yPos += lineHeight;
    });

    // Footer
    doc.setFontSize(10);
    doc.text('© Enfin Libre - Formation Prompting IA', margin, doc.internal.pageSize.height - 10);

    doc.save('formation-prompting.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des résultats...</p>
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
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Formation Dashboard</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Aucune soumission trouvée pour le moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Formation Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Télécharger la formation en PDF
            </button>
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="w-5 h-5" />
              <span>Dernière mise à jour: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/analysis/${submission.id}`)}
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {submission.user_first_name} {submission.user_last_name}
                  </h2>
                  <p className="text-sm text-gray-500">{submission.user_email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BarChart className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Progression: {submission.completed_modules}/{submission.total_modules} modules
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(submission.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                  <div
                    style={{
                      width: `${(submission.completed_modules / submission.total_modules) * 100}%`
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormationDashboard;
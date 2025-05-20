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

    // Helper functions for styling
    const addTitle = (text: string) => {
      doc.setFillColor(66, 133, 244);
      doc.rect(0, yPos - 15, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text(text, margin, yPos);
      yPos += lineHeight * 2;
      doc.setTextColor(0, 0, 0);
    };

    const addSection = (title: string, content: string[]) => {
      // Section title with background
      doc.setFillColor(240, 247, 255);
      doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 20, 'F');
      doc.setFontSize(16);
      doc.setTextColor(66, 133, 244);
      doc.text(title, margin, yPos + 5);
      yPos += lineHeight * 2;

      // Section content
      doc.setFontSize(12);
      doc.setTextColor(60, 64, 67);
      content.forEach(line => {
        if (yPos > doc.internal.pageSize.height - 40) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
      yPos += lineHeight;
    };

    // Title page
    addTitle('Formation Prompting IA');
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('ENFIN LIBRE - Responsables de Pôles', margin, yPos);
    yPos += lineHeight * 3;

    // Introduction
    addSection('Introduction : Pourquoi le prompting ?', [
      '• L\'IA n\'est pas devin - Elle a besoin d\'instructions claires',
      '• Un bon prompt = des résultats précis et utiles',
      '• La qualité de vos instructions détermine la qualité des réponses'
    ]);

    // Les 5 éléments clés
    const elements = [
      '✓ Objectif clair - Ce que tu veux obtenir exactement',
      '✓ Contexte - Ton rôle, pôle, outils, situation',
      '✓ Contraintes - Limites, ce que tu veux éviter',
      '✓ Format souhaité - Liste, plan, modèle, etc.',
      '✓ Niveau attendu - Basique, expert, vulgarisé'
    ];
    addSection('Les 5 éléments clés', elements);

    // Le modèle universel
    doc.addPage();
    yPos = 20;
    const template = [
      '1️⃣ Je suis [rôle, pôle, contexte précis].',
      '2️⃣ Voici mon objectif : [objectif mesurable].',
      '3️⃣ Contraintes/outils : [infos techniques, limites].',
      '4️⃣ Je souhaite obtenir : [type de réponse].',
      '5️⃣ Fais-le de manière : [précise, experte, etc.]'
    ];
    addSection('Le modèle universel', template);

    // Exemple concret
    const example = [
      'Exemple pratique :',
      '',
      '"Je suis responsable du pôle pédagogie chez Enfin Libre.',
      'Mon objectif est d\'augmenter le taux de complétion de notre',
      'formation chez les élèves inactifs entre la semaine 2 et 3.',
      'Nous utilisons Kajabi et Slack.',
      'Donne-moi un plan en 5 étapes pour améliorer leur engagement."'
    ];
    addSection('Exemple concret', example);

    // Erreurs à éviter
    doc.addPage();
    yPos = 20;
    const errors = [
      '❌ Trop vague - "Aide-moi à améliorer mon équipe"',
      '❌ Pas de contexte - "Propose-moi une idée de post"',
      '❌ Demandes floues - "Sois original"',
      '',
      '✅ Solutions :',
      '• Toujours inclure le contexte complet',
      '• Définir un résultat mesurable',
      '• Spécifier les contraintes techniques',
      '• Demander un format précis'
    ];
    addSection('Erreurs à éviter', errors);

    // Quiz final
    const quiz = [
      '📝 Question 1: Transformez ce mauvais prompt en bon prompt',
      '📝 Question 2: Créez un prompt pour votre pôle spécifique',
      '📝 Question 3: Identifiez les erreurs dans un prompt donné',
      '',
      '🎯 Objectif : Mettre en pratique les concepts appris'
    ];
    addSection('Quiz final', quiz);

    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        '© Enfin Libre - Formation Prompting IA',
        margin,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} sur ${pageCount}`,
        pageWidth - margin - 20,
        doc.internal.pageSize.height - 10
      );
    }

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
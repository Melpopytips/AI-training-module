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
  analysis: string;
}

function FormationDashboard() {
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestSubmission();
  }, []);

  async function fetchLatestSubmission() {
    try {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      setSubmission(data);
    } catch (err) {
      console.error('Error fetching submission:', err);
      setError('Erreur lors du chargement de votre soumission');
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
    const maxWidth = pageWidth - 2 * margin;

    const splitTextToSize = (text: string, fontSize: number) => {
      doc.setFontSize(fontSize);
      return doc.splitTextToSize(text, maxWidth);
    };

    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    const addSectionTitle = (title: string) => {
      checkPageBreak(30);
      doc.setFillColor(66, 133, 244);
      doc.rect(margin - 5, yPos - 5, maxWidth + 10, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(title, margin, yPos + 10);
      yPos += 30;
      doc.setTextColor(0, 0, 0);
    };

    const addContentBlock = (content: string[], fontSize = 12) => {
      doc.setFontSize(fontSize);
      content.forEach(text => {
        const lines = splitTextToSize(text, fontSize);
        const blockHeight = lines.length * lineHeight;
        
        if (checkPageBreak(blockHeight)) {
          doc.setFontSize(fontSize);
        }

        lines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
      });
      yPos += 10;
    };

    doc.setFillColor(66, 133, 244);
    doc.rect(0, 0, pageWidth, 100, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.text('Formation Prompting IA', margin, 50);
    doc.setFontSize(18);
    doc.text('ENFIN LIBRE', margin, 70);
    doc.text('Responsables de Pôles', margin, 85);
    yPos = 120;

    addSectionTitle('Introduction : Pourquoi le prompting ?');
    addContentBlock([
      '• L\'IA n\'est pas devin - Elle a besoin d\'instructions claires',
      '• Un bon prompt = des résultats précis et utiles',
      '• La qualité de vos instructions détermine la qualité des réponses'
    ]);

    addSectionTitle('Les 5 éléments clés');
    addContentBlock([
      '1. Objectif clair - Ce que tu veux obtenir exactement',
      '2. Contexte - Ton rôle, pôle, outils, situation',
      '3. Contraintes - Limites, ce que tu veux éviter',
      '4. Format souhaité - Liste, plan, modèle, etc.',
      '5. Niveau attendu - Basique, expert, vulgarisé'
    ]);

    addSectionTitle('Le modèle universel');
    doc.setFillColor(240, 247, 255);
    doc.rect(margin - 5, yPos - 5, maxWidth + 10, 80, 'F');
    addContentBlock([
      'Je suis [rôle, pôle, contexte précis].',
      'Voici mon objectif : [objectif mesurable].',
      'Contraintes/outils : [infos techniques, limites].',
      'Je souhaite obtenir : [type de réponse].',
      'Fais-le de manière : [précise, experte, etc.]'
    ]);

    addSectionTitle('Exemple pratique');
    doc.setFillColor(240, 247, 255);
    doc.rect(margin - 5, yPos - 5, maxWidth + 10, 100, 'F');
    addContentBlock([
      'Je suis responsable du pôle pédagogie chez Enfin Libre.',
      'Mon objectif est d\'augmenter le taux de complétion de notre formation',
      'chez les élèves inactifs entre la semaine 2 et 3.',
      'Nous utilisons Kajabi et Slack.',
      'Donne-moi un plan en 5 étapes pour améliorer leur engagement.'
    ]);

    addSectionTitle('Erreurs à éviter');
    addContentBlock([
      'Les erreurs courantes :',
      '• Trop vague - "Aide-moi à améliorer mon équipe"',
      '• Pas de contexte - "Propose-moi une idée de post"',
      '• Demandes floues - "Sois original"',
      '',
      'Les bonnes pratiques :',
      '• Toujours inclure le contexte complet',
      '• Définir un résultat mesurable',
      '• Spécifier les contraintes techniques',
      '• Demander un format précis'
    ]);

    addSectionTitle('Quiz final');
    addContentBlock([
      'Exercices pratiques :',
      '',
      '• Question 1: Transformation de prompt',
      '  Prenez un prompt basique et améliorez-le avec le modèle universel',
      '',
      '• Question 2: Création de prompt spécifique',
      '  Appliquez les concepts à une situation réelle de votre pôle',
      '',
      '• Question 3: Analyse critique',
      '  Identifiez et corrigez les faiblesses d\'un prompt existant'
    ]);

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(66, 133, 244);
      doc.rect(0, doc.internal.pageSize.height - 20, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(
        '© Enfin Libre - Formation Prompting IA',
        margin,
        doc.internal.pageSize.height - 8
      );
      doc.text(
        `Page ${i} sur ${pageCount}`,
        pageWidth - margin - 20,
        doc.internal.pageSize.height - 8
      );
    }

    doc.save('formation-prompting.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre analyse...</p>
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

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Formation Dashboard</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Aucune soumission trouvée.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analyse de votre quiz</h1>
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
              <span>Soumis le: {new Date(submission.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-full p-3">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {submission.user_first_name} {submission.user_last_name}
              </h2>
              <p className="text-gray-500">{submission.user_email}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progression</span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round((submission.completed_modules / submission.total_modules) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(submission.completed_modules / submission.total_modules) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">Analyse détaillée</h3>
            {submission.analysis && submission.analysis.split('\n').map((line, index) => {
              if (line.trim().startsWith('Question')) {
                return <h4 key={index} className="text-lg font-medium mt-6 mb-2">{line}</h4>;
              }
              return <p key={index} className="mb-2">{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormationDashboard;

export default FormationDashboard
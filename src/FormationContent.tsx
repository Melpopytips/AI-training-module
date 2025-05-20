import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Play, BookOpen, Target, Lightbulb, AlertTriangle, Trophy, Users, ArrowRight, Brain, Zap, MessageSquare, Settings, Mail, User, Copy, Check } from 'lucide-react';
import { supabase } from './supabaseClient';

const FormationContent = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState(new Set());
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nom: '',
    prenom: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const promptTemplate = `Je suis [rôle, pôle, contexte précis].
Voici mon objectif : [objectif mesurable].
Contraintes/outils : [infos techniques, limites].
Je souhaite obtenir : [type de réponse].
Fais-le de manière : [précise, experte, etc.]`;

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(promptTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const modules = [
    {
      id: 0,
      title: "Introduction : Pourquoi le prompting ?",
      icon: <Target className="w-6 h-6" />,
      duration: "5 min",
      content: {
        concept: "L'IA n'est pas devin - Elle a besoin d'instructions claires",
        example: {
          bad: "Optimise mon service client",
          good: "Je suis responsable du pôle Success Client chez Enfin Libre. Nous avons 3 personnes, utilisons Zendesk et Slack. Objectif : réduire le temps de réponse à moins de 2h. Comment y parvenir ?"
        },
        key: "Garbage in = Garbage out"
      }
    },
    {
      id: 1,
      title: "Les 5 éléments clés",
      icon: <Brain className="w-6 h-6" />,
      duration: "5 min",
      content: {
        elements: [
          { name: "Objectif clair", desc: "Ce que tu veux obtenir exactement", icon: "🎯" },
          { name: "Contexte", desc: "Ton rôle, pôle, outils, situation", icon: "🏢" },
          { name: "Contraintes", desc: "Limites, ce que tu veux éviter", icon: "🧩" },
          { name: "Format souhaité", desc: "Liste, plan, modèle, etc.", icon: "💬" },
          { name: "Niveau attendu", desc: "Basique, expert, vulgarisé", icon: "🧠" }
        ]
      }
    },
    {
      id: 2,
      title: "Le modèle universel",
      icon: <Settings className="w-6 h-6" />,
      duration: "5 min",
      content: {
        template: promptTemplate,
        example: "Je suis responsable du pôle pédagogie chez Enfin Libre. Mon objectif est d'augmenter le taux de complétion de notre formation chez les élèves inactifs entre la semaine 2 et 3. Nous utilisons Kajabi et Slack. Donne-moi un plan en 5 étapes pour améliorer leur engagement."
      }
    },
    {
      id: 3,
      title: "Erreurs à éviter",
      icon: <AlertTriangle className="w-6 h-6" />,
      duration: "5 min",
      content: {
        errors: [
          { type: "Trop vague", example: "Aide-moi à améliorer mon équipe" },
          { type: "Pas de contexte", example: "Propose-moi une idée de post" },
          { type: "Demandes floues", example: "Sois original" }
        ],
        solutions: ["Contexte complet", "Résultat attendu", "Contraintes opérationnelles", "Format clair"]
      }
    }
  ];

  const handleUserInfoChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const markModuleComplete = (moduleId) => {
    setCompletedModules(new Set([...completedModules, moduleId]));
  };

  const submitQuiz = async () => {
    if (!userInfo.nom || !userInfo.prenom || !userInfo.email) {
      alert('Veuillez renseigner vos nom, prénom et email avant de soumettre le quiz.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo,
          answers: practiceAnswers,
          completedModules: completedModules.size,
          totalModules: modules.length
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quiz');
      }

      const data = await response.json();
      
      if (data.success) {
        setIsSubmitted(true);
        navigate('/dashboard');
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Une erreur est survenue lors de l\'envoi du quiz. Veuillez réessayer.');
    }
  };

  const renderModuleContent = () => {
    const module = modules[currentModule];
    
    switch(currentModule) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">🧠 Concept clé</h3>
              <p className="text-lg text-blue-700">{module.content.concept}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">❌ Mauvais prompt</h4>
                <p className="text-red-700 italic">"{module.content.example.bad}"</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">✅ Bon prompt</h4>
                <p className="text-green-700">"{module.content.example.good}"</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-xl font-bold text-yellow-800">🎯 {module.content.key}</p>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Les 5 éléments essentiels</h3>
            <div className="grid gap-4">
              {module.content.elements.map((element, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{element.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{element.name}</h4>
                      <p className="text-gray-600">{element.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">🧰 Modèle universel de prompt</h3>
            <div className="bg-gray-50 p-6 rounded-lg relative group">
              <button
                onClick={handleCopyTemplate}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copier le modèle"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {module.content.template}
              </pre>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">✅ Exemple concret</h4>
              <p className="text-green-700 italic">"{module.content.example}"</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">💡 Conseil : Adaptez ce modèle à votre pôle et gardez-le sous la main !</p>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">⚡ Erreurs fréquentes</h3>
            <div className="space-y-4">
              {module.content.errors.map((error, idx) => (
                <div key={idx} className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800">❌ {error.type}</h4>
                  <p className="text-red-700 italic">"{error.example}"</p>
                </div>
              ))}
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">✅ Ce qu'on veut :</h4>
              <ul className="list-disc list-inside space-y-2 text-green-700">
                {module.content.solutions.map((solution, idx) => (
                  <li key={idx}>{solution}</li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🏆 Quiz final</h3>
              <p>Testez vos connaissances et obtenez une analyse détaillée de vos réponses !</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">Question 1</h4>
              <p className="text-gray-700 mb-2">Transformez ce mauvais prompt en bon prompt :</p>
              <div className="bg-gray-50 p-3 rounded mb-4 italic text-gray-600">
                "Je veux améliorer les ventes"
              </div>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="5"
                placeholder="Votre réponse..."
                value={practiceAnswers[1] || ''}
                onChange={(e) => setPracticeAnswers({
                  ...practiceAnswers,
                  1: e.target.value
                })}
                disabled={isSubmitted}
              />
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">Question 2</h4>
              <p className="text-gray-700 mb-2">Créez un prompt pour votre pôle spécifique :</p>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="5"
                placeholder="Votre réponse..."
                value={practiceAnswers[2] || ''}
                onChange={(e) => setPracticeAnswers({
                  ...practiceAnswers,
                  2: e.target.value
                })}
                disabled={isSubmitted}
              />
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">Question 3</h4>
              <p className="text-gray-700 mb-2">Identifiez les erreurs dans ce prompt :</p>
              <div className="bg-gray-50 p-3 rounded mb-4 italic text-gray-600">
                "Fais quelque chose de bien pour mon équipe qui soit original et utile"
              </div>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="5"
                placeholder="Votre réponse..."
                value={practiceAnswers[3] || ''}
                onChange={(e) => setPracticeAnswers({
                  ...practiceAnswers,
                  3: e.target.value
                })}
                disabled={isSubmitted}
              />
            </div>
            
            {!isSubmitted && (
              <div className="bg-green-50 p-6 rounded-lg">
                <button
                  onClick={submitQuiz}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Soumettre mes réponses et voir l'analyse
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  const progressPercentage = ((completedModules.size) / modules.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Formation Prompting</h1>
              <p className="text-gray-600">ENFIN LIBRE - Responsables de Pôles</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Progression</p>
                <p className="font-semibold text-blue-600">{Math.round(progressPercentage)}%</p>
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Form */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Prénom *
              </label>
              <input
                type="text"
                value={userInfo.prenom}
                onChange={(e) => handleUserInfoChange('prenom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre prénom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nom *
              </label>
              <input
                type="text"
                value={userInfo.nom}
                onChange={(e) => handleUserInfoChange('nom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre nom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => handleUserInfoChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="votre.email@example.com"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Modules</h2>
              <nav className="space-y-2">
                {modules.map((module, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentModule(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      currentModule === idx 
                        ? 'bg-blue-100 border border-blue-200 text-blue-800' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {completedModules.has(idx) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        module.icon
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{module.title}</p>
                      <p className="text-xs text-gray-500">{module.duration}</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setCurrentModule(4)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    currentModule === 4
                      ? 'bg-blue-100 border border-blue-200 text-blue-800'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  disabled={completedModules.size < modules.length}
                >
                  <div className="flex-shrink-0">
                    {isSubmitted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Trophy className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">Quiz final</p>
                    <p className="text-xs text-gray-500">15 min</p>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentModule === 4 ? "Quiz final" : modules[currentModule].title}
                  </h2>
                  <p className="text-gray-600">
                    Durée estimée : {currentModule === 4 ? "15 min" : modules[currentModule].duration}
                  </p>
                </div>
                <div className="flex gap-2">
                  {currentModule > 0 && currentModule !== 4 && (
                    <button
                      onClick={() => setCurrentModule(currentModule - 1)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Précédent
                    </button>
                  )}
                  {currentModule < modules.length - 1 && (
                    <button
                      onClick={() => {
                        markModuleComplete(currentModule);
                        setCurrentModule(currentModule + 1);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      Suivant <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Module Content */}
              <div className="prose max-w-none">
                {renderModuleContent()}
              </div>

              {/* Complete Module Button */}
              {!completedModules.has(currentModule) && currentModule !== 4 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => markModuleComplete(currentModule)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marquer comme terminé
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">🚀 Le prompting, c'est un super pouvoir !</h3>
            <p className="text-lg mb-6">
              Formuler un prompt, c'est comme briefer un assistant ultra-compétent.
              Plus tu es précis, plus tu as une réponse intelligente.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">Tu gagnes du temps</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">Tu obtiens des idées</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <Brain className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">Tu augmentes ton cerveau</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationContent;
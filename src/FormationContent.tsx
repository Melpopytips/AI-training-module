import React, { useState } from 'react';
import { CheckCircle2, Play, BookOpen, Target, Lightbulb, AlertTriangle, Trophy, Users, ArrowRight, Brain, Zap, MessageSquare, Settings, Mail, User } from 'lucide-react';

const FormationContent = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState(new Set());
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});
  const [userInfo, setUserInfo] = useState({
    nom: '',
    prenom: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        template: `Je suis [rôle, pôle, contexte précis].
Voici mon objectif : [objectif mesurable].
Contraintes/outils : [infos techniques, limites].
Je souhaite obtenir : [type de réponse].
Fais-le de manière : [précise, experte, etc.]`,
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
    },
    {
      id: 4,
      title: "Quiz final",
      icon: <Trophy className="w-6 h-6" />,
      duration: "5 min",
      content: {
        exercises: [
          { 
            id: 1, 
            question: "Transformez ce mauvais prompt en bon prompt :", 
            prompt: "Je veux améliorer les ventes",
            type: "transformation" 
          },
          { 
            id: 2, 
            question: "Créez un prompt pour votre pôle spécifique chez Enfin Libre :", 
            prompt: "Décrivez une problématique de votre pôle et rédigez un prompt complet",
            type: "creation" 
          },
          { 
            id: 3, 
            question: "Identifiez les erreurs dans ce prompt :", 
            prompt: "Fais quelque chose de bien pour mon équipe qui soit original et utile",
            type: "analyse" 
          }
        ]
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

    setIsAnalyzing(true);

    try {
      const analysisResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: practiceAnswers
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze quiz');
      }

      const analysisData = await analysisResponse.json();
      setAnalysisResults(analysisData.analysis);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo,
          answers: practiceAnswers,
          analysis: analysisData.analysis,
          completedModules: completedModules.size,
          totalModules: modules.length
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      setIsSubmitted(true);
      markModuleComplete(4);
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
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
            <div className="bg-gray-50 p-6 rounded-lg">
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
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🏆 Quiz final</h3>
              <p>Testez vos connaissances et obtenez une analyse détaillée de vos réponses !</p>
            </div>
            
            {module.content.exercises.map((exercise, idx) => (
              <div key={idx} className="space-y-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Question {exercise.id}</h4>
                  <p className="text-gray-700 mb-2">{exercise.question}</p>
                  {exercise.prompt && (
                    <div className="bg-gray-50 p-3 rounded mb-4 italic text-gray-600">
                      "{exercise.prompt}"
                    </div>
                  )}
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows="5"
                    placeholder="Votre réponse..."
                    value={practiceAnswers[exercise.id] || ''}
                    onChange={(e) => setPracticeAnswers({
                      ...practiceAnswers,
                      [exercise.id]: e.target.value
                    })}
                    disabled={isSubmitted}
                  />
                </div>
                
                {isSubmitted && analysisResults[exercise.id] && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-blue-800">Analyse de votre réponse</h5>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                        Score: {analysisResults[exercise.id].score}/10
                      </span>
                    </div>
                    <div className="prose prose-blue max-w-none">
                      <p className="text-blue-700">{analysisResults[exercise.id].feedback}</p>
                      <div className="mt-4">
                        <h6 className="font-medium text-blue-800">Suggestions d'amélioration :</h6>
                        <ul className="list-disc list-inside text-blue-700">
                          {analysisResults[exercise.id].suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {!isSubmitted ? (
              <div className="bg-green-50 p-6 rounded-lg">
                <button
                  onClick={submitQuiz}
                  disabled={isAnalyzing}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      Soumettre mes réponses et voir l'analyse
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-green-100 p-6 rounded-lg text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-green-800 mb-2">Quiz terminé !</h4>
                <p className="text-green-700">Vous pouvez consulter l'analyse de vos réponses ci-dessus.</p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  const progressPercentage = ((completedModules.size) / modules.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
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
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{modules[currentModule].title}</h2>
                  <p className="text-gray-600">Durée estimée : {modules[currentModule].duration}</p>
                </div>
                <div className="flex gap-2">
                  {currentModule > 0 && (
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

              <div className="prose max-w-none">
                {renderModuleContent()}
              </div>

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
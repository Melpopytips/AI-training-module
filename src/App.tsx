import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormationContent from './FormationContent';
import FormationDashboard from './FormationDashboard';
import QuizAnalysis from './QuizAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormationContent />} />
        <Route path="/dashboard" element={<FormationDashboard />} />
        <Route path="/analysis/:submissionId" element={<QuizAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;
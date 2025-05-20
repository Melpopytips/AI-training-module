import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { BarChart, Clock, User } from 'lucide-react';

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return;
    }

    setSubmissions(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Formation Dashboard</h1>
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock className="w-5 h-5" />
            <span>Last updated: {new Date().toLocaleString()}</span>
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
                    Progress: {submission.completed_modules}/{submission.total_modules} modules
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
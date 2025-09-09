import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Linkedin, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { createReport, validateLinkedInUrl } from '../lib/reports';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

const Dashboard: React.FC = () => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUrlError('');

    // Validate LinkedIn URL
    if (!validateLinkedInUrl(linkedinUrl)) {
      setUrlError('Invalid URL. Please enter a valid public LinkedIn profile URL.');
      return;
    }

    setLoading(true);

    try {
      const { report, error } = await createReport(user.id, linkedinUrl);
      
      if (error || !report) {
        throw new Error('Failed to create report');
      }

      navigate(`/report/${report.id}`);
    } catch (error) {
      setUrlError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Users className="w-8 h-8 text-cyan-600" />,
      title: "Competitor Engagement",
      description: "Discover who's engaging with your competitor's LinkedIn content"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: "Audience Insights",
      description: "Analyze your competitor's audience and engagement patterns over the last 30 days"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Detailed Reports",
      description: "Get comprehensive Google Sheets with all competitor engagement data and audience insights"
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Competitor LinkedIn Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your competitors' LinkedIn engagement and discover who's interacting with their content. Get detailed insights into their audience and engagement patterns.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="linkedin-url" className="block text-lg font-semibold text-gray-900 mb-3">
                Enter Competitor's LinkedIn Profile URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Linkedin className="h-6 w-6 text-blue-600" />
                </div>
                <input
                  id="linkedin-url"
                  type="url"
                  required
                  value={linkedinUrl}
                  onChange={(e) => {
                    setLinkedinUrl(e.target.value);
                    setUrlError('');
                  }}
                  className={`block w-full pl-14 pr-4 py-4 border-2 rounded-2xl text-lg focus:ring-4 focus:ring-cyan-200 transition-all ${
                    urlError 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-cyan-500'
                  }`}
                  placeholder="https://www.linkedin.com/in/competitor-username"
                />
              </div>
              {urlError && (
                <p className="mt-2 text-red-600 text-sm">{urlError}</p>
              )}
              <p className="mt-2 text-gray-500 text-sm">
                Enter the LinkedIn profile URL of the competitor you want to analyze. Example: https://www.linkedin.com/in/competitor-name
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !linkedinUrl}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 px-6 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-cyan-600 focus:ring-4 focus:ring-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Analyze Competitor</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
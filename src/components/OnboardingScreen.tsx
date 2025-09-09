import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FileText, Linkedin, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../lib/auth';
import { validateLinkedInUrl } from '../lib/reports';

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<'linkedin' | 'complete'>('linkedin');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLinkedInSubmit = async (e: React.FormEvent) => {
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
      // Update profile with LinkedIn URL and mark onboarding as complete
      await updateProfile(user.id, { 
        linkedin_profile_url: linkedinUrl,
        has_completed_onboarding: true 
      });
      await refreshProfile();
      
      setStep('complete');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setUrlError('Failed to save your LinkedIn profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="bg-white rounded-3xl shadow-xl p-12 space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to clay.wtf!
              </h1>
              
              <p className="text-lg text-gray-600">
                Your profile has been set up successfully!
              </p>
              
              <p className="text-sm text-gray-500">
                You'll be redirected to your dashboard in a moment...
              </p>
            </div>

            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            One Last Step
          </h1>
          <p className="text-gray-600">
            Please provide your LinkedIn profile URL to complete your setup
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {urlError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{urlError}</p>
            </div>
          )}

          <form onSubmit={handleLinkedInSubmit} className="space-y-6">
            <div>
              <label htmlFor="linkedin-url" className="block text-lg font-semibold text-gray-900 mb-3">
                Your LinkedIn Profile URL *
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
                  placeholder="https://www.linkedin.com/in/your-username"
                />
              </div>
              <p className="mt-2 text-gray-500 text-sm">
                This helps us personalize your experience and enables competitor analysis features.
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
                  <span>Complete Setup</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
            <p className="text-blue-700 text-sm">
              <strong>Why do we need this?</strong> Your LinkedIn profile helps us personalize your experience and enables advanced competitor analysis features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
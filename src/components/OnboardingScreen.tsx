import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../lib/auth';

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    const completeOnboarding = async () => {
      if (user) {
        await updateProfile(user.id, { has_completed_onboarding: true });
        await refreshProfile();
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    };

    completeOnboarding();
  }, [user, navigate, refreshProfile]);

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
              Thank you for completing the onboarding process!
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
};

export default OnboardingScreen;
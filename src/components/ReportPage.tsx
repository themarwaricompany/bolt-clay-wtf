import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ExternalLink, AlertTriangle, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { pollReportStatus } from '../lib/reports';
import Layout from './Layout';

const ReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'completed' | 'error'>('processing');
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (!reportId) {
      navigate('/dashboard');
      return;
    }

    let pollInterval: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const pollReport = async () => {
      try {
        const result = await pollReportStatus(reportId);
        
        if (result.status === 'completed' && result.googleSheetUrl) {
          setStatus('completed');
          setGoogleSheetUrl(result.googleSheetUrl);
          clearInterval(pollInterval);
          clearTimeout(timeoutTimer);
        } else if (result.status === 'error') {
          setStatus('error');
          clearInterval(pollInterval);
          clearTimeout(timeoutTimer);
        }
      } catch (error) {
        console.error('Error polling report:', error);
      }
    };

    // Start polling every 10 seconds
    pollInterval = setInterval(pollReport, 10000);
    
    // Set timeout for 2.5 minutes
    timeoutTimer = setTimeout(() => {
      if (status === 'processing') {
        setTimeoutReached(true);
        setStatus('error');
        clearInterval(pollInterval);
      }
    }, 150000); // 2.5 minutes

    // Initial poll
    pollReport();

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutTimer);
    };
  }, [reportId, navigate, status]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleViewSheet = () => {
    if (googleSheetUrl) {
      window.open(googleSheetUrl, '_blank');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Analyzing Competitor Profile...
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Your competitor analysis report is being generated and will appear here shortly.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-blue-700 text-sm">
                  This process typically takes 1-2 minutes. We're analyzing the last 30 days of your competitor's engagement data.
                </p>
              </div>
            </>
          )}

          {status === 'completed' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Success! Your competitor analysis is ready.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Your competitor's LinkedIn engagement analysis has been completed and saved to a Google Sheet.
              </p>
              
              <button
                onClick={handleViewSheet}
                className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-4 px-8 rounded-2xl text-lg font-semibold hover:from-green-700 hover:to-emerald-600 focus:ring-4 focus:ring-green-200 transition-all flex items-center justify-center space-x-3 mx-auto"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>View Your Google Sheet</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
                <p className="text-green-700 text-sm">
                  Your report includes competitor engagement data from the last 30 days, including names, LinkedIn profiles, and headlines of users who interacted with their content.
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                {timeoutReached 
                  ? "Sorry, something went wrong while generating your competitor analysis. Please try again."
                  : "We encountered an error while processing your request."
                }
              </p>
              
              <button
                onClick={handleBackToDashboard}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 px-8 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-cyan-600 focus:ring-4 focus:ring-cyan-200 transition-all"
              >
                Try Again
              </button>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-8">
                <p className="text-red-700 text-sm">
                  If this problem persists, please ensure the competitor's LinkedIn profile URL is public and accessible.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportPage;
import { supabase } from './supabase';

export interface CreateReportData {
  linkedinUrl: string;
  userEmail: string;
}

// Mock n8n.io webhook URLs - replace with actual URLs
const N8N_WEBHOOK_URL = 'https://n8n.ruskmedia.in/webhook-test/fc8b24f1-b5fb-4cea-8f4b-6268f6c40386';
const N8N_RESULTS_URL = 'https://n8n.ruskmedia.in/webhook-test/fc8b24f1-b5fb-4cea-8f4b-6268f6c40386';

export const createReport = async (userId: string, linkedinUrl: string) => {
  // Insert report into database
  const { data: report, error: dbError } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      linkedin_url: linkedinUrl,
      status: 'processing',
    })
    .select()
    .single();

  if (dbError) {
    return { report: null, error: dbError };
  }

  // Get user profile for email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (profileError) {
    return { report: null, error: profileError };
  }

  // Trigger n8n.io workflow
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        linkedin_url: linkedinUrl,
        user_email: profile.email,
        report_id: report.id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger workflow');
    }

    return { report, error: null };
  } catch (error) {
    // Update report status to error
    await supabase
      .from('reports')
      .update({ status: 'error' })
      .eq('id', report.id);

    return { report: null, error: error as Error };
  }
};

export const pollReportStatus = async (reportId: string): Promise<{ 
  status: 'processing' | 'completed' | 'error'; 
  googleSheetUrl?: string 
}> => {
  try {
    // Check database first
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) {
      throw error;
    }

    if (report.status === 'completed' && report.google_sheet_url) {
      return {
        status: 'completed',
        googleSheetUrl: report.google_sheet_url,
      };
    }

    if (report.status === 'error') {
      return { status: 'error' };
    }

    // Poll n8n.io for results
    const response = await fetch(`${N8N_RESULTS_URL}?report_id=${reportId}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 'completed' && data.google_sheet_url) {
        // Update database with results
        await supabase
          .from('reports')
          .update({
            status: 'completed',
            google_sheet_url: data.google_sheet_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reportId);

        return {
          status: 'completed',
          googleSheetUrl: data.google_sheet_url,
        };
      }

      if (data.status === 'error') {
        await supabase
          .from('reports')
          .update({ status: 'error' })
          .eq('id', reportId);
        
        return { status: 'error' };
      }
    }

    return { status: 'processing' };
  } catch (error) {
    console.error('Error polling report status:', error);
    return { status: 'processing' };
  }
};

export const validateLinkedInUrl = (url: string): boolean => {
  const linkedinPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
  return linkedinPattern.test(url);
};

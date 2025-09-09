import { supabase } from './supabase';

export interface CreateReportData {
  linkedinUrl: string;
  userEmail: string;
}

// n8n.io webhook URL
const N8N_WEBHOOK_URL = 'https://n8n.ruskmedia.in/webhook-test/fc8b24f1-b5fb-4cea-8f4b-6268f6c40386';

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
    const response = await fetch(`${N8N_WEBHOOK_URL}?linkedin_url=${encodeURIComponent(linkedinUrl)}&report_id=${report.id}&user_email=${encodeURIComponent(profile.email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });


    if (!response.ok) {
      console.error('Webhook response:', response.status, response.statusText);
      throw new Error(`Failed to trigger workflow: ${response.status}`);
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

    // Just return processing status - the webhook will update the database when complete

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

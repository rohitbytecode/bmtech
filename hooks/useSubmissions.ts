import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  service_id?: string;
  status?: string;
  created_at?: string;
}

export const useSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSubmissions() {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all leads/submissions by the current user's email
        const { data, error: fetchError } = await supabase
          .from('leads')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (isMounted) {
          setSubmissions((data as Submission[]) || []);
          setSubmissionCount(data?.length || 0);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch submissions';
        if (isMounted) {
          setError(errorMessage);
          console.error('Fetch submissions error:', errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSubmissions();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  return { submissions, submissionCount, loading, error };
};

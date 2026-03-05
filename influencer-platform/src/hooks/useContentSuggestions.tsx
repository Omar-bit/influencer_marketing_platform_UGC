// filepath: c:\Users\bouas\code\webtrend\influencer-platform\influencer-platform\src\hooks\useContentSuggestions.tsx
import { useState } from 'react';
import { getContentSuggestions } from '@/utils/api/handlers/ai';
import { toast } from 'react-toastify';

type ContentSuggestion = {
  title: string;
  description: string;
  tips: string[];
};

interface UseContentSuggestionsReturn {
  suggestions: ContentSuggestion[];
  isLoading: boolean;
  error: any;
  fetchSuggestions: (applicationId: string) => Promise<void>;
}

export default function useContentSuggestions(): UseContentSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchSuggestions = async (applicationId: string) => {
    if (!applicationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getContentSuggestions(applicationId);

      if (response.success && response.data) {
        setSuggestions(response.data);
      } else {
        setError(response.message || 'Failed to load content suggestions');
        toast.error('Could not load content suggestions');
      }
    } catch (err: any) {
      console.error('Error fetching content suggestions:', err);
      setError(
        err?.response?.data?.message ||
          'An error occurred while fetching content suggestions'
      );
      toast.error('Failed to get content suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
  };
}

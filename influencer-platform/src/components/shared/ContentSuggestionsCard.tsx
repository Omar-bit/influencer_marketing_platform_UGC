import { useState } from 'react';
import { FaLightbulb, FaSpinner } from 'react-icons/fa';
import Button from '@/components/ui/button';
import useContentSuggestions from '@/hooks/useContentSuggestions';

interface ContentSuggestionsCardProps {
  applicationId: string;
  campaignName: string;
}

export default function ContentSuggestionsCard({
  applicationId,
  campaignName,
}: ContentSuggestionsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { suggestions, isLoading, fetchSuggestions } = useContentSuggestions();
  const [suggestionsFetched, setSuggestionsFetched] = useState(false);

  const handleGetSuggestions = async () => {
    if (!suggestionsFetched) {
      await fetchSuggestions(applicationId);
      setSuggestionsFetched(true);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className='bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center'>
        <div className='flex items-center'>
          <FaLightbulb className='text-yellow-400 mr-2' />
          <h3 className='font-medium text-gray-900 dark:text-white'>
            AI Content Suggestions
          </h3>
        </div>
        <Button
          user='influencer'
          variant={isExpanded ? 'outlined' : 'filled'}
          onClick={handleGetSuggestions}
          className='text-sm'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className='animate-spin mr-2' /> Generating...
            </>
          ) : isExpanded ? (
            'Hide Suggestions'
          ) : (
            'Get Content Ideas'
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className='p-4'>
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-influencer-primary'></div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className='space-y-6'>
              <p className='text-gray-600 dark:text-gray-300 text-sm italic'>
                Here are some content ideas for your {campaignName} campaign.
                Use these as inspiration for your content creation!
              </p>

              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600'
                >
                  <h4 className='text-influencer-primary font-semibold mb-2'>
                    {suggestion.title}
                  </h4>
                  <p className='text-gray-700 dark:text-gray-300 text-sm mb-3'>
                    {suggestion.description}
                  </p>

                  <div className='mt-2'>
                    <p className='text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1'>
                      Tips for execution:
                    </p>
                    <ul className='list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                      {suggestion.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-6'>
              <p className='text-gray-500 dark:text-gray-400 mb-3'>
                No content suggestions available. Try generating some!
              </p>
              <Button
                user='influencer'
                onClick={() => fetchSuggestions(applicationId)}
                disabled={isLoading}
              >
                Generate Suggestions
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

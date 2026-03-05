export const appliedSubTabs = [
  { value: 'all', label: 'ALL' },
  { value: 'accepted', label: 'ACCEPTED' },
  { value: 'pending', label: 'PENDING' },
  { value: 'rejected', label: 'REJECTED' },
];
export default function AppliedSubTabs({
  activeSubTab,
  setActiveSubTab,
  appliedCampaigns,
}: {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  appliedCampaigns: any[];
}) {
  return (
    <div className='flex gap-x-2 items-center mt-2 pb-1 border-b border-gray-200 dark:border-gray-700'>
      {appliedSubTabs.map((subTab) => (
        <button
          key={subTab.value}
          onClick={() => setActiveSubTab(subTab.value)}
          className={`px-3 py-1 rounded-md text-xs ${
            activeSubTab === subTab.value
              ? 'bg-pink-100 text-influencer-primary font-medium dark:bg-pink-900 dark:text-pink-200'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          {subTab.label}
          {subTab.value !== 'all' && (
            <span className='ml-1'>
              (
              {
                appliedCampaigns.filter((app: any) =>
                  subTab.value === 'all'
                    ? true
                    : app.status.toLowerCase() === subTab.value.toLowerCase()
                ).length
              }
              )
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

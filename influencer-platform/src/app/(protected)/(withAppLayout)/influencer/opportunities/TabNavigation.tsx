export const tabs = [
  { value: 'available', label: 'AVAILABLE OPPORTUNITIES', shouldCount: false },
  { value: 'applied', label: 'APPLIED', shouldCount: true },
];
const TabNavigation = ({
  activeTab,
  setActiveTab,
  setActiveSubTab,
  appliedCampaignsCount,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveSubTab: (tab: string) => void;
  appliedCampaignsCount: number;
}) => (
  <div className='p-0 m-0'>
    <div className='flex justify-between items-end border-b border-influencer-primary p-0 m-0'>
      <div className='flex gap-x-2 items-center'>
        {tabs.map((tab) => (
          <button
            className={`px-1 sm:px-2 py-1 rounded-t-md !text-[12px] uppercase ${
              activeTab === tab.value
                ? 'bg-influencer-primary text-white font-semibold'
                : 'text-[#8d8d8d] dark:text-gray-400'
            } `}
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              if (tab.value === 'applied') {
                setActiveSubTab('all');
              }
            }}
          >
            {`${tab.label}${
              tab.shouldCount ? ` (${appliedCampaignsCount})` : ''
            }`}
          </button>
        ))}
      </div>
    </div>
  </div>
);
export default TabNavigation;

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
const nicheOptions = [
  { value: 'all', label: 'All Niches' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'travel', label: 'Travel' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'food', label: 'Food' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'tech', label: 'Tech' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'product', label: 'Product' },
];


const platformOptions = [
  { value: 'all', label: 'All Platforms' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
];
export const sortOptions = [
  { value: 'lastUpdated', label: 'Last Updated' },
  { value: 'firstUpdated', label: 'First Updated' },
  { value: 'aToZ', label: 'A to Z' },
  { value: 'zToA', label: 'Z to A' },
];


const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  selectedPlatform,
  setSelectedPlatform,
  selectedNiche,
  setSelectedNiche,
  sortBy,
  setSortBy,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  selectedNiche: string;
  setSelectedNiche: (niche: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}) => (
  <div className='flex flex-wrap gap-2 mt-2 mb-1 p-1 items-end'>
    {/* Search Input */}
    <div className='flex-1 min-w-[200px]'>
      <Input
        type='search'
        placeholder='Search campaign...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={{
          container: 'w-full',
          input: '',
        }}
        leftIcon={
          <svg
            className='w-4 h-4 text-gray-500 dark:text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            ></path>
          </svg>
        }
      />
    </div>

    {/* Platform Filter */}
    <div className='min-w-[150px]'>
      <Select
        options={platformOptions}
        value={platformOptions.find(
          (option) => option.value === selectedPlatform
        )}
        setValue={(selectedOption) => setSelectedPlatform(selectedOption.value)}
        placeholder='Select Platform'
        className={{
          container: 'w-full',
        }}
      />
    </div>

    {/* Niche/Category Filter */}
    <div className='min-w-[150px]'>
      <Select
        options={nicheOptions}
        value={nicheOptions.find((option) => option.value === selectedNiche)}
        setValue={(selectedOption) => setSelectedNiche(selectedOption.value)}
        placeholder='Select Niche'
        className={{
          container: 'w-full',
        }}
      />
    </div>

    {/* Sort By */}
    <div className='relative'>
      <div className='flex flex-col gap-1'>
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          SORT BY
        </span>
        <Select
          options={sortOptions}
          value={sortOptions.find((option) => option.value === sortBy)}
          setValue={(selectedOption) => setSortBy(selectedOption.value)}
          className={{
            container: 'min-w-[150px]',
          }}
        />
      </div>
    </div>
  </div>
);

export default FiltersSection;
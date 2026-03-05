import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import TextArea from '@/components/ui/TextArea';
import { DEFAULT_CAMPAIGN_IMAGE } from '@/utils/constants';
import { addDays } from 'date-fns';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Step2({
  campaign,
  handleSetCampaign,
  image,
  setImage,
}: any) {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleSetCampaign('image', file);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const productServices = [
    { value: 'product', label: 'Product' },
    { value: 'service', label: 'Service' },
    { value: 'digital', label: 'Digital Product' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'event', label: 'Event' },
    { value: 'software', label: 'Software' },
    { value: 'app', label: 'Mobile App' },
    { value: 'course', label: 'Online Course' },
    { value: 'giftcard', label: 'Gift Card' },
    { value: 'other', label: 'Other' },
    { value: 'sports', label: 'Sports' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'home', label: 'Home' },
    { value: 'outdoors', label: 'Outdoors' },
    { value: 'toys', label: 'Toys' },
    { value: 'pets', label: 'Pets' },
  ];
  const topics = [
    { value: 't1', label: 'Topic1' },
    { value: 't2', label: 'Topic2' },
  ];
  const durations = [
    { value: '1', label: '1 Week' },
    { value: '2', label: '2 Weeks' },
    { value: '3', label: '3 Weeks' },
    { value: '4', label: '4 Weeks' },
    { value: '5', label: '5 Weeks' },
    { value: '6', label: '6 Weeks' },
  ];

  useEffect(() => {
    if (!campaign.startDate || !campaign.duration) return;
    const startDate = new Date(campaign.startDate);
    const duration = parseInt(campaign?.duration?.value || 0) * 7;
    const endDate = startDate ? addDays(startDate, duration) : null;
    // !todo :to import the product from third party platforms
    handleSetCampaign('endDate', endDate);
  }, [campaign.startDate, campaign.duration]);

  return (
    <div>
      <h3 className='font-bold text-md text-brand-secondary'>
        BASIC CAMPAIGN INFORMATION
      </h3>
      <div className='space-y-4 md:space-y-2 flex flex-col md:flex-row items-start md:items-stretch'>
        <div className='w-full md:w-1/2 space-y-2 p-1'>
          <Input
            label='Campaign Title'
            value={campaign.name}
            placeholder='Enter campaign title'
            labelPosition='left'
            onChange={(e) => handleSetCampaign('name', e.target.value)}
            className={{
              input: 'border !border-brand-secondary rounded-[20px]',
              label: 'flex-1',
            }}
          />
          <TextArea
            onChange={(e) => handleSetCampaign('description', e.target.value)}
            value={campaign.description}
            label='Campaign Description'
            className={{ textarea: '!border-brand-primary' }}
            placeholder="Describe your campaign goals, products, and what you're looking for from influencers"
          />
          <Select
            label='E-commerce Category'
            placeholder='Select a category'
            options={productServices}
            value={campaign.ecommerceCategory}
            labelPosition='left'
            setValue={(val: any) => handleSetCampaign('ecommerceCategory', val)}
            className={{ label: 'flex-1' }}
          />
          <Input
            label='Campaign Tags'
            value={campaign.tags}
            placeholder='e.g. summer, fashion, etc (comma seperated)'
            labelPosition='left'
            onChange={(e) => handleSetCampaign('tags', e.target.value)}
            className={{
              input: 'border !border-brand-secondary rounded-[20px]',
              label: 'flex-1',
            }}
          />
          <Input
            label='Country / Region'
            type='text'
            value={campaign.country}
            placeholder='Search'
            labelPosition='left'
            onChange={(e) => handleSetCampaign('country', e.target.value)}
            className={{
              input: 'border !border-brand-secondary rounded-[20px]',
              label: 'flex-1',
            }}
          />
        </div>
        <div className='w-full md:w-1/2 flex flex-col items-center gap-2'>
          <Image
            src={image || DEFAULT_CAMPAIGN_IMAGE}
            alt='Campaign Preview'
            width={200}
            height={200}
            className='rounded-lg object-cover w-[80%] md:w-[50%] h-[250px] md:h-[350px]'
          />
          <Input
            type='file'
            label='Select an image'
            onChange={handleImageChange}
            className={{
              container: 'w-full md:w-auto',
              input: 'w-full',
            }}
          />
        </div>
      </div>
    </div>
  );
}

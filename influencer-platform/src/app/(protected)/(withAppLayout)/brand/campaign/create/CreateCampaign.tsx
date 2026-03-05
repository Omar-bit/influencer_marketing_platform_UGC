'use client';

import Button from '@/components/ui/button';
import Seperator from '@/components/ui/Seperator';
import { CAMPAIGN_MODELS, SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import { useEffect, useState } from 'react';
import {
  createCampaign,
  draftCampaign,
  getCampaignById,
  editCampaign,
} from '@/utils/api/handlers/campaign';
import { toast } from 'react-toastify';
import Step4 from './components/Step4';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Cong from './components/Cong';
import Step5 from './components/Step5';
import { useSearchParams } from 'next/navigation';
import { BACKEND_URL } from '@/utils/secrets';
import { useSession } from 'next-auth/react';

export default function CreateCampaign() {
  const { data: session, update } = useSession();
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft');

  const [campaign, setCampaign] = useState({
    //STEP1
    model: null,
    reachTarget: null,
    engagementRate: null,
    conversionTarget: null,
    customGoal: '',
    //STEP2
    name: '',
    description: '',
    ecommerceCategory: null,
    tags: '',
    country: '',

    //STEP3
    isSponsored: false,
    startDate: null,
    endDate: null,
    budget: '', //STEP4
    product: {
      name: '',
      price: 0,
      category: null,
      description: '',
      files: [],
      productId: null,
    },
    affiliate: null,
    enableProductPurchase: false,

    //STEP5
    platforms: [],
    nbrOfInfluencers: 0,
    contentRequirements: '',

    // Campaign Visibility
    isPublic: true,
    targetedInfluencerLists: [],
    invitedInfluencers: [],
  });

  const [isNextDisabled, setIsNextDisabled] = useState(true);

  useEffect(() => {
    // Load draft campaign data if draftId is provided
    if (draftId) {
      setIsLoading(true);
      setIsDraft(true);
      getCampaignById(draftId)
        .then(({ data }) => {
          if (data && data.status === 'draft') {
            // Format the loaded campaign data to match the state structure
            const campaignData: any = { ...campaign };

            // Step 1
            const modelId =
              CAMPAIGN_MODELS.find((model: any) => model.title === data.model)
                ?.id || null;
            campaignData.model = modelId;
            campaignData.reachTarget = data.reachTarget;
            campaignData.engagementRate = data.engagementRate;
            campaignData.conversionTarget = data.conversionTarget;
            campaignData.customGoal = data.customGoal || '';

            // Step 2
            campaignData.name = data.name || '';
            campaignData.description = data.description || '';
            campaignData.ecommerceCategory = data.ecommerceCategory
              ? { value: data.ecommerceCategory, label: data.ecommerceCategory }
              : null;
            campaignData.tags = data.tags || '';
            campaignData.country = data.country || '';

            // Set image if available
            if (data.image) {
              setImage(`${BACKEND_URL}/uploads/${data.image}`);
            }

            // Step 3
            campaignData.isSponsored = data.isSponsored || false;
            campaignData.startDate = data.startDate
              ? new Date(data.startDate).toISOString().split('T')[0]
              : null;
            campaignData.endDate = data.endDate
              ? new Date(data.endDate).toISOString().split('T')[0]
              : null;
            campaignData.budget = data.budget?.toString() || ''; // Step 4
            if (data.product) {
              campaignData.product = {
                name: data.product.name || '',
                price: data.product.price || 0,
                category: data.product.category
                  ? {
                      value: data.product.category,
                      label: data.product.category,
                    }
                  : null,
                description: data.product.description || '',
                files: data.product.files || [],
                productId: data.product._id || null,
              };
            }

            if (data.affiliate) {
              campaignData.affiliate = {
                type: data.affiliate.type || 'percentage',
                value: data.affiliate.value || 0,
              };
            }

            // Step 5
            if (data.platforms && data.platforms.length > 0) {
              // Map platform names back to their indices in SUPPORTED_SOCIAL_MEDIAS
              const platformIndices = data.platforms
                .map((platformName: any) => {
                  const index = SUPPORTED_SOCIAL_MEDIAS.findIndex(
                    (platform) =>
                      platform.name.toLowerCase() === platformName.toLowerCase()
                  );
                  return index !== -1 ? index.toString() : null;
                })
                .filter(Boolean);

              campaignData.platforms = platformIndices;
            }

            campaignData.nbrOfInfluencers = data.nbrOfInfluencers || 0;
            campaignData.contentRequirements = data.contentRequirements || '';

            // Campaign visibility settings
            campaignData.isPublic = data.isPublic !== false; // Default to true if not specified
            campaignData.targetedInfluencerLists =
              data.targetedInfluencerLists || [];
            campaignData.invitedInfluencers = data.invitedInfluencers || [];

            setCampaign(campaignData);
          } else {
            toast.error('Invalid or non-draft campaign');
          }
        })
        .catch((err) => {
          console.error('Error loading draft campaign:', err);
          toast.error('Failed to load draft campaign');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [draftId]);

  const handleSetCampaign = (key: string, value: any) => {
    setCampaign((prevCampaign) => ({
      ...prevCampaign,
      [key]: value,
    }));
  };

  const handleSetProduct = (key: string, value: any) => {
    setCampaign((prevCampaign) => ({
      ...prevCampaign,
      product: { ...prevCampaign.product, [key]: value },
    }));
  };

  const steps: any = [
    <Step1 campaign={campaign} handleSetCampaign={handleSetCampaign} />,
    <Step2
      campaign={campaign}
      handleSetCampaign={handleSetCampaign}
      image={image}
      setImage={setImage}
    />,
    <Step3
      campaign={campaign}
      handleSetCampaign={handleSetCampaign}
      image={image}
    />,
    <Step4
      product={campaign.product}
      handleSetProduct={handleSetProduct}
      affiliate={campaign.affiliate}
      handleSetAffiliate={(affiliate: any) =>
        handleSetCampaign('affiliate', affiliate)
      }
      campaign={campaign}
      handleSetCampaign={handleSetCampaign}
    />,
    <Step5 campaign={campaign} handleSetCampaign={handleSetCampaign} />,
  ];
  function shouldDisableNext() {
    let shouldDisable = false;
    if (step === 0) {
      shouldDisable = !campaign.model;
    }
    if (step === 1) {
      shouldDisable =
        !campaign.name ||
        !campaign.description ||
        !campaign.ecommerceCategory ||
        !campaign.tags ||
        !campaign.country;
    }
    if (step === 2) {
      shouldDisable =
        (campaign.isSponsored && (!campaign.startDate || !campaign.endDate)) ||
        !campaign.budget ||
        Number(campaign.budget) < 100;
    }
    if (step === 3) {
      const product = campaign.product;
      shouldDisable =
        product.productId === null &&
        (product.name === '' ||
          product.price <= 0 ||
          product.category === null);
    }
    if (step === 4) {
      // Validate Step 5 fields - require influencer lists if private campaign
      shouldDisable =
        campaign.platforms.length === 0 ||
        (!campaign.isPublic && campaign.targetedInfluencerLists.length === 0);
    }
    return shouldDisable;
  }
  async function handleCreateCampaign(status: 'draft' | 'review') {
    try {
      const formData = new FormData();

      // Step 1 data
      //@ts-ignore
      const campaignModel = CAMPAIGN_MODELS.find(
        (model) => model.id === campaign.model
      );
      formData.append('model', campaignModel ? campaignModel.title : '');
      if (campaign.reachTarget)
        //@ts-ignore
        formData.append('reachTarget', campaign.reachTarget.toString());
      if (campaign.engagementRate)
        //@ts-ignore
        formData.append('engagementRate', campaign.engagementRate.toString());
      if (campaign.conversionTarget)
        formData.append(
          'conversionTarget',
          //@ts-ignore
          campaign.conversionTarget.toString()
        );
      formData.append('customGoal', campaign.customGoal);

      // Step 2 data
      formData.append('name', campaign.name);
      formData.append('description', campaign.description);
      formData.append(
        'ecommerceCategory',
        //@ts-ignore
        campaign.ecommerceCategory?.value || ''
      );
      formData.append('tags', campaign.tags);
      formData.append('country', campaign.country);
      //@ts-ignore
      if (campaign.image instanceof File) {
        //@ts-ignore
        formData.append('image', campaign.image);
      }

      // Step 3 data
      formData.append('isSponsored', campaign.isSponsored.toString());
      if (campaign.startDate)
        formData.append(
          'startDate',
          new Date(campaign.startDate).toISOString()
        );
      if (campaign.endDate)
        formData.append('endDate', new Date(campaign.endDate).toISOString());
      formData.append('budget', campaign.budget.toString());
      // If an existing product was selected (productId exists), send that
      if (campaign.product.productId) {
        formData.append('productId', campaign.product.productId);
      } else {
        // Otherwise send the product details
        formData.append('product[name]', campaign.product.name);
        formData.append('product[price]', campaign.product.price.toString());
        formData.append(
          'product[category]',
          //@ts-ignore
          campaign.product.category?.value || ''
        );
        formData.append('product[description]', campaign.product.description);

        // Handle product files
        if (campaign.product.files && campaign.product.files.length > 0) {
          campaign.product.files.forEach((file: File, index: number) => {
            formData.append(`productFiles`, file);
          });
        }
      }

      // Handle affiliate settings
      if (campaign.affiliate) {
        //@ts-ignore
        formData.append('affiliate[type]', campaign.affiliate.type);
        formData.append(
          'affiliate[value]',
          //@ts-ignore
          campaign.affiliate.value.toString()
        );
      }

      // Add enableProductPurchase field
      formData.append(
        'enableProductPurchase',
        campaign.enableProductPurchase.toString()
      );

      // Step 5 data
      // Convert platform IDs to actual platform names
      const platforms = campaign.platforms.map(
        (p) => SUPPORTED_SOCIAL_MEDIAS[parseInt(p)].name
      );
      platforms.forEach((platform: string) => {
        formData.append('platforms[]', platform);
      });

      formData.append('nbrOfInfluencers', campaign.nbrOfInfluencers.toString());
      formData.append('contentRequirements', campaign.contentRequirements);

      // Campaign visibility
      formData.append('isPublic', campaign.isPublic.toString());
      campaign.targetedInfluencerLists.forEach((list: string) => {
        formData.append('targetedInfluencerLists[]', list);
      });
      campaign.invitedInfluencers.forEach((influencer: string) => {
        formData.append('invitedInfluencers[]', influencer);
      });

      // Set status
      formData.append('status', status);

      // Send request to appropriate endpoint
      if (isDraft && draftId) {
        // For existing draft, update it instead of creating a new one
        await editCampaign(draftId, formData);
        toast.success(
          status === 'draft'
            ? 'Draft campaign has been updated'
            : 'Campaign has been submitted for review'
        );
      } else {
        // For new campaigns
        if (status === 'draft') {
          await draftCampaign(formData);
          toast.success('Campaign has been saved as draft');
        } else {
          const createCampaignRes = await createCampaign(formData);

          console.log('Create Campaign Response:', createCampaignRes);
          toast.success('Campaign has been created successfully');
          update({
            ...session,
            user: {
              ...session?.user,
              //@ts-ignore
              remainingCampaigns: session?.user?.remainingCampaigns - 1,
            },
          });
        }
      }

      setIsDone(true);
    } catch (err: any) {
      console.log('Error creating campaign:', err);
      toast.error(err?.response?.data?.message || 'Failed to create campaign');
    }
  }

  useEffect(() => {
    setIsNextDisabled(shouldDisableNext());
  }, [campaign, step]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
        <p className='ml-2'>Loading draft campaign...</p>
      </div>
    );
  }

  return !isDone ? (
    <div className='space-y-3 p-2 dark:bg-gray-900'>
      <header>
        <h2 className='font-bold text-xl text-brand-primary dark:text-brand-primary'>
          {isDraft ? 'CONTINUE CAMPAIGN' : 'CREATE CAMPAIGN'}
        </h2>
      </header>
      {
        //@ts-ignore
        session?.user?.remainingCampaigns === 0 && (
          <div className='bg-red-100 text-red-800 p-3 rounded-md mb-3'>
            <p className='text-sm'>
              You have reached your campaign limit. Please upgrade your plan to
              create more campaigns.
            </p>
          </div>
        )
      }
      <main className='p-1'>{steps[step]}</main>
      <footer className='flex flex-col sm:flex-row items-center justify-between gap-3 p-3'>
        <div className='w-full sm:w-auto'>
          {step > 0 && (
            <Button
              variant='outlined'
              color='danger'
              className='!px-8 sm:!px-20 w-full sm:w-auto'
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
        </div>
        <Seperator className='hidden sm:block flex-1 h-1' />
        <div className='flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0'>
          {step > 0 && (
            <Button
              color='gray'
              onClick={() => handleCreateCampaign('draft')}
              className='w-full sm:w-auto'
              disabled={step <= 3}
            >
              Save Draft
            </Button>
          )}
          {step !== steps.length - 1 ? (
            <Button
              className='!px-8 sm:!px-20 w-full sm:w-auto'
              color='gradient'
              variant='filled'
              onClick={() => setStep(step + 1)}
              disabled={isNextDisabled}
            >
              NEXT
            </Button>
          ) : (
            <Button
              disabled={
                //@ts-ignore
                isNextDisabled || session?.user?.remainingCampaigns === 0
              }
              className='!px-8 sm:!px-20 w-full sm:w-auto'
              color='gradient'
              variant='filled'
              onClick={() => handleCreateCampaign('review')}
            >
              Create
            </Button>
          )}
        </div>
      </footer>
    </div>
  ) : (
    <div className='w-full flex flex-col items-center p-3 dark:bg-gray-900'>
      <Cong />
    </div>
  );
}

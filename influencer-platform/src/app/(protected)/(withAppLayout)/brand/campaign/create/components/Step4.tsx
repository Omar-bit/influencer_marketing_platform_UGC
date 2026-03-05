import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import TextArea from '@/components/ui/TextArea';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import CheckBox from './CheckBox';
import useGetProducts from '@/hooks/useGetProducts';
import { BACKEND_URL } from '@/utils/secrets';

export default function Step4({
  product,
  handleSetProduct,
  handleSetAffiliate,
  affiliate,
  campaign,
  handleSetCampaign,
}: any) {
  const [entryMethod, setEntryMethod] = useState('existing');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { products, isLoading } = useGetProducts({ status: 'active' });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleSetProduct('files', [...product.files, files[0]]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...product.files];
    updatedFiles.splice(index, 1);
    handleSetProduct('files', updatedFiles);
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    handleSetProduct('name', product.name);
    handleSetProduct('price', product.price);
    handleSetProduct('category', {
      value: product.category,
      label: product.category,
    });
    handleSetProduct('description', product.description);
    handleSetProduct('productId', product._id);
    // Reset the files as we'll use the product's images
    handleSetProduct('files', []);
  };

  const getFileType = (file: File) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    return 'other';
  };

  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );
  const fileUrlsRef = useRef<Record<string, string>>({});

  const getFileObjectUrl = (file: File) => {
    if (!fileUrlsRef.current[file.name]) {
      fileUrlsRef.current[file.name] = URL.createObjectURL(file);
    }
    return fileUrlsRef.current[file.name];
  };

  const handleContentLoaded = (index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: false }));
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      Object.values(fileUrlsRef.current).forEach(URL.revokeObjectURL);
    };
  }, []);

  const FileSkeleton = () => (
    <div className='w-full h-full bg-gray-200 animate-pulse rounded-lg'></div>
  );

  const renderFilePreview = (file: File, index: number) => {
    const fileType = getFileType(file);
    const isLoading = loadingStates[index] !== false;
    const objectUrl = getFileObjectUrl(file);

    switch (fileType) {
      case 'image':
        return (
          <>
            {isLoading && <FileSkeleton />}
            <Image
              src={objectUrl}
              alt={file.name}
              width={200}
              height={200}
              className={`w-full h-full object-cover ${
                isLoading ? 'hidden' : ''
              }`}
              onLoad={() => handleContentLoaded(index)}
            />
          </>
        );
      case 'video':
        return (
          <>
            {isLoading && <FileSkeleton />}
            <video
              src={objectUrl}
              className={`w-full h-full object-cover ${
                isLoading ? 'hidden' : ''
              }`}
              controls
              onLoadedData={() => handleContentLoaded(index)}
            />
          </>
        );
      case 'pdf':
        return (
          <div className='w-full h-full flex items-center justify-center bg-gray-100'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='text-red-500'
            >
              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
              <polyline points='14 2 14 8 20 8'></polyline>
              <path d='M9 15h6'></path>
              <path d='M9 11h6'></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className='w-full h-full flex items-center justify-center bg-gray-100'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='text-blue-500'
            >
              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
              <polyline points='14 2 14 8 20 8'></polyline>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className='w-full space-y-4'>
      <div>
        <h3 className='font-bold text-md text-brand-secondary'>
          PRODUCT DETAILS
        </h3>
        <p className='text-sm text-gray-500 mb-2'>
          Please select an existing product or enter new product details.
          Product selection is required to create a campaign.
        </p>
        {/* <div className='w-full sm:w-[75%] ml-0 sm:ml-auto flex items-center mt-2'>
          <button
            className={`flex-1 text-center border border-influencer-primary border-r-0 rounded-lg rounded-r-none p-2 text-sm ${
              entryMethod === 'manual'
                ? 'influencer-primary-gradient text-white'
                : 'text-brand-primary'
            }`}
            onClick={() => setEntryMethod('manual')}
          >
            Manual Entry
          </button>
          <button
            className={`flex-1 text-center border border-influencer-primary rounded-lg rounded-l-none p-2 text-sm ${
              entryMethod === 'existing'
                ? 'influencer-primary-gradient text-white'
                : 'text-brand-primary'
            }`}
            onClick={() => setEntryMethod('existing')}
          >
            Choose Existing
          </button>
        </div> */}
      </div>

      <div className='flex flex-col gap-3'>
        {entryMethod === 'existing' ? (
          <div className='border border-gray-200 rounded-lg p-4'>
            <h4 className='font-medium text-md mb-3'>
              Select a product from your inventory
            </h4>
            {isLoading ? (
              <div className='flex justify-center py-4'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-influencer-primary'></div>
              </div>
            ) : products.length === 0 ? (
              <div className='text-center py-4 text-gray-500'>
                No products found. Please create products or use manual entry.
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                {products.map((product: any) => (
                  <div
                    key={product._id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedProduct?._id === product._id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-gray-200 hover:border-brand-primary/50'
                    }`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className='aspect-square mb-2 relative'>
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={`${BACKEND_URL}/uploads/${product.images[0].file}`}
                          alt={product.name}
                          fill
                          className='object-cover rounded-lg'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='48'
                            height='48'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='1'
                            className='text-gray-400'
                          >
                            <rect
                              x='2'
                              y='2'
                              width='20'
                              height='20'
                              rx='2'
                              ry='2'
                            ></rect>
                            <circle cx='12' cy='12' r='3'></circle>
                            <path d='M16.5 7.5v.001'></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className='font-medium truncate'>{product.name}</div>
                    <div className='text-sm text-gray-500 truncate'>
                      {product.category}
                    </div>
                    <div className='font-medium text-brand-primary'>
                      {product.price} TND
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <Input
              label='Product Name'
              labelPosition='left'
              value={product.name}
              placeholder='Enter product name'
              onChange={(e) => handleSetProduct('name', e.target.value)}
              className={{
                container:
                  'flex flex-col sm:flex-row items-start sm:items-center',
                input: 'border !border-brand-secondary rounded-[20px]',
                label: 'w-full sm:!w-[20%] !text-sm mb-1 sm:mb-0',
              }}
            />

            <Input
              type='number'
              label='Product Price (TND)'
              labelPosition='left'
              value={product.price}
              placeholder='Enter product price'
              onChange={(e) => handleSetProduct('price', e.target.value)}
              className={{
                container:
                  'flex flex-col sm:flex-row items-start sm:items-center',
                input: 'border !border-brand-secondary rounded-[20px]',
                label: 'w-full sm:!w-[20%] !text-sm mb-1 sm:mb-0',
              }}
            />

            <Select
              options={[
                {
                  value: 'product',
                  label: 'Product',
                },
                {
                  value: 'service',
                  label: 'Service',
                },
              ]}
              label='Product Category'
              labelPosition='left'
              setValue={(val: any) => handleSetProduct('category', val)}
              value={product.category}
              placeholder='Select category'
              className={{
                container:
                  'flex flex-col sm:flex-row items-start sm:items-center',
                label: 'w-full sm:!w-[23%] !text-sm mb-1 sm:mb-0',
                select:
                  'border !border-brand-secondary rounded-[20px] text-[14px] font-normal',
              }}
            />

            <TextArea
              label='Product Description'
              labelPosition='left'
              value={product.description}
              placeholder='Enter product description'
              onChange={(e) => handleSetProduct('description', e.target.value)}
              className={{
                container:
                  'flex flex-col sm:flex-row items-start sm:items-start',
                textarea: 'border !border-brand-secondary rounded-[20px]',
                label: 'w-full sm:!w-[20%] !text-sm mb-1 sm:mb-0',
              }}
            />

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Product Images</label>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                {product.files.map((file: File, index: number) => (
                  <div
                    key={index}
                    className='aspect-square relative border rounded-lg overflow-hidden group'
                  >
                    {renderFilePreview(file, index)}
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className='absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <line x1='18' y1='6' x2='6' y2='18'></line>
                        <line x1='6' y1='6' x2='18' y2='18'></line>
                      </svg>
                    </button>
                  </div>
                ))}
                <label className='aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-primary/50 transition-colors'>
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*,video/*,.pdf'
                    onChange={handleImageUpload}
                  />
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='text-gray-400'
                  >
                    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
                    <polyline points='17 8 12 3 7 8'></polyline>
                    <line x1='12' y1='3' x2='12' y2='15'></line>
                  </svg>
                </label>
              </div>
            </div>
          </>
        )}

        <CheckBox
          label='Enable Product Purchase'
          value={campaign.enableProductPurchase}
          handleClick={() =>
            handleSetCampaign(
              'enableProductPurchase',
              !campaign.enableProductPurchase
            )
          }
          title='Enable product purchase functionality'
          description='Allow influencers to include a purchase link in their content, enabling direct sales through their posts'
        />

        {/* <CheckBox
          label='Affiliate Campaign'
          value={affiliate}
          handleClick={() =>
            handleSetAffiliate(
              affiliate
                ? null
                : {
                    type: 'percentage',
                    value: 0,
                  }
            )
          }
          title='This is an affiliate campaign'
          description='Enable this option if influencers will earn commission on sales generated through their links'
        />
        {affiliate && (
          <div className='mt-2'>
            <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
              <div className='w-full sm:w-auto'>
                <Select
                  options={[
                    { value: 'percentage', label: 'Percentage (%)' },
                    { value: 'fixed', label: 'Fixed Amount (TND)' },
                  ]}
                  value={{
                    value: affiliate.type,
                    label:
                      affiliate.type === 'percentage'
                        ? 'Percentage (%)'
                        : 'Fixed Amount (TND)',
                  }}
                  setValue={(val) =>
                    handleSetAffiliate({ ...affiliate, type: val.value })
                  }
                  placeholder='Select type'
                  className={{
                    select:
                      'border !border-brand-secondary rounded-[20px] text-[14px] font-normal',
                  }}
                />
              </div>
              <div className='w-full sm:w-auto'>
                <Input
                  type='number'
                  value={affiliate.value}
                  placeholder={
                    affiliate.type === 'percentage'
                      ? 'Enter percentage'
                      : 'Enter fixed amount'
                  }
                  onChange={(e) =>
                    handleSetAffiliate({
                      ...affiliate,
                      value: parseFloat(e.target.value),
                    })
                  }
                  className={{
                    input: 'border !border-brand-secondary rounded-[20px]',
                  }}
                />
              </div>
              <div className='text-sm text-gray-500'>
                {affiliate.type === 'percentage'
                  ? `Influencers will earn ${affiliate.value}% of each sale.`
                  : `Influencers will earn ${affiliate.value} TND per sale.`}
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

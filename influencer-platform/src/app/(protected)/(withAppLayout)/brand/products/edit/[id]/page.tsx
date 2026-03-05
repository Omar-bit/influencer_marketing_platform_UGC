'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProduct, updateProduct } from '@/utils/api/handlers/product';
import { toast } from 'react-toastify';
import { FiX, FiUpload } from 'react-icons/fi';
import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import BackLink from '@/components/ui/BackLink';
import { BACKEND_URL } from '@/utils/secrets';

const CATEGORY_OPTIONS = [
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Beauty', value: 'Beauty' },
  { label: 'Home & Kitchen', value: 'Home & Kitchen' },
  { label: 'Food & Beverage', value: 'Food & Beverage' },
  { label: 'Health & Wellness', value: 'Health & Wellness' },
  { label: 'Sports & Outdoors', value: 'Sports & Outdoors' },
  { label: 'Toys & Games', value: 'Toys & Games' },
  { label: 'Books & Media', value: 'Books & Media' },
  { label: 'Software & Apps', value: 'Software & Apps' },
  { label: 'Other', value: 'Other' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

interface ProductImage {
  file: string;
  three?: string;
}

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: null as { label: string; value: string } | null,
    status: STATUS_OPTIONS[0],
    stock: '',
    specifications: {} as Record<string, string>,
  });

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // For specifications
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id);
    }
  }, [params.id]);

  const fetchProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const product = await getProduct(productId);

      setProductData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: { label: product.category, value: product.category },
        status:
          product.status === 'active' ? STATUS_OPTIONS[0] : STATUS_OPTIONS[1],
        stock: product.stock.toString(),
        specifications: product.specifications || {},
      });

      setExistingImages(product.images || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProductData({
      ...productData,
      [field]: value,
    });
  };

  const handleNewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImagesArray = [...newImages];
    const newImageUrls = [...newImagePreviewUrls];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newImagesArray.push(file);
      newImageUrls.push(URL.createObjectURL(file));
    }

    setNewImages(newImagesArray);
    setNewImagePreviewUrls(newImageUrls);
  };

  const removeExistingImage = (image: ProductImage) => {
    setExistingImages(existingImages.filter((img) => img.file !== image.file));
    setImagesToDelete([...imagesToDelete, image.file]);
  };

  const removeNewImage = (index: number) => {
    const newImagesArray = [...newImages];
    const newImageUrls = [...newImagePreviewUrls];

    URL.revokeObjectURL(newImageUrls[index]);
    newImagesArray.splice(index, 1);
    newImageUrls.splice(index, 1);

    setNewImages(newImagesArray);
    setNewImagePreviewUrls(newImageUrls);
  };

  const addSpecification = () => {
    if (!specKey.trim() || !specValue.trim()) return;

    setProductData({
      ...productData,
      specifications: {
        ...productData.specifications,
        [specKey]: specValue,
      },
    });

    setSpecKey('');
    setSpecValue('');
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...productData.specifications };
    delete newSpecs[key];

    setProductData({
      ...productData,
      specifications: newSpecs,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!productData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!productData.description.trim()) {
      setError('Product description is required');
      return;
    }

    if (
      !productData.price ||
      isNaN(parseFloat(productData.price)) ||
      parseFloat(productData.price) <= 0
    ) {
      setError('Please enter a valid price');
      return;
    }

    if (!productData.category) {
      setError('Please select a category');
      return;
    }

    if (
      !productData.stock ||
      isNaN(parseInt(productData.stock)) ||
      parseInt(productData.stock) < 0
    ) {
      setError('Please enter a valid stock quantity');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('category', productData.category.value);
      formData.append('status', productData.status.value);
      formData.append('stock', productData.stock);
      formData.append(
        'specifications',
        JSON.stringify(productData.specifications)
      );

      // Keep track of images to retain
      formData.append('existingImages', JSON.stringify(existingImages));
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));

      // Append new images
      newImages.forEach((image) => {
        formData.append('images', image);
      });

      // Submit data
      await updateProduct(params.id, formData);

      toast.success('Product updated successfully');
      router.push(`/brand/products/${params.id}`);
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product');
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='p-4 flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
      </div>
    );
  }

  return (
    <div className='p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='mb-6 flex items-center'>
        <BackLink
          userType='brand'
          to={`/brand/products/${params.id}`}
          className='mr-4'
        />
        <h1 className='text-2xl md:text-3xl font-bold text-brand-primary'>
          Edit Product
        </h1>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div className='md:col-span-2'>
              <Input
                label='Product Name'
                value={productData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder='Enter product name'
                type='text'
                className={{
                  container: 'w-full',
                  input: 'border rounded-md w-full',
                }}
              />
            </div>

            <div className='md:col-span-2'>
              <TextArea
                label='Description'
                value={productData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='Enter product description'
                className={{
                  container: 'w-full',
                  textarea: 'border rounded-md w-full',
                }}
              />
            </div>

            <div>
              <Input
                label='Price'
                value={productData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder='Enter product price'
                type='number'
                className={{
                  container: 'w-full',
                  input: 'border rounded-md w-full',
                }}
              />
            </div>

            <div>
              <Input
                label='Stock Quantity'
                value={productData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder='Enter stock quantity'
                type='number'
                className={{
                  container: 'w-full',
                  input: 'border rounded-md w-full',
                }}
              />
            </div>

            <div>
              <Select
                label='Category'
                options={CATEGORY_OPTIONS}
                value={productData.category}
                setValue={(value) => handleInputChange('category', value)}
                placeholder='Select category'
                className={{
                  container: 'w-full',
                }}
              />
            </div>

            <div>
              <Select
                label='Status'
                options={STATUS_OPTIONS}
                value={productData.status}
                setValue={(value) => handleInputChange('status', value)}
                placeholder='Select status'
                className={{
                  container: 'w-full',
                }}
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Product Images
              </label>

              {existingImages.length > 0 && (
                <div className='mb-4'>
                  <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Current Images
                  </h4>
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {existingImages.map((image, index) => (
                      <div key={index} className='relative group'>
                        <img
                          src={`${BACKEND_URL}/uploads/${image.file}`}
                          alt={`Product image ${index + 1}`}
                          className='h-32 w-full object-cover rounded-md'
                        />
                        <button
                          type='button'
                          onClick={() => removeExistingImage(image)}
                          className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 flex flex-col items-center justify-center'>
                <FiUpload className='text-gray-400 text-3xl mb-2' />
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
                  Add new images by dragging and dropping, or click to browse
                </p>
                <input
                  type='file'
                  id='product-images'
                  accept='image/*'
                  multiple
                  onChange={handleNewImageChange}
                  className='hidden'
                />
                <label
                  htmlFor='product-images'
                  className='cursor-pointer bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors'
                >
                  Browse Files
                </label>
              </div>

              {newImagePreviewUrls.length > 0 && (
                <div className='mt-4'>
                  <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    New Images
                  </h4>
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {newImagePreviewUrls.map((url, index) => (
                      <div key={index} className='relative group'>
                        <img
                          src={url}
                          alt={`New product image ${index + 1}`}
                          className='h-32 w-full object-cover rounded-md'
                        />
                        <button
                          type='button'
                          onClick={() => removeNewImage(index)}
                          className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Specifications
              </label>

              <div className='flex gap-4 mb-2'>
                <Input
                  placeholder='Specification name'
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  type='text'
                  className={{
                    container: 'flex-1',
                    input: 'border rounded-md w-full',
                  }}
                />

                <Input
                  placeholder='Specification value'
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  type='text'
                  className={{
                    container: 'flex-1',
                    input: 'border rounded-md w-full',
                  }}
                />

                <Button
                  type='button'
                  user='brand'
                  onClick={addSpecification}
                  disabled={!specKey.trim() || !specValue.trim()}
                >
                  Add
                </Button>
              </div>

              {Object.keys(productData.specifications).length > 0 && (
                <div className='mt-2 border rounded-md overflow-hidden'>
                  <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                    <thead className='bg-gray-50 dark:bg-gray-700'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Specification
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Value
                        </th>
                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                      {Object.entries(productData.specifications).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                              {key}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                              {value}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                              <button
                                type='button'
                                onClick={() => removeSpecification(key)}
                                className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'>
              <p>{error}</p>
            </div>
          )}

          <div className='flex justify-end gap-3'>
            <Button
              user='brand'
              variant='outlined'
              type='button'
              onClick={() => router.push(`/brand/products/${params.id}`)}
            >
              Cancel
            </Button>
            <Button user='brand' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

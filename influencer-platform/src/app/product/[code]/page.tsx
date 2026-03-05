'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getProductByCode,
  purchaseProduct,
} from '@/utils/api/handlers/product';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Button from '@/components/ui/button';
import Seperator from '@/components/ui/Seperator';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';
import Input from '@/components/ui/Input';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: {
    file: string;
    three?: string;
  }[];
  category: string;
  status: 'active' | 'inactive';
  stock: number;
  specifications: Record<string, any>;
  brand: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PublicProductPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductByCode(code);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      }
    };

    fetchProduct();
  }, [code]);

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handlePurchase = async () => {
    if (!buyerEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsPurchasing(true);
      const response = await purchaseProduct(params.code as string, {
        email: buyerEmail,
        name: buyerName,
      });

      if (response.success) {
        const { data } = response;
        const { payUrl } = data;
        if (payUrl) {
          window.location.href = payUrl;
        } else {
          toast.error('Payment URL not found. Please try again.');
        }
      } else {
        toast.error(response.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(
        error.response?.data?.message ||
          'An error occurred while processing payment.'
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  if (error || !product) {
    return (
      <div className='p-4'>
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4'>
          <p>{error || 'Product not found'}</p>
        </div>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className='p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
          <div className='md:flex'>
            {/* Product Images */}
            <div className='md:w-1/2 relative'>
              {product.images.length > 0 ? (
                <div className='relative h-[400px]'>
                  <Image
                    src={`${BACKEND_URL}/uploads/${product.images[currentImageIndex].file}`}
                    alt={product.name}
                    fill
                    className='object-contain'
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors'
                      >
                        <FiChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors'
                      >
                        <FiChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className='h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-700'>
                  <p className='text-gray-500 dark:text-gray-400'>
                    No images available
                  </p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className='md:w-1/2 p-6'>
              <div className='flex justify-between items-start'>
                <div>
                  <h2 className='text-2xl font-bold mb-2 dark:text-white'>
                    {product.name}
                  </h2>
                  <p className='text-gray-600 dark:text-gray-400 text-sm mb-4'>
                    {product.category}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {product.status === 'active' ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>

              <p className='text-3xl font-bold text-brand-primary mb-4'>
                {product.price.toFixed(2)}TND
              </p>

              <p className='text-gray-700 dark:text-gray-300 mb-6'>
                {product.description}
              </p>

              <div className='mb-6'>
                <h3 className='font-semibold text-lg mb-2 dark:text-white'>
                  Stock Information
                </h3>
                <p className='text-gray-700 dark:text-gray-300'>
                  Available:{' '}
                  <span className='font-medium'>{product.stock}</span> units
                </p>
              </div>

              {/* {Object.keys(product.specifications).length > 0 && (
                <div className='mb-6'>
                  <h3 className='font-semibold text-lg mb-2 dark:text-white'>
                    Specifications
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className='flex justify-between border-b border-gray-200 dark:border-gray-700 py-2'
                        >
                          <span className='text-gray-600 dark:text-gray-400'>
                            {key}
                          </span>
                          <span className='font-medium dark:text-white'>
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )} */}

              <Seperator className='mb-6' />

              <div className='space-y-4 mb-6'>
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Email Address *
                  </label>
                  <Input
                    id='email'
                    type='email'
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder='Enter your email address'
                    required
                    className={{
                      container: 'w-full',
                      input: 'w-full',
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Full Name (Optional)
                  </label>
                  <Input
                    id='name'
                    type='text'
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder='Enter your full name'
                    className={{
                      container: 'w-full',
                      input: 'w-full',
                    }}
                  />
                </div>
              </div>

              <div className='flex gap-3'>
                <Button
                  onClick={handlePurchase}
                  disabled={product.status !== 'active' || isPurchasing}
                >
                  {isPurchasing ? 'Processing...' : 'Purchase Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

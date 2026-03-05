'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProduct, deleteProduct } from '@/utils/api/handlers/product';
import { toast } from 'react-toastify';
import {
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import Button from '@/components/ui/button';
import Seperator from '@/components/ui/Seperator';
import BackLink from '@/components/ui/BackLink';
import Link from 'next/link';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';

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

export default function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id);
    }
  }, [params.id]);

  const fetchProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const data = await getProduct(productId);
      setProduct(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      setIsDeleting(true);
      await deleteProduct(product._id);
      toast.success('Product deleted successfully');
      router.push('/brand/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const nextImage = () => {
    if (!product?.images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product?.images.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className='p-4 flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='p-4'>
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4'>
          <p>{error || 'Product not found'}</p>
        </div>
        <Button user='brand' onClick={() => router.push('/brand/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className='p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='mb-6 flex items-center'>
        <BackLink userType='brand' to='/brand/products' className='mr-4' />
        <h1 className='text-2xl md:text-3xl font-bold text-brand-primary'>
          Product Details
        </h1>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <div className='md:flex'>
          <div className='md:w-1/2 p-4'>
            <div className='relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden'>
              {product.images && product.images.length > 0 ? (
                <>
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
                        className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <FiChevronRight size={20} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className='w-full h-full flex items-center justify-center'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    No image available
                  </span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className='mt-4 flex gap-2 overflow-x-auto pb-2'>
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? 'border-brand-primary'
                        : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={`${BACKEND_URL}/uploads/${image}`}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className='object-cover'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

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
                {product.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>

            <p className='text-3xl font-bold text-brand-primary mb-4'>
              {product.price.toFixed(2)} TND
            </p>

            <p className='text-gray-700 dark:text-gray-300 mb-6'>
              {product.description}
            </p>

            <div className='mb-6'>
              <h3 className='font-semibold text-lg mb-2 dark:text-white'>
                Stock Information
              </h3>
              <p className='text-gray-700 dark:text-gray-300'>
                Available: <span className='font-medium'>{product.stock}</span>{' '}
                units
              </p>
            </div>

            {Object.keys(product.specifications).length > 0 && (
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
            )}

            <Seperator className='mb-6' />

            <div className='flex gap-3'>
              <Link href={`/brand/products/edit/${product._id}`}>
                <Button user='brand' className='flex items-center gap-2'>
                  <FiEdit size={16} />
                  <span>Edit Product</span>
                </Button>
              </Link>
              <Button
                user='brand'
                variant='outlined'
                color='danger'
                className='flex items-center gap-2'
                onClick={() => setShowDeleteModal(true)}
              >
                <FiTrash2 size={16} />
                <span>Delete Product</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full'>
            <h3 className='text-xl font-bold mb-4 dark:text-white'>
              Confirm Delete
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              Are you sure you want to delete "{product.name}"? This action
              cannot be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <Button
                user='brand'
                variant='outlined'
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                user='brand'
                color='danger'
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getProducts, deleteProduct } from '@/utils/api/handlers/product';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '@/utils/secrets';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiBarChart,
} from 'react-icons/fi';
import Button from '@/components/ui/button';
import Seperator from '@/components/ui/Seperator';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: { file: string; three: string }[];
  category: string;
  status: 'active' | 'inactive';
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, selectedStatus, products]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(
        (product) => product.status === selectedStatus
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting({ ...isDeleting, [productToDelete]: true });
      await deleteProduct(productToDelete);
      setProducts(
        products.filter((product) => product._id !== productToDelete)
      );
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting({ ...isDeleting, [productToDelete]: false });
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const getUniqueCategories = () => {
    const categories = products.map((product) => product.category);
    return ['all', ...new Set(categories)];
  };

  return (
    <div className='p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      {' '}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-brand-primary'>
            Product Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Manage your products for campaigns and promotions
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-3 mt-3 md:mt-0'>
          <Link href='/brand/products/sales'>
            <Button
              user='brand'
              variant='outlined'
              className='flex items-center gap-2'
            >
              <FiBarChart />
              <span>Sales History</span>
            </Button>
          </Link>
          <Link href='/brand/products/create'>
            <Button
              user='brand'
              color='primary'
              className='flex items-center gap-2'
            >
              <FiPlus />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6'>
        <div className='flex flex-col md:flex-row gap-4 items-start md:items-center'>
          <div className='relative flex-grow'>
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search products...'
              className='pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='flex flex-wrap gap-3 w-full md:w-auto'>
            <select
              className='border rounded-md px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {getUniqueCategories().map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              className='border rounded-md px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value='all'>All Statuses</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
            </select>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
        </div>
      ) : error ? (
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4'>
          <p>{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center'>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            No products found
          </p>
          <Link href='/brand/products/create'>
            <Button user='brand' color='primary'>
              Add Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'
            >
              <div className='relative h-48 bg-gray-200 dark:bg-gray-700'>
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={`${BACKEND_URL}/uploads/${product.images[0].file}`}
                    alt={product.name}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <span className='text-gray-500 dark:text-gray-400'>
                      No image
                    </span>
                  </div>
                )}
                <div className='absolute top-2 right-2 bg-white dark:bg-gray-700 px-2 py-1 rounded-full text-xs font-medium'>
                  {product.status === 'active' ? (
                    <span className='text-green-600 dark:text-green-400'>
                      Active
                    </span>
                  ) : (
                    <span className='text-red-600 dark:text-red-400'>
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className='p-4'>
                <h3 className='font-bold text-lg mb-1 truncate'>
                  {product.name}
                </h3>
                <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>
                  {product.category}
                </p>
                <p className='text-brand-primary font-semibold mb-2'>
                  {product.price.toFixed(2)} TND
                </p>
                <p className='text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2'>
                  {product.description}
                </p>
                <Seperator className='mb-4' />
                <div className='flex justify-between'>
                  <Link href={`/brand/products/${product._id}`}>
                    <Button
                      user='brand'
                      variant='outlined'
                      className='flex items-center gap-1'
                    >
                      <FiEye size={14} />
                      <span>View</span>
                    </Button>
                  </Link>
                  <Link href={`/brand/products/edit/${product._id}`}>
                    <Button
                      user='brand'
                      variant='outlined'
                      className='flex items-center gap-1'
                    >
                      <FiEdit size={14} />
                      <span>Edit</span>
                    </Button>
                  </Link>
                  <Button
                    user='brand'
                    variant='outlined'
                    color='danger'
                    className='flex items-center gap-1'
                    onClick={() => handleDeleteClick(product._id)}
                    disabled={isDeleting[product._id]}
                  >
                    <FiTrash2 size={14} />
                    <span>
                      {isDeleting[product._id] ? 'Deleting...' : 'Delete'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full'>
            <h3 className='text-xl font-bold mb-4 dark:text-white'>
              Confirm Delete
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <Button user='brand' variant='outlined' onClick={cancelDelete}>
                Cancel
              </Button>
              <Button user='brand' color='danger' onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

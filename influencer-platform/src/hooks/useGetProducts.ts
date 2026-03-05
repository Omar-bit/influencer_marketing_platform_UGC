import { useState, useEffect } from 'react';
import { getProducts } from '@/utils/api/handlers/product';

export default function useGetProducts(
  options: {
    category?: string;
    status?: 'active' | 'inactive';
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts({
        category: options.category,
        status: options.status,
      });
      setProducts(data);
      setError(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled !== false) {
      fetchProducts();
    }
  }, [options.category, options.status, options.enabled]);

  return { products, isLoading, error, refetch: fetchProducts };
}

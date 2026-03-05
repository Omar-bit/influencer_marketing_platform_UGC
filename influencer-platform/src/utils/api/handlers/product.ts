import * as productRoutes from '../routes/product';
import { api } from '@/utils/axiosInstance';

export interface ProductData {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  status: 'active' | 'inactive';
  stock: number;
  specifications: Record<string, any>;
}

export async function createProduct(data: FormData | ProductData) {
  try {
    let payload = data;
    let headers = {};

    // If it's not FormData, we need to send it as JSON
    if (!(data instanceof FormData)) {
      headers = {
        'Content-Type': 'application/json',
      };
    }

    const { data: responseData } = await api.post(
      productRoutes.CREATE_PRODUCT,
      payload,
      { headers }
    );
    return responseData;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
}

export async function getProducts(filters?: {
  category?: string;
  status?: 'active' | 'inactive';
}) {
  const queryParams = new URLSearchParams();

  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.status) queryParams.append('status', filters.status);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${productRoutes.GET_PRODUCTS}?${queryString}`
    : productRoutes.GET_PRODUCTS;

  const { data } = await api.get(url);
  return data;
}

export async function getProduct(id: string) {
  const { data } = await api.get(productRoutes.GET_PRODUCT(id));
  return data;
}

export async function updateProduct(id: string, data: FormData | ProductData) {
  try {
    let payload = data;
    let headers = {};

    // If it's not FormData, we need to send it as JSON
    if (!(data instanceof FormData)) {
      headers = {
        'Content-Type': 'application/json',
      };
    }

    const { data: responseData } = await api.put(
      productRoutes.UPDATE_PRODUCT(id),
      payload,
      { headers }
    );
    return responseData;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(productRoutes.DELETE_PRODUCT(id));
  return data;
}

export async function getProductByCode(code: string) {
  const { data } = await api.get(productRoutes.GET_PRODUCT_BY_CODE(code));
  return data;
}

export async function purchaseProduct(code: string, buyerData: { email: string; name?: string }) {
  const { data } = await api.post(productRoutes.PURCHASE_PRODUCT(code), buyerData);
  return data;
}

export async function getProductSales() {
  const { data } = await api.get(productRoutes.GET_PRODUCT_SALES);
  return data;
}

export async function getProductFinancialStats() {
  const { data } = await api.get(productRoutes.GET_PRODUCT_FINANCIAL_STATS);
  return data;
}

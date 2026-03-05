import express, { Router, RequestHandler } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import upload from '../utils/fileUpload';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductByCode,
  purchaseProduct,
  handleProductPaymentStatus,
  getProductSales,
  getProductFinancialStats,
} from '../controllers/productController';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router: Router = express.Router();

// All routes are protected with authentication
// router.use();

// Create a new product (brand only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('business'),
  upload.array('images', 10), // Allow up to 10 images
  createProduct
);

// Get all products (filtered by brand if user is a brand)
router.get('/', authMiddleware, getProducts);

// Get product sales (brand only)
router.get('/sales', authMiddleware, roleMiddleware('business'), getProductSales);

// Get product financial stats (brand only)
router.get('/financial-stats', authMiddleware, roleMiddleware('business'), getProductFinancialStats);

// Get product by code (public access)
router.get('/code/:code', getProductByCode);

// Purchase product
router.post('/purchase/:code', purchaseProduct);

// Handle payment status
router.all('/payment/:saleId', handleProductPaymentStatus);

// Get a specific product
router.get('/:id', authMiddleware, getProduct);

// Update a product (brand only)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('business'),
  upload.array('images', 10),
  updateProduct
);

// Delete a product (brand only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('business'),
  deleteProduct
);

export default router;

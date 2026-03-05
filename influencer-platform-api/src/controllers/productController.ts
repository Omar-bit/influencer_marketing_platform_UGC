import { Request, Response } from 'express';
import { Product, IProduct } from '../models/product';
import { IUser } from '../models/user';
import InfluencerApplication from '../models/influencerApplication';
import CampaignContent from '../models/campaignContent';
import Campaign from '../models/campaign';
import User from '../models/user';
import { initiatePayment, getPaymentStatus } from '@services/paymentService';
import ProductSale from '../models/productSale';
import {
  PAYMENT_PRODUCT_REDIRECTION,
  PAYMENT_PRODUCT_URL,
} from '@utils/constants';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    if (user.type !== 'business') {
      res.status(403).json({ message: 'Only brands can create products' });
      return;
    }

    // Handle both FormData and JSON data
    let { name, description, price, category, status, stock } = req.body;
    let images: { file: string; three?: string }[] = [];
    let specifications = req.body.specifications || {};

    // Parse specifications if it's a string (from FormData)
    if (typeof specifications === 'string') {
      try {
        specifications = JSON.parse(specifications);
      } catch (e) {
        console.error('Error parsing specifications:', e);
        specifications = {};
      }
    }

    // Make sure price is a number
    price = Number(price);
    stock = Number(stock);

    // Handle image uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Handle files if they were uploaded via multer
      images = req.files.map((file: any) => ({
        file: file.filename,
        three: undefined,
      }));
    } else if (req.files && typeof req.files === 'object') {
      // Handle if files are in req.files object (common with multer)
      const filesObj = req.files as any;
      if (filesObj.images) {
        const imageFiles = Array.isArray(filesObj.images)
          ? filesObj.images
          : [filesObj.images];
        images = imageFiles.map((file: any) => ({
          file: file.filename,
          three: undefined,
        }));
      }
    }

    // Log the data to debug
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const productData = {
      name,
      description,
      price,
      images,
      category,
      status,
      stock,
      specifications,
      //@ts-ignore
      brand: user.userId,
    };
    console.log('Final Product Data:', productData);

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: 'Error creating product', error });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user.userId;
    const query: any = { brand: user };

    // Add filters if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const products = await Product.find(query)
      .populate('brand', 'name email')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'brand',
      'name email'
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user.userId;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if user is the brand owner
    if (product.brand.toString() !== user.toString()) {
      res
        .status(403)
        .json({ message: 'Not authorized to update this product' });
      return;
    }

    // Prepare the update data
    const updateData = { ...req.body };

    // Parse specifications if it's a string
    if (typeof updateData.specifications === 'string') {
      try {
        updateData.specifications = JSON.parse(updateData.specifications);
      } catch (e) {
        console.error('Error parsing specifications:', e);
      }
    }

    // Convert price and stock to numbers
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock) updateData.stock = Number(updateData.stock);

    // Handle image uploads if any
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // If new images were uploaded, replace the old ones
      updateData.images = req.files.map((file: any) => ({
        file: file.filename,
        three: undefined,
      }));
    } else if (req.files && typeof req.files === 'object') {
      // Handle if files are in req.files object (common with multer)
      const filesObj = req.files as any;
      if (filesObj.images) {
        const imageFiles = Array.isArray(filesObj.images)
          ? filesObj.images
          : [filesObj.images];
        updateData.images = imageFiles.map((file: any) => ({
          file: file.filename,
          three: undefined,
        }));
      }
    }

    // If images are being updated and there are existing images with three property,
    // preserve the three property for existing images
    if (updateData.images && product.images) {
      updateData.images = updateData.images.map(
        (newImage: { file: string }) => {
          const existingImage = product.images.find(
            (img: { file: string; three?: string }) =>
              img.file === newImage.file
          );
          return {
            ...newImage,
            three: existingImage?.three,
          };
        }
      );
    }

    console.log('Update data:', updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('brand', 'name email');

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user.userId;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if user is the brand owner
    if (product.brand.toString() !== user.toString()) {
      res
        .status(403)
        .json({ message: 'Not authorized to delete this product' });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

export const getProductByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Find the application with the given product URL code
    const application = await InfluencerApplication.findOne({
      productUrlCode: code,
    });

    if (!application) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Find the campaign content associated with this application
    const content = await CampaignContent.findOne({
      application: application._id,
      status: 'posted',
    });

    if (!content) {
      res.status(404).json({ message: 'Product content not found' });
      return;
    }

    // Get the campaign details
    const campaign = await Campaign.findById(application.campaign);
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    // Get the brand details
    const brand = await User.findById(campaign.business);
    if (!brand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    const product = await Product.findById(campaign.product);

    // Format the response
    const productData = {
      name: product?.name,
      description: product?.description,
      price: product?.price,
      category: product?.category,
      images: product?.images,
      status: product?.status,
      stock: product?.stock,
      specifications: product?.specifications,
      brand: {
        _id: brand._id,
        name: brand.name,
        email: brand.email,
      },
      createdAt: product?.createdAt,
      updatedAt: product?.updatedAt,
    };

    res.json({
      message: 'Product fetched successfully',
      data: productData,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching product by code:', error);
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

export const purchaseProduct = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { email, name } = req.body;

    // Find the application with the product URL code
    const application = await InfluencerApplication.findOne({
      productUrlCode: code,
    });
    if (!application) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Get the campaign and product details
    const campaign = await Campaign.findById(application.campaign);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    const product = await Product.findById(campaign.product);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Check if product is in stock
    if (product.stock <= 0) {
      res
        .status(400)
        .json({ success: false, message: 'Product is out of stock' });
      return;
    }
    const brand = await User.findById(product.brand);
    if (!brand) {
      res.status(404).json({ success: false, message: 'Brand not found' });
      return;
    }
    // Create a new sale record
    const sale = new ProductSale({
      product: product._id,
      buyer: { email, name },
      amount: product.price,
      paymentRef: '', // Will be updated after payment initiation
      influencer: application.influencer,
    });

    // Initiate payment
    const paymentData = await initiatePayment(
      product.price,
      email,
      PAYMENT_PRODUCT_URL + sale._id,
      PAYMENT_PRODUCT_URL + sale._id,
      `Purchase of ${product.name}`,
      brand.walletId // Send payment to brand's wallet
    );
    console.log('data zebi', paymentData);
    // Update sale with payment reference
    sale.paymentRef = paymentData?.paymentRef;
    await sale.save();

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentData,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleProductPaymentStatus = async (
  req: Request,
  res: Response
) => {
  const { payment_ref } = req.query;
  const { saleId } = req.params;

  if (!payment_ref) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    return;
  }

  try {
    const sale = await ProductSale.findById(saleId);
    if (!sale) {
      res.status(404).json({ success: false, message: 'Sale not found' });
      return;
    }

    const paymentStatus = await getPaymentStatus(payment_ref as string);
    if (!paymentStatus) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    if (paymentStatus.payment.status !== 'completed') {
      res
        .status(400)
        .json({ success: false, message: 'Payment not completed' });
      return;
    }

    // Update sale status
    sale.status = 'completed';
    await sale.save();

    // Update product stock
    const product = await Product.findById(sale.product);
    if (product) {
      product.stock -= 1;
      await product.save();
    }

    const redirectionParams = new URLSearchParams({
      type: 'Product',
      paymentRef: payment_ref as string,
      saleId: saleId,
      status: 'success',
    });

    res
      .status(200)
      .redirect(
        PAYMENT_PRODUCT_REDIRECTION + '?' + redirectionParams.toString()
      );
  } catch (err: any) {
    const redirectionParams = new URLSearchParams({
      type: 'Product',
      paymentRef: payment_ref as string,
      status: 'failed',
      saleId: saleId,
      error: err.message,
    });

    res.redirect(
      PAYMENT_PRODUCT_REDIRECTION + '?' + redirectionParams.toString()
    );
  }
};

export const getProductSales = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;

    // Get all products for this brand
    const products = await Product.find({ brand: userId });
    const productIds = products.map((product) => product._id);

    // Get all sales for these products
    const sales = await ProductSale.find({ product: { $in: productIds } })
      .populate({
        path: 'product',
        select: 'name price images',
      })
      .populate({
        path: 'influencer',
        select: 'name email profilePicture',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error('Error fetching product sales:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product sales',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getProductFinancialStats = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;

    // Get all products for this brand
    const products = await Product.find({ brand: userId });
    const productIds = products.map((product) => product._id);

    // Get all sales for these products
    const sales = await ProductSale.find({ product: { $in: productIds } });

    // Calculate financial statistics
    const stats = {
      totalRevenue: 0,
      pendingPayouts: 0,
      completedPayouts: 0,
      failedPayouts: 0,
      actionTypeSummary: {
        directSales: 0,
        influencerSales: 0,
        pendingSales: 0,
        completedSales: 0,
        failedSales: 0,
      },
    };

    sales.forEach((sale) => {
      // Calculate revenue and payouts
      if (sale.status === 'completed') {
        stats.totalRevenue += sale.amount;
        stats.completedPayouts += sale.amount;
      } else if (sale.status === 'pending') {
        stats.pendingPayouts += sale.amount;
      } else if (sale.status === 'failed') {
        stats.failedPayouts += sale.amount;
      }

      // Calculate action type summary
      if (sale.influencer) {
        stats.actionTypeSummary.influencerSales++;
      } else {
        stats.actionTypeSummary.directSales++;
      }

      // Add to status counts
      //@ts-ignore
      stats.actionTypeSummary[`${sale.status}Sales`]++;
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching product financial stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product financial stats',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

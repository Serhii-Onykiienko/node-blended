import createHttpError from 'http-errors';
import { Product } from '../models/product.js';

//? GET для всіх товарів

export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.status(200).json(products);
};

//? GET для пошуку за ID

export const getProductById = async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw createHttpError(404, 'Product not found');
  }
  res.status(200).json(product);
};

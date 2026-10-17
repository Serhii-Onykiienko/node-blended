import { Router } from 'express';
import {
  getProductById,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productsController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use('/products', authenticate);

router.get('/products', getProducts);
router.get('/products/:productId', getProductById);
router.post('/products', createProduct);
router.patch('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

export default router;

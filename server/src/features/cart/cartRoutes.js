import express from 'express'
import { verifyFirebaseToken } from '../../middleware/authMiddleware.js'
import { handleValidationErrors } from '../../middleware/validationMiddleware.js'
import { 
  validateAddToCart,
  validateCheckout,
} from './cartValidation.js'
import {
  handleAddCartItem,
  handleClearCart,
  handleGetCartItems,
  handleRemoveCartItem,
  handleReserveCartItems,
} from './cartController.js'

const router = express.Router()

router.get('/', verifyFirebaseToken, handleGetCartItems)
router.post('/', verifyFirebaseToken, validateAddToCart, handleValidationErrors, handleAddCartItem)
router.post('/reserve', verifyFirebaseToken, validateCheckout, handleValidationErrors, handleReserveCartItems)
router.delete('/:listingId', verifyFirebaseToken, handleRemoveCartItem)
router.delete('/', verifyFirebaseToken, handleClearCart)

export default router
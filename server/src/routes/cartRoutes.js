import express from 'express'
import { verifyFirebaseToken } from '../middleware/authMiddleware.js'
import {
  handleAddCartItem,
  handleClearCart,
  handleGetCartItems,
  handleRemoveCartItem,
  handleReserveCartItems,
} from '../controllers/cartController.js'

const router = express.Router()

router.get('/', verifyFirebaseToken, handleGetCartItems)
router.post('/', verifyFirebaseToken, handleAddCartItem)
router.post('/reserve', verifyFirebaseToken, handleReserveCartItems)
router.delete('/:listingId', verifyFirebaseToken, handleRemoveCartItem)
router.delete('/', verifyFirebaseToken, handleClearCart)

export default router
import { successResponse, errorResponse } from '../utils/helper.js'
import { addCartItem, clearCart, getCartItems, removeCartItem, reserveCartItems } from '../services/cartService.js'

export const handleGetCartItems = async (req, res) => {
  try {
    const userId = req.user.uid
    const items = await getCartItems(userId)
    return successResponse(res, { items })
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get cart items', error.statusCode || 500)
  }
}

export const handleAddCartItem = async (req, res) => {
  try {
    const userId = req.user.uid
    const item = await addCartItem(userId, req.body)
    return successResponse(res, { item }, 201)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to add item to cart', error.statusCode || 500)
  }
}

export const handleRemoveCartItem = async (req, res) => {
  try {
    const userId = req.user.uid
    const { listingId } = req.params
    const item = await removeCartItem(userId, listingId)

    if (!item) {
      return errorResponse(res, 'Cart item not found', 404)
    }

    return successResponse(res, { item })
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to remove item from cart', error.statusCode || 500)
  }
}

export const handleClearCart = async (req, res) => {
  try {
    const userId = req.user.uid
    await clearCart(userId)
    return successResponse(res, { message: 'Cart cleared successfully' })
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to clear cart', error.statusCode || 500)
  }
}

export const handleReserveCartItems = async (req, res) => {
  try {
    const userId = req.user.uid
    const bookings = await reserveCartItems(userId)
    return successResponse(res, { bookings }, 201)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to reserve cart items', error.statusCode || 500)
  }
}

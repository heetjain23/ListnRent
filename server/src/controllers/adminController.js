import * as adminService from '../services/adminService.js'

// POST /api/admin/init - Initialize admin user
export const handleInitializeAdmin = async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body

    // Check if admin/delivery partner exists
    const existingAdmin = await adminService.getAdminByEmail(email)
    if (!existingAdmin) {
      // User not registered - redirect to client app
      return res.status(403).json({
        success: false,
        message: 'User not found in system.',
        shouldRedirectToClient: true,
      })
    }

    // Check if user is active
    const isActive = await adminService.isAdminActive(email)
    if (!isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact support.',
        shouldRedirectToClient: false,
      })
    }

    // Update admin profile
    const admin = await adminService.updateAdminProfile(email, {
      displayName,
      photoURL,
    })

    res.status(200).json({
      success: true,
      message: 'User initialized',
      shouldRedirectToClient: false,
      admin: {
        email: admin.email,
        displayName: admin.displayName,
        photoURL: admin.photoURL,
        role: admin.role,
        status: admin.status,
      },
    })
  } catch (error) {
    console.error('Admin init error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize admin',
      shouldRedirectToClient: false,
    })
  }
}

// POST /api/admin/add-admin - Add new admin
export const handleAddAdmin = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const admin = await adminService.addNewAdmin(email)

    res.status(201).json({
      success: true,
      message: 'Admin added successfully',
      admin: {
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    })
  } catch (error) {
    console.error('Add admin error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add admin',
    })
  }
}

// GET /api/admin/users - Get all users with their booking and listing counts
export const handleGetAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsersWithCounts()

    res.status(200).json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get users',
    })
  }
}

// DELETE /api/admin/users/:id - Delete a user
export const handleDeleteUser = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      })
    }

    await adminService.deleteUserById(id)

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete user',
    })
  }
}

// GET /api/admin/list - Get all admins with details
export const handleGetAllAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAllAdminsWithDetails()

    res.status(200).json({
      success: true,
      admins,
    })
  } catch (error) {
    console.error('Get all admins error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get admins',
    })
  }
}

// DELETE /api/admin/admin/:email - Delete an admin
export const handleDeleteAdmin = async (req, res) => {
  try {
    const { email } = req.params

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    await adminService.deleteAdminByEmail(email)

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
    })
  } catch (error) {
    console.error('Delete admin error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete admin',
    })
  }
}

// PATCH /api/admin/admin-email/:email - Update admin email
export const handleUpdateAdminEmail = async (req, res) => {
  try {
    const { email } = req.params
    const { newEmail } = req.body

    if (!email || !newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email and new email are required',
      })
    }

    const admin = await adminService.updateAdminEmail(email, newEmail)

    res.status(200).json({
      success: true,
      message: 'Admin email updated successfully',
      admin: {
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error('Update admin email error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update admin email',
    })
  }
}

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

// GET /api/admin/profile - Get admin profile
export const handleGetAdminProfile = async (req, res) => {
  try {
    const { email } = req.body

    const admin = await adminService.getAdminProfile(email)

    res.status(200).json({
      success: true,
      admin: {
        email: admin.email,
        displayName: admin.displayName,
        photoURL: admin.photoURL,
        role: admin.role,
        status: admin.status,
        permissions: admin.permissions,
      },
    })
  } catch (error) {
    console.error('Get admin profile error:', error)
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to get admin profile',
    })
  }
}

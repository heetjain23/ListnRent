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

// POST /api/admin/delivery-partners - Add delivery partner
export const handleAddDeliveryPartner = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const deliveryPartner = await adminService.addDeliveryPartner(email)

    res.status(201).json({
      success: true,
      message: 'Delivery partner added successfully',
      deliveryPartner: {
        email: deliveryPartner.email,
        role: deliveryPartner.role,
        status: deliveryPartner.status,
      },
    })
  } catch (error) {
    console.error('Add delivery partner error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add delivery partner',
    })
  }
}

// GET /api/admin/delivery-partners - Get all delivery partners
export const handleGetDeliveryPartners = async (req, res) => {
  try {
    const deliveryPartners = await adminService.getAllDeliveryPartners()

    res.status(200).json({
      success: true,
      deliveryPartners: deliveryPartners.map((dp) => ({
        email: dp.email,
        displayName: dp.displayName,
        role: dp.role,
        status: dp.status,
        createdAt: dp.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get delivery partners error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get delivery partners',
    })
  }
}

// DELETE /api/admin/delivery-partners/:email - Remove delivery partner
export const handleRemoveDeliveryPartner = async (req, res) => {
  try {
    const { email } = req.params

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    await adminService.removeDeliveryPartner(email)

    res.status(200).json({
      success: true,
      message: 'Delivery partner removed successfully',
    })
  } catch (error) {
    console.error('Remove delivery partner error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove delivery partner',
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

// GET /api/admin/admins - Get all admins
export const handleGetAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins()

    res.status(200).json({
      success: true,
      admins: admins.map((admin) => ({
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
        status: admin.status,
        createdAt: admin.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get admins error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get admins',
    })
  }
}

// PATCH /api/admin/admin-status/:email - Update admin status
export const handleUpdateAdminStatus = async (req, res) => {
  try {
    const { email } = req.params
    const { status } = req.body

    if (!email || !status) {
      return res.status(400).json({
        success: false,
        message: 'Email and status are required',
      })
    }

    const admin = await adminService.updateAdminStatus(email, status)

    res.status(200).json({
      success: true,
      message: 'Admin status updated successfully',
      admin: {
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    })
  } catch (error) {
    console.error('Update admin status error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update admin status',
    })
  }
}

// POST /api/admin/support-team - Add support team member
export const handleAddSupportTeamMember = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const supportMember = await adminService.addSupportTeamMember(email)

    res.status(201).json({
      success: true,
      message: 'Support team member added successfully',
      supportMember: {
        email: supportMember.email,
        role: supportMember.role,
        status: supportMember.status,
      },
    })
  } catch (error) {
    console.error('Add support team member error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add support team member',
    })
  }
}

// GET /api/admin/support-team - Get all support team members
export const handleGetSupportTeam = async (req, res) => {
  try {
    const supportTeam = await adminService.getAllSupportTeam()

    res.status(200).json({
      success: true,
      supportTeam: supportTeam.map((st) => ({
        email: st.email,
        displayName: st.displayName,
        role: st.role,
        status: st.status,
        createdAt: st.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get support team error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get support team',
    })
  }
}

// DELETE /api/admin/support-team/:email - Remove support team member
export const handleRemoveSupportTeamMember = async (req, res) => {
  try {
    const { email } = req.params

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    await adminService.removeSupportTeamMember(email)

    res.status(200).json({
      success: true,
      message: 'Support team member removed successfully',
    })
  } catch (error) {
    console.error('Remove support team member error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to remove support team member',
    })
  }
}

// PATCH /api/admin/update-role/:email - Update admin role
export const handleUpdateAdminRole = async (req, res) => {
  try {
    const { email } = req.params
    const { role } = req.body

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required',
      })
    }

    const validRoles = ['admin', 'delivery_partner', 'super_admin', 'support_team']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`,
      })
    }

    const admin = await adminService.updateAdminRole(email, role)

    res.status(200).json({
      success: true,
      message: 'Admin role updated successfully',
      admin: {
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    })
  } catch (error) {
    console.error('Update admin role error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update admin role',
    })
  }
}

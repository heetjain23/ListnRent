import * as adminService from './adminService.js'

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

// ========== DELIVERY PARTNER CONTROLLERS ==========

// GET /api/admin/delivery-partners - Get all delivery partners
export const handleGetAllDeliveryPartners = async (req, res) => {
  try {
    const partners = await adminService.getAllDeliveryPartners()

    res.status(200).json({
      success: true,
      deliveryPartners: partners,
    })
  } catch (error) {
    console.error('Get all delivery partners error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get delivery partners',
    })
  }
}

// POST /api/admin/delivery-partners - Add a new delivery partner
export const handleAddDeliveryPartner = async (req, res) => {
  try {
    const { email, phone } = req.body

    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone are required',
      })
    }

    // Generate name from email (first part before @)
    const nameFromEmail = email.split('@')[0];

    const partner = await adminService.addDeliveryPartner({
      name: nameFromEmail,
      email,
      phone,
    })

    res.status(201).json({
      success: true,
      message: 'Delivery partner added successfully',
      deliveryPartner: partner,
    })
  } catch (error) {
    console.error('Add delivery partner error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add delivery partner',
    })
  }
}

// PATCH /api/admin/delivery-partners/:id - Update delivery partner
export const handleUpdateDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Partner ID is required',
      })
    }

    const partner = await adminService.updateDeliveryPartner(id, updates)

    res.status(200).json({
      success: true,
      message: 'Delivery partner updated successfully',
      deliveryPartner: partner,
    })
  } catch (error) {
    console.error('Update delivery partner error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update delivery partner',
    })
  }
}

// DELETE /api/admin/delivery-partners/:id - Delete a delivery partner
export const handleDeleteDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Partner ID is required',
      })
    }

    await adminService.deleteDeliveryPartner(id)

    res.status(200).json({
      success: true,
      message: 'Delivery partner deleted successfully',
    })
  } catch (error) {
    console.error('Delete delivery partner error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete delivery partner',
    })
  }
}

// PATCH /api/admin/delivery-partners/:id/status - Toggle delivery partner status
export const handleToggleDeliveryPartnerStatus = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Partner ID is required',
      })
    }

    const partner = await adminService.toggleDeliveryPartnerStatus(id)

    res.status(200).json({
      success: true,
      message: 'Delivery partner status updated successfully',
      deliveryPartner: partner,
    })
  } catch (error) {
    console.error('Toggle delivery partner status error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update delivery partner status',
    })
  }
}

// GET /api/admin/delivery-handling/tasks - Get delivery handling tasks
export const handleGetDeliveryHandlingTasks = async (req, res) => {
  try {
    const tasks = await adminService.getDeliveryHandlingTasks()

    res.status(200).json({
      success: true,
      tasks,
    })
  } catch (error) {
    console.error('Get delivery handling tasks error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get delivery tasks',
    })
  }
}

// POST /api/admin/delivery-handling/:bookingId/assign - Assign partner to a booking
export const handleAssignDeliveryPartnerToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { deliveryPartnerId } = req.body || {}

    if (!bookingId || !deliveryPartnerId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and delivery partner ID are required',
      })
    }

    const task = await adminService.assignDeliveryPartnerToBooking(bookingId, deliveryPartnerId)

    res.status(200).json({
      success: true,
      message: 'Delivery partner assigned successfully',
      task,
    })
  } catch (error) {
    console.error('Assign delivery partner error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to assign delivery partner',
    })
  }
}

// PATCH /api/admin/delivery-handling/:bookingId/status - Update delivery status
export const handleUpdateDeliveryTaskStatus = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { deliveryStatus } = req.body || {}

    if (!bookingId || !deliveryStatus) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and delivery status are required',
      })
    }

    const task = await adminService.updateDeliveryTaskStatus(bookingId, deliveryStatus)

    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      task,
    })
  } catch (error) {
    console.error('Update delivery status error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update delivery status',
    })
  }
}

// GET /api/admin/delivery-partners/:email/tasks - Get assigned tasks for delivery partner
export const handleGetAssignedTasksForDeliveryPartner = async (req, res) => {
  try {
    const { email } = req.params

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const tasks = await adminService.getAssignedTasksForDeliveryPartner(email)

    res.status(200).json({
      success: true,
      tasks,
    })
  } catch (error) {
    console.error('Get assigned partner tasks error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get assigned tasks',
    })
  }
}

// PATCH /api/admin/delivery-handling/:bookingId/milestone - Mark delivery lifecycle milestone
export const handleMarkDeliveryMilestone = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { action } = req.body || {}

    if (!bookingId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and action are required',
      })
    }

    const task = await adminService.markDeliveryMilestone(bookingId, action)

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      task,
    })
  } catch (error) {
    console.error('Mark delivery milestone error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark delivery milestone',
    })
  }
}

// GET /api/admin/delivery-partners/profile/:email - Get current delivery partner profile by email
export const handleGetDeliveryPartnerProfile = async (req, res) => {
  try {
    const { email } = req.params

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const profile = await adminService.getDeliveryPartnerProfileByEmail(email)

    res.status(200).json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Get delivery partner profile error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get delivery partner profile',
    })
  }
}

// PATCH /api/admin/delivery-partners/profile/:email - Update current delivery partner profile by email
export const handleUpdateDeliveryPartnerProfile = async (req, res) => {
  try {
    const { email } = req.params
    const updates = req.body || {}

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const profile = await adminService.updateDeliveryPartnerProfileByEmail(email, updates)

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    })
  } catch (error) {
    console.error('Update delivery partner profile error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update delivery partner profile',
    })
  }
}

// ========== SUPPORT TEAM CONTROLLERS ==========

// GET /api/admin/support-team - Get all support team members
export const handleGetAllSupportTeamMembers = async (req, res) => {
  try {
    const members = await adminService.getAllSupportTeamMembers()

    res.status(200).json({
      success: true,
      supportTeam: members,
    })
  } catch (error) {
    console.error('Get all support team members error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get support team members',
    })
  }
}

// POST /api/admin/support-team - Add a new support team member
export const handleAddSupportTeamMember = async (req, res) => {
  try {
    const { email, phone } = req.body

    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone are required',
      })
    }

    // Generate name from email (first part before @)
    const nameFromEmail = email.split('@')[0];

    const member = await adminService.addSupportTeamMember({
      name: nameFromEmail,
      email,
      phone,
    })

    res.status(201).json({
      success: true,
      message: 'Support team member added successfully',
      supportMember: member,
    })
  } catch (error) {
    console.error('Add support team member error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add support team member',
    })
  }
}

// PATCH /api/admin/support-team/:id - Update support team member
export const handleUpdateSupportTeamMember = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required',
      })
    }

    const member = await adminService.updateSupportTeamMember(id, updates)

    res.status(200).json({
      success: true,
      message: 'Support team member updated successfully',
      supportMember: member,
    })
  } catch (error) {
    console.error('Update support team member error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update support team member',
    })
  }
}

// DELETE /api/admin/support-team/:id - Delete a support team member
export const handleDeleteSupportTeamMember = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required',
      })
    }

    await adminService.deleteSupportTeamMember(id)

    res.status(200).json({
      success: true,
      message: 'Support team member deleted successfully',
    })
  } catch (error) {
    console.error('Delete support team member error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete support team member',
    })
  }
}

// PATCH /api/admin/support-team/:id/status - Toggle support team member status
export const handleToggleSupportTeamMemberStatus = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required',
      })
    }

    const member = await adminService.toggleSupportTeamMemberStatus(id)

    res.status(200).json({
      success: true,
      message: 'Support team member status updated successfully',
      supportMember: member,
    })
  } catch (error) {
    console.error('Toggle support team member status error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update support team member status',
    })
  }
}

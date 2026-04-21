import Admin from '../models/Admin.js'

// Find or create admin user
export const findOrCreateAdmin = async ({ email, displayName, photoURL, role = 'delivery_partner' }) => {
  let admin = await Admin.findOne({ email })

  if (admin) {
    // Update profile if provided
    if (displayName) admin.displayName = displayName
    if (photoURL) admin.photoURL = photoURL
    await admin.save()
    return admin
  }

  // Create new admin
  admin = await Admin.create({
    email,
    displayName,
    photoURL,
    role,
    status: 'active',
  })

  return admin
}

// Get admin by email
export const getAdminByEmail = async (email) => {
  return await Admin.findOne({ email })
}

// Get admin profile
export const getAdminProfile = async (email) => {
  const admin = await Admin.findOne({ email })
  if (!admin) {
    throw new Error('Admin not found')
  }
  return admin
}

// Update admin profile
export const updateAdminProfile = async (email, updates) => {
  const admin = await Admin.findOneAndUpdate(
    { email },
    { $set: updates },
    { returnDocument: 'after', runValidators: true }
  )
  if (!admin) {
    throw new Error('Admin not found')
  }
  return admin
}

// Check if admin is active
export const isAdminActive = async (email) => {
  const admin = await Admin.findOne({ email })
  return admin && admin.status === 'active'
}

// Add delivery partner
export const addDeliveryPartner = async (email) => {
  const existing = await Admin.findOne({ email })
  if (existing) {
    throw new Error('Email already registered')
  }

  const deliveryPartner = await Admin.create({
    email,
    role: 'delivery_partner',
    status: 'active',
  })

  return deliveryPartner
}

// Get all delivery partners
export const getAllDeliveryPartners = async () => {
  return await Admin.find({ role: 'delivery_partner' })
}

// Remove delivery partner
export const removeDeliveryPartner = async (email) => {
  const result = await Admin.findOneAndDelete({ email, role: 'delivery_partner' })
  if (!result) {
    throw new Error('Delivery partner not found')
  }
  return result
}

// Add new admin
export const addNewAdmin = async (email) => {
  const existing = await Admin.findOne({ email })
  if (existing) {
    throw new Error('Email already registered')
  }

  const admin = await Admin.create({
    email,
    role: 'admin',
    status: 'active',
  })

  return admin
}

// Get all admins
export const getAllAdmins = async () => {
  return await Admin.find({ role: 'admin' })
}

// Update admin status
export const updateAdminStatus = async (email, status) => {
  const admin = await Admin.findOneAndUpdate(
    { email },
    { $set: { status } },
    { returnDocument: 'after', runValidators: true }
  )
  if (!admin) {
    throw new Error('Admin not found')
  }
  return admin
}

// Add support team member
export const addSupportTeamMember = async (email) => {
  const existing = await Admin.findOne({ email })
  if (existing) {
    throw new Error('Email already registered')
  }

  const supportMember = await Admin.create({
    email,
    role: 'support_team',
    status: 'active',
  })

  return supportMember
}

// Get all support team members
export const getAllSupportTeam = async () => {
  return await Admin.find({ role: 'support_team' })
}

// Remove support team member
export const removeSupportTeamMember = async (email) => {
  const result = await Admin.findOneAndDelete({ email, role: 'support_team' })
  if (!result) {
    throw new Error('Support team member not found')
  }
  return result
}

// Update admin role
export const updateAdminRole = async (email, role) => {
  const admin = await Admin.findOneAndUpdate(
    { email },
    { $set: { role } },
    { returnDocument: 'after', runValidators: true }
  )
  if (!admin) {
    throw new Error('Admin not found')
  }
  return admin
}

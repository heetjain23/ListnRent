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
    { new: true, runValidators: true }
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

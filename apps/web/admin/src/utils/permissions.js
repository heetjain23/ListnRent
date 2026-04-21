/**
 * Role-based access control configuration
 * Defines which roles can access which pages/features
 */

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DELIVERY_PARTNER: 'delivery_partner',
  SUPPORT_TEAM: 'support_team',
}

// Menu items available to each role
const ROLE_MENU_ACCESS = {
  super_admin: [
    { icon: '📊', label: 'Dashboard', path: '/admin' },
    { icon: '👥', label: 'Team Management', path: '/admin/team' },
    { icon: '🏪', label: 'Marketplace', path: '/admin/marketplace' },
    { icon: '⚠️', label: 'Disputes', path: '/admin/disputes' },
    { icon: '💰', label: 'Finance', path: '/admin/finance' },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
    { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
  ],
  admin: [
    { icon: '📊', label: 'Dashboard', path: '/admin' },
    { icon: '🏪', label: 'Marketplace', path: '/admin/marketplace' },
    { icon: '⚠️', label: 'Disputes', path: '/admin/disputes' },
    { icon: '💰', label: 'Finance', path: '/admin/finance' },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
    // No Team Management (can't create new admin)
    // No Settings
  ],
  delivery_partner: [],
  support_team: [],
}

// Page-level permissions
const PAGE_PERMISSIONS = {
  '/dashboard': {
    allowed: ['super_admin', 'admin'],
    restricted: ['delivery_partner', 'support_team'],
  },
  '/team': {
    allowed: ['super_admin'],
    restricted: ['admin', 'delivery_partner', 'support_team'],
  },
  '/marketplace': {
    allowed: ['super_admin', 'admin'],
    restricted: ['delivery_partner', 'support_team'],
  },
  '/disputes': {
    allowed: ['super_admin', 'admin'],
    restricted: ['delivery_partner', 'support_team'],
  },
  '/finance': {
    allowed: ['super_admin', 'admin'],
    restricted: ['delivery_partner', 'support_team'],
  },
  '/analytics': {
    allowed: ['super_admin', 'admin'],
    restricted: ['delivery_partner', 'support_team'],
  },
  '/settings': {
    allowed: ['super_admin'],
    restricted: ['admin', 'delivery_partner', 'support_team'],
  },
}

/**
 * Check if a role can access a specific page
 */
export const canAccessPage = (role, path) => {
  const permission = PAGE_PERMISSIONS[path]
  if (!permission) return true // Allow access if no specific permission defined

  return permission.allowed.includes(role)
}

/**
 * Get menu items available for a role
 */
export const getMenuItemsForRole = (role) => {
  return ROLE_MENU_ACCESS[role] || []
}

/**
 * Check if a role is restricted from using admin features
 */
export const isRestrictedRole = (role) => {
  return ['delivery_partner', 'support_team'].includes(role)
}

/**
 * Check if a role is super admin
 */
export const isSuperAdmin = (role) => {
  return role === ROLES.SUPER_ADMIN
}

/**
 * Check if a role is regular admin
 */
export const isAdmin = (role) => {
  return role === ROLES.ADMIN
}

/**
 * Get the appropriate dashboard page for a role
 */
export const getDashboardForRole = (role) => {
  if (['delivery_partner', 'support_team'].includes(role)) {
    return `/developing/${role}`
  }
  return '/admin'
}

export { ROLES }

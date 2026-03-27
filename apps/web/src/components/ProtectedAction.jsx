import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const ProtectedAction = ({ children, onConfirm, actionName = 'action' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const handleClick = (e) => {
    // Check if user is not authenticated
    if (!isAuthenticated) {
      e.preventDefault()
      e.stopPropagation()

      // Redirect to login
      navigate('/login', {
        state: {
          from: location.pathname,
          intent: actionName,
        },
      })
      return
    }

    // If authenticated, execute the callback
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm()
    }
  }

  // Clone the child button and add click handler
  return React.cloneElement(children, {
    onClick: handleClick,
  })
}

export default ProtectedAction

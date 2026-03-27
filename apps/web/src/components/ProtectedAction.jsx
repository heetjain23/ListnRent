import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const ProtectedAction = ({ children, onConfirm, actionName = 'action' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const handleClick = (e) => {
    // Check if it's a button click and user is not authenticated
    if (!isAuthenticated) {
      e.preventDefault()
      e.stopPropagation()

      // Save the current location to redirect back after login
      navigate('/login', {
        state: {
          from: location,
          intent: actionName,
        },
      })
      return
    }

    // If authenticated, execute the action
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

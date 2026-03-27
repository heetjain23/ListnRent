import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

const QuickActionsSection = ({ onLogout }) => {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Button
        onClick={() => navigate('/#listings')}
        variant="secondary"
        size="lg"
        className="w-full justify-center"
      >
        ← Browse Collection
      </Button>

      <Button
        onClick={() => navigate('/create')}
        variant="accent"
        size="lg"
        className="w-full justify-center"
      >
        + List New Outfit
      </Button>

      <Button
        onClick={onLogout}
        variant="ghost"
        size="lg"
        className="w-full justify-center"
      >
        🚪 Sign Out
      </Button>
    </div>
  )
}

export default QuickActionsSection

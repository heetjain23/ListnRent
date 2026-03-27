import React from 'react'
import Button from '../ui/Button'

const EmailAuthSection = ({ email, onEmailChange, onSendMagicLink, isLoading, loadingAction }) => {
  return (
    <form onSubmit={onSendMagicLink} className="space-y-3">
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wide">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg text-sm text-[#1A1A1A]
            placeholder:text-[#BBB] focus:outline-none focus:border-[#C8622A] transition-colors"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || loadingAction || !email.trim()}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Sending...' : '📧 Send Magic Link'}
      </Button>
    </form>
  )
}

export default EmailAuthSection

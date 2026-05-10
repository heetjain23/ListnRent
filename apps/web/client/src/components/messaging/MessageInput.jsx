import React, { useRef, useEffect, useState, useCallback } from 'react'

const MessageInput = ({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const textareaRef = useRef(null)
  const valueRef    = useRef('')
  const [value, setValue] = useState('')

  useEffect(() => { valueRef.current = value }, [value])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [value])

  const handleSend = useCallback(() => {
    if (!valueRef.current.trim() || disabled) return
    onStopTyping?.()
    onSend(valueRef.current.trim())
    setValue('')
  }, [disabled, onSend, onStopTyping])

  const handleChange = (e) => {
    setValue(e.target.value)
    if (e.target.value.trim()) {
      onTyping?.()
    } else {
      onStopTyping?.()
    }
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const handleBlur = () => onStopTyping?.()

  return (
    <div
      className="flex items-end gap-2.5 px-4 py-3"
      style={{
        background: '#F5F2EA',
        borderTop: '1px solid rgba(0,52,43,0.09)',
      }}
    >
      {/* Attachment */}
      <button
        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-black/6"
        style={{ color: '#7D9A8A' }}
        title="Attach"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Input field */}
      <div
        className="flex-1 flex items-center rounded-2xl px-4 py-2.5"
        style={{
          background: '#FDFCF5',
          border: '1.5px solid rgba(0,52,43,0.11)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          minHeight: 44,
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent focus:outline-none disabled:opacity-50 leading-relaxed"
          style={{
            color: '#1A1A14',
            fontSize: 13.5,
            maxHeight: 120,
            overflow: 'hidden',
            scrollbarWidth: 'none',
          }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #004D40, #00342B)',
          boxShadow: value.trim() ? '0 4px 14px rgba(0,52,43,0.28)' : 'none',
        }}
      >
        {disabled ? (
          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346707 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99721578 L3.03521743,10.4382088 C3.03521743,10.5953061 3.34915502,10.7524035 3.50612381,10.7524035 L16.6915026,11.5378905 C16.6915026,11.5378905 17.1624089,11.5378905 17.1624089,12.0091827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default React.memo(MessageInput)
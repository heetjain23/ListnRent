import React, { useEffect, useRef, useMemo } from 'react'
import { motion } from 'motion/react'

/**
 * Get date grouping key for a message
 */
const getDateKey = (date) => {
  const now = new Date()
  const msgDate = new Date(date)
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate())
  
  if (msgDay.getTime() === today.getTime()) {
    return 'TODAY'
  } else if (msgDay.getTime() === yesterday.getTime()) {
    return 'YESTERDAY'
  } else {
    return msgDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()
  }
}

/**
 * DateDivider - Shows date separator between message groups
 */
const DateDivider = ({ date }) => {
  const dateKey = getDateKey(date)
  const monthDay = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()
  
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1" style={{ borderTopColor: '#E8E4D4', borderTopWidth: '1px' }} />
      <p className="text-xs font-semibold" style={{ color: '#9E9E7A' }}>
        {dateKey}, {monthDay}
      </p>
      <div className="flex-1" style={{ borderTopColor: '#E8E4D4', borderTopWidth: '1px' }} />
    </div>
  )
}

/**
 * Message - Individual message bubble
 */
const Message = ({ message, isOwn, senderName, senderPhoto }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && senderPhoto && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{
            background: 'linear-gradient(135deg, #004D40, #00342B)',
          }}
        >
          {senderName?.[0]?.toUpperCase() || 'U'}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs`}>
        <div
          className="p-3 rounded-lg wrap-break-word"
          style={{
            backgroundColor: isOwn ? '#004D40' : '#FDFCF0',
            color: isOwn ? '#FDFCF0' : '#1A1A14',
            border: isOwn ? 'none' : '1px solid #E8E4D4',
          }}
        >
          <p className="text-sm">{message.text}</p>
        </div>
        <p className="text-xs mt-1" style={{ color: '#9E9E7A' }}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  )
}

/**
 * MessageThread - Displays all messages in a conversation with date grouping
 */
export const MessageThread = ({ messages, currentUserId, loading = false }) => {
  const endRef = useRef(null)
  const previousMessageCountRef = useRef(0)

  // Group messages by date
  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return []
    
    const groups = []
    let currentDateKey = null
    let currentGroup = []
    
    messages.forEach((message) => {
      const dateKey = getDateKey(message.createdAt)
      
      if (dateKey !== currentDateKey) {
        if (currentGroup.length > 0) {
          groups.push({ dateKey: currentDateKey, messages: currentGroup })
        }
        currentDateKey = dateKey
        currentGroup = [message]
      } else {
        currentGroup.push(message)
      }
    })
    
    // Push last group
    if (currentGroup.length > 0) {
      groups.push({ dateKey: currentDateKey, messages: currentGroup })
    }
    
    return groups
  }, [messages])

  // Auto-scroll to bottom only when NEW messages arrive, not on initial load
  useEffect(() => {
    // Only scroll if messages increased (new message added), not on initial load
    if (messages.length > previousMessageCountRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    previousMessageCountRef.current = messages.length
  }, [messages])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: '#9E9E7A' }}>Loading messages...</p>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: '#9E9E7A' }}>No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#FAFAF8' }}>
      {groupedMessages.map((group, groupIdx) => (
        <div key={groupIdx}>
          <DateDivider date={group.messages[0].createdAt} />
          {group.messages.map((message, idx) => {
            const isOwn = message.senderId === currentUserId
            return (
              <Message
                key={message._id || `${groupIdx}-${idx}`}
                message={message}
                isOwn={isOwn}
                senderName={message.senderName}
                senderPhoto={message.senderPhotoURL}
              />
            )
          })}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}

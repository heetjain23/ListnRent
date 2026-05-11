import React, { useEffect, useRef, useMemo } from 'react'
import { motion } from 'motion/react'

const getDateKey = (date) => {
  const now = new Date()
  const msgDate = new Date(date)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate())

  if (msgDay.getTime() === today.getTime()) return 'Today'
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday'
  return msgDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const DateDivider = ({ date }) => (
  <div className="flex items-center gap-3 my-5 px-5">
    <div className="flex-1 h-px" style={{ background: 'rgba(0,52,43,0.10)' }} />
    <span
      className="px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(0,52,43,0.07)',
        color: '#7D9A8A',
        letterSpacing: '0.03em',
        fontSize: 11,
      }}
    >
      {getDateKey(date)}
    </span>
    <div className="flex-1 h-px" style={{ background: 'rgba(0,52,43,0.10)' }} />
  </div>
)

const MessageBubble = ({ message, isOwn, senderName, senderPhoto }) => {
  const timeStr = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isOwn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-end px-5 mb-2"
      >
        <div className="flex flex-col items-end max-w-[72%]">
          <div
            className="px-4 py-2.5 rounded-2xl rounded-tr-sm"
            style={{
              background: 'linear-gradient(135deg, #004D40 0%, #00342B 100%)',
              boxShadow: '0 2px 12px rgba(0,52,43,0.18)',
            }}
          >
            <p style={{ color: '#E8F5F2', fontSize: 13.5, lineHeight: 1.5, wordBreak: 'break-word' }}>
              {message.text}
            </p>
          </div>
          <span style={{ fontSize: 10.5, color: '#9E9E7A', marginTop: 3 }}>{timeStr}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-end gap-2.5 px-5 mb-2"
    >
      {/* Avatar */}
      {senderPhoto ? (
        <img src={senderPhoto} alt={senderName} className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ background: 'linear-gradient(135deg, #004D40, #00342B)' }}
        >
          {(senderName || 'U').charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex flex-col items-start max-w-[72%]">
        <div
          className="px-4 py-2.5 rounded-2xl rounded-tl-sm"
          style={{
            background: '#FDFCF5',
            border: '1px solid rgba(0,52,43,0.10)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <p style={{ color: '#1A1A14', fontSize: 13.5, lineHeight: 1.5, wordBreak: 'break-word' }}>
            {message.text}
          </p>
        </div>
        <span style={{ fontSize: 10.5, color: '#9E9E7A', marginTop: 3 }}>{timeStr}</span>
      </div>
    </motion.div>
  )
}

export const MessageThread = ({
  messages,
  currentUserId,
  loading = false,
  hasMore = false,
  loadingMore = false,
  onLoadOlder,
}) => {
  const endRef = useRef(null)
  const scrollRef = useRef(null)
  const prevCountRef = useRef(0)

  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return []
    const groups = []
    let currentDateKey = null
    let currentGroup = []

    messages.forEach((msg) => {
      const dk = getDateKey(msg.createdAt)
      if (dk !== currentDateKey) {
        if (currentGroup.length > 0) groups.push({ dateKey: currentDateKey, messages: currentGroup })
        currentDateKey = dk
        currentGroup = [msg]
      } else {
        currentGroup.push(msg)
      }
    })
    if (currentGroup.length > 0) groups.push({ dateKey: currentDateKey, messages: currentGroup })
    return groups
  }, [messages])

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevCountRef.current = messages.length
  }, [messages])

  const handleScroll = () => {
    if (!hasMore || loadingMore || !onLoadOlder) return
    const el = scrollRef.current
    if (el && el.scrollTop < 80) {
      const beforeHeight = el.scrollHeight
      onLoadOlder()?.finally?.(() => {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - beforeHeight + el.scrollTop
        })
      })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#F5F2EA' }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-[#004D40]/20 border-t-[#004D40] animate-spin" />
          <p style={{ fontSize: 12, color: '#9E9E7A' }}>Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#F5F2EA' }}>
        <p style={{ fontSize: 13, color: '#9E9E7A' }}>No messages yet. Say hello! 👋</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto py-4"
      style={{ background: '#F5F2EA' }}
    >
      {hasMore && (
        <div className="flex justify-center pb-3">
          <button
            type="button"
            onClick={() => onLoadOlder?.()}
            disabled={loadingMore}
            className="rounded-full px-3 py-1 text-xs transition-colors disabled:opacity-60"
            style={{ background: 'rgba(0,52,43,0.07)', color: '#004D40' }}
          >
            {loadingMore ? 'Loading...' : 'Older messages'}
          </button>
        </div>
      )}
      {groupedMessages.map((group, gi) => (
        <div key={gi}>
          <DateDivider date={group.messages[0].createdAt} />
          {group.messages.map((msg, mi) => {
            const isOwn = msg.senderId === currentUserId
            return (
              <MessageBubble
                key={msg._id || `${gi}-${mi}`}
                message={msg}
                isOwn={isOwn}
                senderName={msg.senderName}
                senderPhoto={msg.senderPhotoURL}
              />
            )
          })}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}

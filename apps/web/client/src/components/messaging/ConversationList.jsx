import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'

// ── Conversation Item ─────────────────────────────────────────────────────────

const ConversationItem = ({ conversation, isSelected, onClick, currentUserId, dark }) => {
  const otherUser = conversation.otherUser
  const name = otherUser?.displayName || 'Unknown'
  const initial = name.charAt(0).toUpperCase()
  const lastMsg = conversation.lastMessage || 'No messages yet'
  const isUnread = (conversation.unreadCount || 0) > 0
  const listing = conversation.context?.listing || null

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Extract listing tag if available
  const listingTag = conversation.listingTitle || listing?.listingTitle || null
  const listingImage = listing?.listingImage || conversation.listingImage || null
  const listingMeta = listing?.category || conversation.listingCategory || null

  if (dark) {
    return (
      <motion.button
        whileHover={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)' }}
        onClick={onClick}
        className="w-full px-4 py-3.5 text-left transition-colors"
        style={{
          background: isSelected ? 'rgba(255,255,255,0.09)' : 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
          <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0 mt-0.5">
            {listingImage ? (
              <img
                src={listingImage}
                alt={listingTag || 'Listing'}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : otherUser?.photoURL ? (
              <img
                src={otherUser.photoURL}
                alt={name}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #2D6A5F, #1A4A42)' }}
              >
                {initial}
              </div>
            )}
            {/* Online dot */}
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ backgroundColor: '#22C55E', borderColor: '#1C2B27' }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p
                className="truncate text-sm"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontWeight: isUnread ? 700 : 600,
                  color: isSelected ? '#F5F2EA' : '#E8E4D8',
                  fontSize: 13.5,
                }}
              >
                {name}
              </p>
              <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                {formatTime(conversation.lastMessageAt)}
              </span>
            </div>

            {/* Last message */}
            <p
              className="truncate"
              style={{
                fontSize: 12,
                color: isUnread ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.38)',
                fontWeight: isUnread ? 500 : 400,
                marginBottom: listingTag ? 6 : 0,
              }}
            >
              {isUnread && (
                <span style={{ color: '#D4AF37', marginRight: 4, fontSize: 8 }}>●</span>
              )}
              {lastMsg}
            </p>

            {/* Listing tag */}
            {listingTag && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  background: 'rgba(212,175,55,0.15)',
                  color: '#D4AF37',
                  border: '1px solid rgba(212,175,55,0.25)',
                  letterSpacing: '0.02em',
                }}
              >
                <span style={{ fontSize: 8 }}>●</span>
                {listingTag}
              </span>
            )}
            {listingMeta && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)', marginTop: 4 }}>
                {listingMeta}
              </div>
            )}
          </div>
        </div>
      </motion.button>
    )
  }

  // Light variant (mobile)
  return (
    <motion.button
      whileHover={{ backgroundColor: '#F0EDE5' }}
      onClick={onClick}
      className="w-full px-4 py-3.5 text-left transition-colors"
      style={{
        background: isSelected ? '#EBE7DC' : 'transparent',
        borderBottom: '1px solid rgba(0,52,43,0.07)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0 mt-0.5">
          {listingImage ? (
            <img src={listingImage} alt={listingTag || 'Listing'} className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #004D40, #00342B)' }}
            >
              {initial}
            </div>
          )}
          <div
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
            style={{ backgroundColor: '#22C55E', borderColor: '#F5F2EA' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 13.5, color: '#1A1A14' }} className="truncate">
              {name}
            </p>
            <span style={{ fontSize: 10.5, color: '#9E9E7A', flexShrink: 0 }}>
              {formatTime(conversation.lastMessageAt)}
            </span>
          </div>
          <p className="truncate" style={{ fontSize: 12, color: '#7D7D6A', fontWeight: isUnread ? 500 : 400 }}>
            {lastMsg}
          </p>
          {listingTag && (
            <span
              className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full"
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: 'rgba(0,77,64,0.08)',
                color: '#004D40',
                border: '1px solid rgba(0,77,64,0.15)',
              }}
            >
              <span style={{ fontSize: 8 }}>●</span>
              {listingTag}
            </span>
          )}
          {listingMeta && (
            <div style={{ fontSize: 10, color: '#9E9E7A', marginTop: 4 }}>
              {listingMeta}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// ── Conversation List ─────────────────────────────────────────────────────────

export const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  loading = false,
  dark = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = useMemo(() => {
    if (!conversations || !searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(
      (c) =>
        c.otherUser?.displayName?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
    )
  }, [conversations, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#9E9E7A', fontSize: 13 }}>
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search */}
      <div className="px-4 py-3" style={{ borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,52,43,0.07)' }}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#9E9E7A' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs focus:outline-none"
            style={{
              background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,52,43,0.06)',
              border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,52,43,0.1)',
              color: dark ? 'rgba(255,255,255,0.75)' : '#1A1A14',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        {!filteredConversations || filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#9E9E7A', fontSize: 13 }}>
              {searchQuery ? 'No results' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation._id}
              onClick={() => onSelectConversation(conversation)}
              currentUserId={currentUserId}
              dark={dark}
            />
          ))
        )}
      </div>
    </div>
  )
}
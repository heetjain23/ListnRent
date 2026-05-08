import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'

/**
 * ConversationItem - Single conversation in list
 */
const ConversationItem = ({ conversation, isSelected, onClick, currentUserId }) => {
  // Get the other user - backend returns 'otherUser' in enriched data
  const otherUser = conversation.otherUser

  const lastMessagePreview = conversation.lastMessage || 'No messages yet'
  const lastMessageTime = conversation.lastMessageAt
    ? new Date(conversation.lastMessageAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
    : null

  const isUnread = (conversation.unreadCount || 0) > 0

  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`w-full p-4 border-b text-left transition-colors hover:bg-opacity-50 ${
        isSelected ? 'bg-opacity-20' : ''
      }`}
      style={{
        borderColor: '#E8E4D4',
        backgroundColor: isSelected ? '#F5F5F0' : 'transparent',
        color: isSelected ? '#1A1A14' : '#1A1A14',
      }}
    >
      <div className="flex gap-3 items-start">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, #004D40, #00342B)',
          }}
        >
          {otherUser?.displayName?.[0]?.toUpperCase() || 'U'}
          {/* Online indicator */}
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: '#4CAF50' }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className={`font-semibold truncate ${isUnread ? 'font-bold' : ''}`}>
              {otherUser?.displayName || 'Unknown User'}
            </p>
            {lastMessageTime && (
              <p className="text-xs shrink-0" style={{ color: '#9E9E7A' }}>
                {lastMessageTime}
              </p>
            )}
          </div>
          <p
            className={`text-sm truncate ${isUnread ? 'font-semibold' : ''}`}
            style={{
              color: '#9E9E7A',
            }}
          >
            {isUnread && <span className="text-[#004D40] mr-1">●</span>}
            {lastMessagePreview}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

/**
 * ConversationList - Lists all conversations with search
 */
export const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = useMemo(() => {
    if (!conversations || !searchQuery.trim()) return conversations
    
    const query = searchQuery.toLowerCase()
    return conversations.filter(
      (conv) =>
        conv.otherUser?.displayName?.toLowerCase().includes(query) ||
        conv.lastMessage?.toLowerCase().includes(query)
    )
  }, [conversations, searchQuery])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center flex-1">
          <p style={{ color: '#9E9E7A' }}>Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search bar */}
      <div className="p-4 border-b" style={{ borderColor: '#E8E4D4' }}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: '#E8E4D4',
              backgroundColor: '#FAFAF8',
              color: '#1A1A14',
              focusRingColor: '#004D40',
            }}
          />
          <svg
            className="absolute right-3 top-2.5 w-4 h-4"
            style={{ color: '#9E9E7A' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!filteredConversations || filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: '#9E9E7A' }}>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
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
            />
          ))
        )}
      </div>
    </div>
  )
}

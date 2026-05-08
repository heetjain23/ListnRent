import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../../hooks/useAuth'
import { useMessaging } from '../../context/MessagingContext'
import {
  useConversation,
  useConversations,
  useSendMessage,
} from '../../hooks/useMessaging'
import { playNotificationSound } from '../../utils/notificationSound'
import { MessageThread } from './MessageThread'
import MessageInput from './MessageInput'
import { ConversationList } from './ConversationList'

/**
 * ChatWindow - Full chat interface with conversations list and message thread
 */
export const ChatWindow = ({ isMobile = false }) => {
  const { user } = useAuth()
  const { setActiveConversationId } = useMessaging()
  const { conversations, loading: conversationsLoading, fetchConversations } =
    useConversations()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const { messages, loading: messagesLoading, fetchMessages, addMessage } = useConversation(
    selectedConversation?._id
  )
  const { sendMessage, loading: sendingMessage } = useSendMessage()
  const [showConversationList, setShowConversationList] = useState(!isMobile)

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation?._id) {
      setActiveConversationId(selectedConversation._id)
      fetchMessages()
    }
  }, [selectedConversation?._id, setActiveConversationId, fetchMessages])

  // Poll for new messages by refetching them silently
  useEffect(() => {
    if (!selectedConversation?._id) return

    // Refetch messages on interval silently (no loading state shown)
    const pollingInterval = setInterval(() => {
      fetchMessages(50, 0, true) // true = silent mode (no loading state, no error toast)
    }, 3000)

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [selectedConversation?._id, fetchMessages])

  // Poll for conversation list updates
  useEffect(() => {
    const pollConversations = async () => {
      try {
        await fetchConversations()
      } catch (err) {
        // Silently fail on polling errors
      }
    }

    // Poll conversations every 5 seconds
    const conversationPollingInterval = setInterval(pollConversations, 5000)

    return () => {
      if (conversationPollingInterval) {
        clearInterval(conversationPollingInterval)
      }
    }
  }, [fetchConversations])

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    if (isMobile) {
      setShowConversationList(false)
    }
  }

  const handleBackToList = () => {
    setShowConversationList(true)
    setSelectedConversation(null)
  }

  const handleSendMessage = async (text) => {
    if (!selectedConversation || !text.trim()) return

    try {
      const response = await sendMessage(
        selectedConversation.listingId,
        selectedConversation.participantIds.find((id) => id !== user?.uid),
        text
      )

      // Add message optimistically
      addMessage({
        _id: response.message._id,
        conversationId: response.conversationId,
        senderId: user?.uid,
        senderName: user?.displayName,
        senderPhotoURL: user?.photoURL,
        text: text.trim(),
        type: 'text',
        createdAt: new Date().toISOString(),
        readAt: null,
      })
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  if (isMobile) {
    // Mobile view - show either list or conversation, not both
    if (showConversationList) {
      return (
        <div className="w-full h-full flex flex-col bg-white">
          <div className="p-4 border-b" style={{ borderColor: '#E8E4D4' }}>
            <h2 className="text-lg font-bold" style={{ color: '#1A1A14' }}>
              Messages
            </h2>
          </div>
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?._id}
            onSelectConversation={handleSelectConversation}
            currentUserId={user?.uid}
            loading={conversationsLoading}
          />
        </div>
      )
    } else {
      return (
        <div className="w-full h-full flex flex-col bg-white">
          {/* Header with back button */}
          <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: '#E8E4D4' }}>
            <button
              onClick={handleBackToList}
              className="p-2 rounded-lg hover:bg-opacity-10"
              style={{ backgroundColor: '#004D40', color: '#004D40' }}
            >
              ←
            </button>
            <div>
              <p className="font-semibold" style={{ color: '#1A1A14' }}>
                {selectedConversation?.otherUser?.displayName || 'User'}
              </p>
            </div>
          </div>

          <MessageThread
            messages={messages}
            currentUserId={user?.uid}
            loading={messagesLoading}
          />
          <MessageInput onSend={handleSendMessage} disabled={sendingMessage} />
        </div>
      )
    }
  }

  // Desktop view - show both list and conversation
  return (
    <div className="w-full h-full flex bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E4D4' }}>
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col min-h-0" style={{ borderColor: '#E8E4D4' }}>
        <div className="p-4 border-b" style={{ borderColor: '#E8E4D4' }}>
          <h2 className="text-lg font-bold" style={{ color: '#1A1A14' }}>
            Messages
          </h2>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?._id}
          onSelectConversation={handleSelectConversation}
          currentUserId={user?.uid}
          loading={conversationsLoading}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#E8E4D4' }}>
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm relative"
                  style={{
                    background: 'linear-gradient(135deg, #004D40, #00342B)',
                  }}
                >
                  {selectedConversation?.otherUser?.displayName?.[0]?.toUpperCase() || 'U'}
                  {/* Online indicator */}
                  <div
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: '#4CAF50' }}
                  />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#1A1A14' }}>
                    {selectedConversation?.otherUser?.displayName || 'User'}
                  </p>
                  <p className="text-xs" style={{ color: '#9E9E7A' }}>
                    Active now
                  </p>
                </div>
              </div>

              {/* Action icons */}
              <div className="flex gap-3">
                <button
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  style={{ color: '#004D40' }}
                  title="Call"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  style={{ color: '#004D40' }}
                  title="Info"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <MessageThread
              messages={messages}
              currentUserId={user?.uid}
              loading={messagesLoading}
            />
            <MessageInput onSend={handleSendMessage} disabled={sendingMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4" style={{ backgroundColor: '#FAFAF8' }}>
            <svg className="w-16 h-16" style={{ color: '#E8E4D4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p style={{ color: '#9E9E7A' }}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}

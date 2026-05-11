import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../../hooks/useAuth'
import { useMessaging } from '../../context/MessagingContext'
import {
  useConversation,
  useConversations,
  useSendMessage,
} from '../../hooks/useMessaging'
import {
  useRealtimeMessages,
  useRealtimeConversations,
  useTypingSender,
  useMessageSeenSender,
  useOnlinePresence,
} from '../../hooks/useRealtimeMessages'
import { MessageThread } from './MessageThread'
import MessageInput from './MessageInput'
import { ConversationList } from './ConversationList'
import { useSocketContext } from '../../context/SocketContext'

// ── Typing Indicator ──────────────────────────────────────────────────────────

const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers?.length) return null
  return (
    <div className="flex items-center gap-2 px-5 pb-2">
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#7D9A8A' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: '#7D9A8A' }}>
        {typingUsers[0]?.displayName || 'Someone'} is typing…
      </span>
    </div>
  )
}

// ── Conversation Header ───────────────────────────────────────────────────────

const ConversationHeader = ({ conversation, onBack, showBack }) => {
  const name     = conversation?.otherUser?.displayName || 'User'
  const initial  = name.charAt(0).toUpperCase()
  const otherUid = conversation?.otherUser?.uid
  const { isOnline } = useOnlinePresence(otherUid)

  return (
    <div
      className="flex items-center justify-between px-5 py-3.5 shrink-0"
      style={{ background: '#F5F2EA', borderBottom: '1px solid rgba(0,52,43,0.09)', minHeight: 64 }}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="mr-1 flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-black/5"
            style={{ color: '#004D40' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #004D40, #00342B)' }}
          >
            {initial}
          </div>
          <div
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 transition-colors duration-500"
            style={{ backgroundColor: isOnline ? '#22C55E' : '#9CA3AF', borderColor: '#F5F2EA' }}
          />
        </div>
        <div>
          <p style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 15, color: '#1A1A14', lineHeight: 1.2 }}>
            {name}
          </p>
          <p style={{ fontSize: 11, color: isOnline ? '#22C55E' : '#9E9E7A', fontWeight: 500, marginTop: 1 }}>
            {isOnline ? 'Active now' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <HeaderIconBtn title="Call">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.975-1.955a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </HeaderIconBtn>
        <HeaderIconBtn title="Info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="3" strokeLinecap="round" />
            <line x1="12" y1="12" x2="12" y2="16" />
          </svg>
        </HeaderIconBtn>
      </div>
    </div>
  )
}

const HeaderIconBtn = ({ children, title }) => (
  <button
    title={title}
    className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-black/6"
    style={{ color: '#004D40' }}
  >
    {children}
  </button>
)

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8" style={{ background: '#F5F2EA' }}>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,77,64,0.08)' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#004D40" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 600, color: '#1A1A14' }}>
      Select a conversation
    </p>
    <p style={{ fontSize: 13, color: '#9E9E7A', textAlign: 'center', maxWidth: 200 }}>
      Choose a conversation from the left to start messaging
    </p>
  </div>
)

// ── Chat Panel ────────────────────────────────────────────────────────────────

const ChatPanel = ({ conversation, userId, onBack, showBack }) => {
  const convId = conversation?._id?.toString?.() ?? conversation?._id

  const {
    messages,
    loading: messagesLoading,
    loadingMore,
    hasMore,
    fetchMessages,
    addMessage,
    replaceMessage,
    updateMessage,
  } =
    useConversation(convId)
  const {
    sendMessage,
    loading: sendingMessage,
    connected: realtimeConnected,
  } = useSendMessage()
  const { connectionStatus, connectionError } = useSocketContext()
  const { markConversationAsRead, applyUnreadUpdate } = useMessaging()
  const { sendMessageSeen } = useMessageSeenSender(convId)

  const [typingUsers, setTypingUsers] = useState([])
  const typingTimersRef = useRef({})

  // Initial message load
  useEffect(() => {
    if (convId) {
      console.log('[ChatPanel] Fetching messages for', convId)
      fetchMessages().then(() => {
        markConversationAsRead(convId)
        sendMessageSeen()
      })
    }
  }, [convId, fetchMessages, markConversationAsRead, sendMessageSeen])

  // ── Realtime handlers ───────────────────────────────────────────────────
  const handleNewMessage = useCallback((message) => {
    console.log('[ChatPanel] Realtime message received:', message?._id)
    addMessage(message)
    if (message?.senderId !== userId) {
      markConversationAsRead(convId)
      sendMessageSeen()
    }
  }, [addMessage, convId, markConversationAsRead, sendMessageSeen, userId])

  const handleTypingStart = useCallback(({ uid, displayName }) => {
    if (uid === userId) return
    setTypingUsers((prev) => prev.some((u) => u.uid === uid) ? prev : [...prev, { uid, displayName }])
    if (typingTimersRef.current[uid]) clearTimeout(typingTimersRef.current[uid])
    typingTimersRef.current[uid] = setTimeout(() => {
      setTypingUsers((prev) => prev.filter((u) => u.uid !== uid))
    }, 4000)
  }, [userId])

  const handleTypingStop = useCallback(({ uid }) => {
    if (typingTimersRef.current[uid]) clearTimeout(typingTimersRef.current[uid])
    setTypingUsers((prev) => prev.filter((u) => u.uid !== uid))
  }, [])

  useRealtimeMessages({
    conversationId: convId,
    onNewMessage:   handleNewMessage,
    onTypingStart:  handleTypingStart,
    onTypingStop:   handleTypingStop,
    onUnreadUpdate: applyUnreadUpdate,
  })

  const { sendTyping, sendStopTyping } = useTypingSender(convId)

  // ── Send ────────────────────────────────────────────────────────────────
  const handleSendMessage = async (text) => {
    if (!convId || !text.trim()) return
    sendStopTyping()
    const trimmed = text.trim()
    const clientRequestId =
      window.crypto?.randomUUID?.() || `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const tempId = `temp-${clientRequestId}`
    addMessage({
      _id: tempId,
      conversationId: convId,
      senderId: userId,
      text: trimmed,
      type: 'text',
      clientRequestId,
      status: 'sending',
      createdAt: new Date().toISOString(),
      readBy: [{ userId, readAt: new Date().toISOString() }],
    })
    try {
      const response = await sendMessage(convId, trimmed, clientRequestId)
      replaceMessage(tempId, { ...response.message, status: 'sent' })
    } catch (err) {
      console.error('Failed to send message:', err)
      updateMessage(tempId, { status: 'failed' })
    }
  }

  return (
    <>
      <ConversationHeader conversation={conversation} onBack={onBack} showBack={showBack} />
      <MessageThread
        messages={messages}
        currentUserId={userId}
        loading={messagesLoading}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadOlder={() => fetchMessages(50, messages.length)}
      />
      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput
        onSend={handleSendMessage}
        onTyping={sendTyping}
        onStopTyping={sendStopTyping}
        disabled={sendingMessage || !realtimeConnected}
        sending={sendingMessage}
        placeholder={
          realtimeConnected
            ? 'Type a message...'
            : connectionStatus === 'error'
              ? (connectionError || 'Realtime unavailable')
              : 'Connecting...'
        }
      />
    </>
  )
}

// ── Main ChatWindow ───────────────────────────────────────────────────────────

export const ChatWindow = ({ isMobile = false }) => {
  const { user } = useAuth()
  const { setActiveConversationId } = useMessaging()
  const {
    conversations,
    loading: conversationsLoading,
    fetchConversations,
    addOrUpdateConversation,
  } = useConversations()

  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showConversationList, setShowConversationList] = useState(!isMobile)

  // One-time initial load
  useEffect(() => { fetchConversations() }, [fetchConversations])

  // Realtime sidebar updates
  useRealtimeConversations({
    onConversationUpdate: useCallback((update) => {
      // Normalize: server sends `conversationId`, addOrUpdateConversation needs `_id`
      addOrUpdateConversation({
        ...update,
        _id: update.conversationId ?? update._id,
      })
    }, [addOrUpdateConversation]),
  })

  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation)
    setActiveConversationId(conversation._id?.toString?.() ?? conversation._id)
    if (isMobile) setShowConversationList(false)
  }, [isMobile, setActiveConversationId])

  const handleBackToList = useCallback(() => {
    setShowConversationList(true)
    setSelectedConversation(null)
    setActiveConversationId(null)
  }, [setActiveConversationId])

  // ── Mobile ───────────────────────────────────────────────────────────────
  if (isMobile) {
    if (showConversationList) {
      return (
        <div className="w-full h-full flex flex-col" style={{ background: '#F5F2EA' }}>
          <div className="px-5 pt-5 pb-4">
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#1A1A14' }}>
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
    }
    return (
      <div className="w-full h-full flex flex-col" style={{ background: '#F5F2EA' }}>
        {selectedConversation && (
          <ChatPanel
            conversation={selectedConversation}
            userId={user?.uid}
            onBack={handleBackToList}
            showBack
          />
        )}
      </div>
    )
  }

  // ── Desktop ──────────────────────────────────────────────────────────────
  return (
    <div
      className="w-full flex rounded-2xl overflow-hidden"
      style={{
        height: 'calc(100vh - 200px)',
        minHeight: 520,
        border: '1.5px solid rgba(212,175,55,0.18)',
        boxShadow: '0 8px 40px rgba(0,52,43,0.10)',
        background: '#F5F2EA',
      }}
    >
      {/* Sidebar */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: 300,
          borderRight: '1px solid rgba(212,175,55,0.15)',
          background: 'linear-gradient(180deg, #1C2B27 0%, #162421 100%)',
        }}
      >
        <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#F5F2EA', letterSpacing: '-0.01em' }}>
            Messages
          </h2>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?._id}
          onSelectConversation={handleSelectConversation}
          currentUserId={user?.uid}
          loading={conversationsLoading}
          dark
        />
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#F5F2EA' }}>
        <AnimatePresence mode="wait">
          {selectedConversation ? (
            <motion.div
              key={selectedConversation._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <ChatPanel conversation={selectedConversation} userId={user?.uid} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex">
              <EmptyState />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

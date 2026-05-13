import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { useGetOrCreateConversation, useSendMessage } from "../../hooks/useMessaging";
import { ChatWindow } from "./ChatWindow";

const QuickMessageDialog = ({ listingId, ownerId, ownerName, isOpen, onClose }) => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState(null);
  const [initialConversation, setInitialConversation] = useState(null);
  const { getOrCreate, loading: creatingConversation } =
    useGetOrCreateConversation();
  const { send: sendMessage } = useSendMessage();

  // Get or create conversation when dialog opens
  useEffect(() => {
    if (!isOpen || !listingId || !ownerId || !user) return;

    const setupConversation = async () => {
      try {
        const response = await getOrCreate(listingId, ownerId);
        setConversationId(response.conversationId);
        setInitialConversation(response.conversation || null);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };

    setupConversation();
  }, [isOpen, listingId, ownerId, user, getOrCreate]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl h-150 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E8E0D5] bg-linear-to-r from-[#004D40] to-[#00342B]">
            <div>
              <h2 className="font-semibold text-white">Message {ownerName}</h2>
              <p className="text-xs text-white/70">About listing</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Chat content */}
          <div className="flex-1 min-h-0 flex flex-col">
            {creatingConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-2 border-[#004D40]/20 border-t-[#004D40] rounded-full animate-spin mb-2" />
                  <p className="text-sm text-[#999]">Loading conversation...</p>
                </div>
              </div>
            ) : conversationId ? (
              <ChatWindow initialConversationId={conversationId} initialConversation={initialConversation} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[#999]">Failed to open conversation</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickMessageDialog;

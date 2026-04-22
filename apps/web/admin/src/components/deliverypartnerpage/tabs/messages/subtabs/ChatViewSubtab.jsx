import React from 'react'
import { motion } from 'framer-motion'
import { FiPhone, FiPlusCircle } from 'react-icons/fi'
import { HiDotsVertical } from 'react-icons/hi'
import { IoLocationOutline } from 'react-icons/io5'
import { FaPaperPlane } from 'react-icons/fa'

const ChatViewSubtab = ({ conversation, message, setMessage }) => {
  return (
    <div className="grid min-h-[70vh] grid-rows-[auto_1fr_auto] bg-[#fafbee]">
      <div className="flex items-start justify-between border-b border-[#d8d6c8] px-5 py-4">
        <div>
          <h2 className="text-[25px] font-semibold leading-none text-zinc-800">{conversation?.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-[15px] text-stone-600">
            <IoLocationOutline className="text-base" />
            {conversation?.location}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-[#edf0e4] text-stone-600">
            <HiDotsVertical size={15} />
          </button>
        </div>
      </div>

      <div className="grid content-start gap-5 px-5 py-4">
        <div className="justify-self-center rounded-full bg-[#efeee3] px-3 py-1 text-[17px] text-stone-500">Today</div>

        {conversation?.messages?.map((chat, index) => (
          <motion.div
            key={`${chat.time}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[78%] ${chat.by === 'partner' ? 'ml-auto text-right' : ''}`}
          >
            <div className={`flex items-end gap-2 ${chat.by === 'partner' ? 'justify-end' : ''}`}>
              {chat.by !== 'partner' && (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e6e4d6] text-[15px] font-semibold text-zinc-700">
                  A
                </span>
              )}

              <p className={`rounded-xl px-4 py-3 text-[16px] leading-snug ${chat.by === 'partner' ? 'bg-teal-900 text-white' : 'bg-[#efeee5] text-zinc-800'}`}>
                {chat.text}
              </p>

              {chat.by === 'partner' && (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0f5860] text-[14px] font-semibold text-white">
                  DP
                </span>
              )}
            </div>
            <span className={`mt-1 inline-block text-[14px] text-stone-500 ${chat.by === 'partner' ? 'mr-10' : 'ml-10'}`}>
              {chat.time}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-[#d8d6c8] p-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl bg-[#efeee3] px-3 py-2">
          <button type="button" className="text-stone-600">
            <FiPlusCircle size={18} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            className="bg-transparent text-[20px] text-zinc-700 outline-none placeholder:text-stone-400"
          />
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-md bg-teal-900 text-white"
          >
            <FaPaperPlane size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatViewSubtab

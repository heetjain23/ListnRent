import React from 'react'
import { conversations } from '../../../mockData'
import { FiSearch } from 'react-icons/fi'

const ConversationListSubtab = ({ selectedConversationId, onSelectConversation }) => {
  return (
    <div className="bg-[#fbfaee9b] p-4">
      <h1 className="text-[36px] font-extrabold leading-none text-teal-950">Messages</h1>

      <div className="mt-4 flex items-center gap-2 border border-[#e6e3d6] bg-[#efeee3] px-3 py-2.5 text-stone-500">
        <FiSearch className="text-base" />
        <input
          type="text"
          readOnly
          placeholder="Search messages..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
        />
      </div>

      <div className="mt-3 grid gap-1">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
            className={`flex items-start justify-between gap-3 border-l-[3px] px-3 py-3 text-left transition ${
              selectedConversationId === conversation.id
                ? 'border-teal-900 bg-[#eceade]'
                : 'border-transparent hover:bg-[#eceade]'
            }`}
          >
            <div className="min-w-0">
              <h4 className="truncate text-[20px] font-semibold leading-none text-zinc-800">{conversation.name}</h4>
              <p className="mt-1 truncate text-sm text-stone-600">{conversation.subtitle}</p>
            </div>
            <span className="shrink-0 pt-0.5 text-[20px] font-semibold text-stone-500">{conversation.time}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ConversationListSubtab

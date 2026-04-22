import React from 'react'
import { conversations } from '../../mockData'
import ConversationListSubtab from './subtabs/ConversationListSubtab'
import ChatViewSubtab from './subtabs/ChatViewSubtab'

const MessagesTab = () => {
	const [selectedConversationId, setSelectedConversationId] = React.useState(conversations[0]?.id || '')
	const [message, setMessage] = React.useState('')

	const selectedConversation = conversations.find((item) => item.id === selectedConversationId)

	return (
		<div className="overflow-hidden bg-[#f6f5eb] lg:grid lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-[360px_1fr]">
			<ConversationListSubtab
				selectedConversationId={selectedConversationId}
				onSelectConversation={setSelectedConversationId}
			/>
			<ChatViewSubtab
				conversation={selectedConversation}
				message={message}
				setMessage={setMessage}
			/>
		</div>
	)
}

export default MessagesTab

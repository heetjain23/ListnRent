import React, { useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSEO } from "../hooks/useSEO";
import { ChatWindow } from "../components/messaging/ChatWindow";

const MessagesPage = () => {
  const { user } = useAuth();

  useSEO({
    title: "Messages",
    description: "Manage your conversations and messages on ListnRent",
    noIndex: true,
  });

  return (
    <div className="w-full h-[calc(100vh-120px)] bg-white rounded-lg overflow-hidden">
      {/* Chat interface */}
      <ChatWindow />
    </div>
  );
};

export default MessagesPage;

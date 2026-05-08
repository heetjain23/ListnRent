import React from "react";
import { formatDistanceToNow } from "date-fns";

const Message = ({ message, isOwn, otherUserName, otherUserPhoto }) => {
  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "";
    }
  };

  if (isOwn) {
    return (
      <div className="flex justify-end mb-3 px-4">
        <div className="max-w-xs bg-[#004D40] text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-sm wrap-break-word">{message.text}</p>
          <p className="text-xs opacity-70 mt-1">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5 mb-3 px-4">
      {otherUserPhoto ? (
        <img
          src={otherUserPhoto}
          alt={otherUserName}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#004D40]/20 flex items-center justify-center shrink-0 text-xs font-semibold text-[#004D40]">
          {(otherUserName || "U").charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 max-w-xs">
        <div className="bg-[#F0EAE0] rounded-2xl rounded-tl-sm px-4 py-2.5">
          <p className="text-sm text-[#1A1A1A] wrap-break-wordword">{message.text}</p>
          <p className="text-xs text-[#999] mt-1">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Message);

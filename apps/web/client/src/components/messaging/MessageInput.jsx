import React, { useRef, useEffect, useState, useCallback } from "react";

const MessageInput = ({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}) => {
  const textareaRef = useRef(null);
  const valueRef = useRef("");
  const [value, setValue] = useState("");
  const [rows, setRows] = useState(1);

  // Keep ref in sync with state
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const height = Math.min(textarea.scrollHeight, 120); // Max 120px
    textarea.style.height = `${height}px`;

    const lineCount = Math.ceil(textarea.scrollHeight / 24); // Approx 24px per line
    setRows(Math.min(lineCount, 5));
  }, [value]);

  const handleSend = useCallback(() => {
    if (!valueRef.current.trim() || disabled) return;
    onSend(valueRef.current.trim());
    setValue("");
  }, [disabled, onSend]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    // Ctrl+Enter or Shift+Enter to send
    if ((e.ctrlKey || e.shiftKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        .message-textarea {
          overflow-y: hidden !important;
          scrollbar-width: none;
        }
        .message-textarea::-webkit-scrollbar {
          display: none;
        }
        .message-textarea::-webkit-outer-spin-button,
        .message-textarea::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
      <div className="flex items-end gap-3 p-4 border-t" style={{ borderColor: '#E8E4D4', backgroundColor: '#FAFAF8' }}>
        {/* Attachment button */}
        <button
          className="shrink-0 p-3 rounded-lg hover:bg-opacity-20 transition-colors"
          style={{ color: '#004D40' }}
          title="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="message-textarea flex-1 resize-none rounded-lg border px-4 py-3 text-sm bg-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:border-transparent max-h-37.5 min-h-11 leading-relaxed"
          style={{
            borderColor: '#E8E4D4',
            color: '#1A1A14',
            focusRingColor: '#004D40',
          }}
        />
        
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="shrink-0 p-3 rounded-lg text-white font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          style={{ backgroundColor: '#004D40' }}
        >
          {disabled ? (
            <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1" opacity="0.3" />
              <circle cx="19" cy="12" r="1" opacity="0.6" />
              <circle cx="5" cy="12" r="1" opacity="0.3" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346707 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99721578 L3.03521743,10.4382088 C3.03521743,10.5953061 3.34915502,10.7524035 3.50612381,10.7524035 L16.6915026,11.5378905 C16.6915026,11.5378905 17.1624089,11.5378905 17.1624089,12.0091827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};

export default React.memo(MessageInput);

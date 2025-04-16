"use client";

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/app/store/chatSlice";
import ReactMarkdown from "react-markdown";

export default function ChatInterface() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleSend = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed with status ${response.status}: ${errorData}`);
      }

      const data = await response.json();

      dispatch(addMessage({ user: query, bot: data.response }));
      setQuery("");
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(addMessage({ 
        user: query, 
        bot: "🚨 Error: Unable to process your request. Please try again." 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageWithHighlight = (message) => {
    const citationRegex = /\*\*Source:\*\* \[Click here\]\((.*?)\)/;
    const match = message.match(citationRegex);

    if (match) {
      const beforeCitation = message.substring(0, match.index);
      const citationUrl = match[1];

      return (
        <div>
          <ReactMarkdown className="prose max-w-none">{beforeCitation.trim()}</ReactMarkdown>
          <span className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2">
            <a 
              href={citationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Source
            </a>
          </span>
        </div>
      );
    }

    return <ReactMarkdown className="prose max-w-none">{message}</ReactMarkdown>;
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat with your Companion
        </h2>
      </div>
      
      {/* Messages area */}
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="mx-auto mb-4 text-gray-300"
              >
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation below</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-start justify-end">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-md">
                  <p>{msg.user}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-2 text-blue-600 font-bold">
                  You
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 text-indigo-600 font-bold">
                  AI
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm max-w-md">
                  {renderMessageWithHighlight(msg.bot)}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <div className="relative flex items-end bg-white rounded-lg shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-3 max-h-32 focus:outline-none resize-none"
            placeholder="Type your message..."
            rows="1"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="p-3 m-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400 focus:outline-none"
            aria-label="Send message"
          >
            {loading ? (
              <svg 
                className="w-5 h-5 animate-spin" 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg 
                className="w-5 h-5" 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13"/>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 text-right">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
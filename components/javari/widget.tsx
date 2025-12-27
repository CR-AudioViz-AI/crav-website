"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Ticket, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface JavariWidgetProps {
  sourceApp?: string;
  userId?: string;
  position?: "bottom-right" | "bottom-left";
  primaryColor?: string;
}

export function JavariWidget({ 
  sourceApp = "website", 
  userId,
  position = "bottom-right",
  primaryColor = "#3B82F6"
}: JavariWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showTicketPrompt, setShowTicketPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/javari/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
          user_id: userId,
          context: {
            source_app: sourceApp,
            source_url: typeof window !== "undefined" ? window.location.href : ""
          }
        })
      });

      const data = await res.json();

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.fallback_response || "I apologize, I could not process that request.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.should_create_ticket) {
        setShowTicketPrompt(true);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I am having trouble connecting. Please try again or create a support ticket.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createTicket = () => {
    window.open("/dashboard/tickets/new?from=javari", "_blank");
    setShowTicketPrompt(false);
  };

  const positionClasses = position === "bottom-right" 
    ? "right-4 sm:right-6" 
    : "left-4 sm:left-6";

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50 group`}
        style={{ backgroundColor: primaryColor }}
        aria-label="Open Javari AI Assistant"
      >
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110">
          <Sparkles className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with Javari AI
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50 w-[calc(100%-2rem)] sm:w-96`}>
      <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col" style={{ maxHeight: isMinimized ? "60px" : "500px" }}>
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 text-white cursor-pointer"
          style={{ backgroundColor: primaryColor }}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Javari AI</h3>
              <p className="text-xs opacity-80">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-white/20 rounded">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-white/20 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ minHeight: "300px" }}>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-blue-500 mb-3" />
                  <p className="text-gray-600 font-medium">Hi! I am Javari 👋</p>
                  <p className="text-gray-500 text-sm mt-1">How can I help you today?</p>
                  <div className="mt-4 space-y-2">
                    {["How do credits work?", "What apps do you offer?", "I need help with my account"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="block w-full text-left px-3 py-2 text-sm bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white border shadow-sm rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                </div>
              )}

              {showTicketPrompt && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 mb-3">Would you like to create a support ticket for personalized help?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={createTicket}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      <Ticket className="w-4 h-4" />
                      Create Ticket
                    </button>
                    <button
                      onClick={() => setShowTicketPrompt(false)}
                      className="px-3 py-2 bg-white text-gray-600 text-sm rounded-lg border hover:bg-gray-50"
                    >
                      No thanks
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Javari anything..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Powered by Javari AI • <a href="/javari" className="hover:underline">Learn more</a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default JavariWidget;

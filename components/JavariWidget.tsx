'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

// Simple keyword-based responses for the widget
// In production, this would connect to the full Javari AI API
const getJavariResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase();
  
  // Greetings
  if (msg.match(/^(hi|hello|hey|howdy|hola|greetings)/)) {
    return "Hello! 👋 How can I help you today? I can assist with our AI apps, answer questions, or just chat!";
  }
  
  // How are you
  if (msg.match(/how are you|how's it going|what's up/)) {
    return "I'm doing great, thanks for asking! I'm here and ready to help. What would you like to do today?";
  }
  
  // Apps/tools questions
  if (msg.match(/apps?|tools?|what can you do|features/)) {
    return "We have lots of AI-powered apps! 🎨 Logo Creator, 📄 Document Writer, 📱 Social Media Designer, 💰 Invoice Generator, and more. Check out the Apps page to explore them all!";
  }
  
  // Logo
  if (msg.match(/logo/)) {
    return "Our Logo Creator can help you design professional logos in minutes! Just describe what you're looking for and I'll help create something amazing. Head to Apps → Logo Creator to get started!";
  }
  
  // Pricing/cost
  if (msg.match(/price|pricing|cost|free|pay|credits/)) {
    return "We offer a free tier with 50 credits/month to get started! Pro is $19/mo with 500 credits, and we have Enterprise plans for larger teams. Check out the Pricing page for full details!";
  }
  
  // Games
  if (msg.match(/games?|play|fun/)) {
    return "Yes, we have games! 🎮 Take a break from work with our Games section. We've got puzzles, trivia, and more coming soon!";
  }
  
  // JavariVerse
  if (msg.match(/javariverse|virtual world|metaverse/)) {
    return "The JavariVerse is our upcoming virtual world! 🌐 It's a 3D environment where you can create, explore, and connect with others. Stay tuned - it's coming soon!";
  }
  
  // Help
  if (msg.match(/help|support|contact|problem|issue/)) {
    return "I'm here to help! For technical support, you can visit our Contact page or email us. What's the issue you're experiencing?";
  }
  
  // Thanks
  if (msg.match(/thank|thanks|thx|appreciate/)) {
    return "You're welcome! 😊 Let me know if there's anything else I can help with!";
  }
  
  // Bye
  if (msg.match(/bye|goodbye|see you|later/)) {
    return "Goodbye! Come back anytime you need help. Have a great day! 👋";
  }
  
  // Who are you / about Javari
  if (msg.match(/who are you|about you|your name|tell me about yourself/)) {
    return "I'm Javari, your AI assistant here at CR AudioViz AI! I can help you navigate our apps, answer questions, and assist with creative projects. I'm powered by multiple AI models to give you the best responses!";
  }
  
  // Default response
  return "That's a great question! I'm still learning, but I'd love to help. Could you tell me more about what you're looking for? Or feel free to explore our Apps, Games, or chat with me on the full Javari AI page for more in-depth conversations!";
};

export default function JavariWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Javari, your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    
    // Simulate thinking time
    setTimeout(() => {
      const response = getJavariResponse(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50 group">
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="absolute -top-2 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Javari AI</h3>
                <p className="text-xs text-gray-400">Your AI Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-2 rounded-2xl">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask me anything..." className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none" />
              <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl transition-colors">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

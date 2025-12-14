// =============================================================================
// CR AUDIOVIZ AI - JAVARI WIDGET (PRODUCTION)
// =============================================================================
// Updated to use javariai.com production endpoint
// Sunday, December 14, 2025 - 1:03 PM EST
// =============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  Zap,
  Brain,
} from 'lucide-react';

// Brand colors
const COLORS = {
  navy: '#002B5B',
  red: '#FD201D',
  cyan: '#00BCD4',
};

// ✅ PRODUCTION ENDPOINT - javariai.com
const JAVARI_API_URL = 'https://javariai.com/api/chat';
const JAVARI_HEALTH_URL = 'https://javariai.com/api/health';
const JAVARI_LEARN_URL = 'https://javariai.com/api/learn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'good' | 'bad';
  provider?: string;
  model?: string;
  error?: boolean;
  tokensUsed?: number;
  cost?: number;
}

interface JavariWidgetProps {
  sourceApp?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  enableTickets?: boolean;
  enableEnhancements?: boolean;
  context?: string;
}

interface JavariResponse {
  content: string;
  response?: string;
  provider?: string;
  model?: string;
  tokensUsed?: number;
  cost?: number;
  error?: string;
  buildIntent?: {
    isBuild: boolean;
    complexity: string;
  };
  taskAnalysis?: {
    taskType: string;
    complexity: string;
  };
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
  latency?: number;
  providers?: string[];
}

export default function JavariWidget({
  sourceApp = 'craudiovizai.com',
  position = 'bottom-right',
  primaryColor = COLORS.cyan,
  enableTickets = true,
  enableEnhancements = true,
  context,
}: JavariWidgetProps) {
  const supabase = createClientComponentClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [user, setUser] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [health, setHealth] = useState<HealthStatus>({ status: 'checking' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check system health on mount
  useEffect(() => {
    checkHealth();
    checkUser();
    const healthInterval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(healthInterval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const checkHealth = async () => {
    try {
      const start = Date.now();
      const res = await fetch(JAVARI_HEALTH_URL, { 
        method: 'GET',
        cache: 'no-store' 
      });
      const data = await res.json();
      const latency = Date.now() - start;
      
      setHealth({
        status: data.status || 'healthy',
        latency,
        providers: data.checks?.api?.details?.active_providers || []
      });
      setConnectionError(false);
    } catch (error) {
      setHealth({ status: 'unhealthy' });
      setConnectionError(true);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Convert messages to API format
  const formatMessagesForAPI = useCallback((msgs: Message[]) => {
    return msgs
      .filter(m => !m.error)
      .map(m => ({
        role: m.role,
        content: m.content,
      }));
  }, []);

  // Call Javari AI API
  const callJavariAPI = async (userMessage: string): Promise<JavariResponse> => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const apiMessages = [
      ...formatMessagesForAPI(messages),
      { role: 'user', content: userMessage }
    ];

    // Add context if provided
    const systemContext = context 
      ? `Context: User is on ${sourceApp}. ${context}`
      : `Context: User is chatting via widget on ${sourceApp}.`;

    try {
      const response = await fetch(JAVARI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: user?.id || sessionId,
          sessionId: sessionId,
          sourceApp: sourceApp,
          systemContext: systemContext,
          model: 'claude-sonnet-4-20250514', // Default to Claude Sonnet
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setConnectionError(false);
      setRetryCount(0);
      
      // Send learning feedback
      sendLearningFeedback(userMessage, data);
      
      return {
        content: data.content || data.response || 'I received your message but had trouble generating a response.',
        provider: data.provider,
        model: data.model,
        tokensUsed: data.tokensUsed,
        cost: data.cost,
        buildIntent: data.buildIntent,
        taskAnalysis: data.taskAnalysis,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      
      console.error('Javari API error:', error);
      setConnectionError(true);
      
      return {
        content: "I'm having trouble connecting right now. Please try again in a moment, or contact support@craudiovizai.com if this persists.",
        error: error.message,
      };
    }
  };

  // Send feedback to learning system
  const sendLearningFeedback = async (userMessage: string, response: any) => {
    try {
      await fetch(`${JAVARI_LEARN_URL}?action=feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_id: `${sessionId}_${Date.now()}`,
          interaction_type: 'chat',
          outcome: response.error ? 'failure' : 'success',
          model: response.model || 'unknown',
          context: {
            source: sourceApp,
            user_message_length: userMessage.length,
            response_length: response.content?.length || 0,
          },
          metrics: {
            response_time_ms: response.responseTime || 0,
            tokens_used: response.tokensUsed || 0,
            cost_usd: response.cost || 0,
          }
        })
      });
    } catch (error) {
      console.debug('Learning feedback failed:', error);
    }
  };

  // Save conversation to database for learning
  const saveConversation = async (role: 'user' | 'assistant', content: string, provider?: string) => {
    try {
      const extractedTopics = extractTopics(content);
      const extractedEntities = extractEntities(content);
      
      await supabase.from('javari_conversations').insert({
        session_id: sessionId,
        user_id: user?.id || null,
        source_app: sourceApp,
        role,
        content,
        extracted_topics: extractedTopics,
        extracted_entities: extractedEntities,
        provider: provider || null,
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  // Topic extraction
  const extractTopics = (text: string): string[] => {
    const topics: string[] = [];
    const lower = text.toLowerCase();
    
    if (lower.includes('stock') || lower.includes('invest')) topics.push('stocks');
    if (lower.includes('crypto') || lower.includes('bitcoin')) topics.push('crypto');
    if (lower.includes('penny')) topics.push('penny_stocks');
    if (lower.includes('support') || lower.includes('help')) topics.push('support');
    if (lower.includes('feature') || lower.includes('enhance')) topics.push('enhancements');
    if (lower.includes('credit') || lower.includes('billing')) topics.push('billing');
    if (lower.includes('app') || lower.includes('tool')) topics.push('apps');
    if (lower.includes('game')) topics.push('games');
    if (lower.includes('craiverse') || lower.includes('avatar')) topics.push('craiverse');
    if (lower.includes('javari') || lower.includes('ai')) topics.push('ai');
    
    return topics;
  };

  // Entity extraction
  const extractEntities = (text: string): string[] => {
    const entities: string[] = [];
    
    const tickerMatch = text.match(/\$[A-Z]{1,5}/g);
    if (tickerMatch) {
      entities.push(...tickerMatch.map(t => t.replace('$', '')));
    }
    
    if (text.toLowerCase().includes('bitcoin') || text.includes('BTC')) entities.push('BTC');
    if (text.toLowerCase().includes('ethereum') || text.includes('ETH')) entities.push('ETH');
    
    return [...new Set(entities)];
  };

  // Log activity
  const logActivity = async (activityType: string, description: string, relatedTicker?: string) => {
    try {
      await supabase.from('javari_activity_log').insert({
        activity_type: activityType,
        description,
        related_ticker: relatedTicker,
        source_app: sourceApp,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessageContent = input.trim();
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Save user message
    await saveConversation('user', userMessageContent);
    
    // Log interaction
    const entities = extractEntities(userMessageContent);
    await logActivity('widget_message', `User asked: ${userMessageContent.substring(0, 100)}...`, entities[0]);

    try {
      // Call real Javari AI API
      const response = await callJavariAPI(userMessageContent);
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        error: !!response.error,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant response
      await saveConversation('assistant', response.content, response.provider);
      
      // Log response
      await logActivity(
        response.error ? 'api_error' : 'responded',
        `Javari responded via ${response.provider || 'fallback'}`,
      );
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        const errorMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble connecting. Please try again.",
          timestamp: new Date(),
          error: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;
    
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.error) {
        return prev.slice(0, -1);
      }
      return prev;
    });
    
    setRetryCount(prev => prev + 1);
    setIsTyping(true);
    
    try {
      const response = await callJavariAPI(lastUserMessage.content);
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        provider: response.provider,
        model: response.model,
        error: !!response.error,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'good' | 'bad') => {
    setMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, feedback } : m)
    );
    
    const message = messages.find(m => m.id === messageId);
    
    await logActivity(
      'feedback',
      `User rated response as ${feedback}: "${message?.content.substring(0, 50)}..."`,
    );

    // Send to Javari learning API
    try {
      await fetch(`${JAVARI_LEARN_URL}?action=feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_id: messageId,
          interaction_type: 'feedback',
          outcome: feedback === 'good' ? 'positive' : 'negative',
          feedback: {
            rating: feedback,
            message_content: message?.content?.substring(0, 200),
          }
        }),
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getHealthIndicator = () => {
    switch (health.status) {
      case 'healthy':
        return { color: 'text-green-400', text: '🟢 Online', bg: 'bg-green-500' };
      case 'degraded':
        return { color: 'text-yellow-400', text: '🟡 Degraded', bg: 'bg-yellow-500' };
      case 'unhealthy':
        return { color: 'text-red-400', text: '🔴 Offline', bg: 'bg-red-500' };
      default:
        return { color: 'text-gray-400', text: '⚪ Checking...', bg: 'bg-gray-500' };
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 sm:right-6' 
    : 'left-4 sm:left-6';

  // Widget button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl group`}
        style={{ backgroundColor: primaryColor }}
        aria-label="Open Javari AI Assistant"
      >
        <Sparkles className="w-6 h-6 text-white" />
        {/* Health indicator dot */}
        <span className={`absolute top-0 right-0 w-3 h-3 ${getHealthIndicator().bg} rounded-full border-2 border-white`} />
        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with Javari AI
        </span>
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50`}>
        <Card 
          className="w-64 p-3 cursor-pointer hover:shadow-lg transition-shadow border-0"
          style={{ backgroundColor: COLORS.navy }}
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
              <span className="text-white font-medium">Javari AI</span>
              {messages.length > 0 && (
                <span className="bg-cyan-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {messages.length}
                </span>
              )}
            </div>
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </div>
        </Card>
      </div>
    );
  }

  const healthInfo = getHealthIndicator();

  // Full chat widget
  return (
    <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50 w-[95vw] sm:w-96 max-w-md`}>
      <Card className="shadow-2xl overflow-hidden border-0" style={{ backgroundColor: '#111' }}>
        {/* Header */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ backgroundColor: COLORS.navy }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}30` }}
            >
              <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                Javari AI
                <span className="text-xs px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded">v7.0</span>
              </h3>
              <p className={`text-xs ${healthInfo.color}`}>
                {connectionError ? '⚠️ Reconnecting...' : healthInfo.text}
                {health.latency && health.status === 'healthy' && ` • ${health.latency}ms`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-white p-1 transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-2 border-b border-gray-800 flex gap-2 overflow-x-auto">
          {enableTickets && (
            <button 
              onClick={() => setInput('I need help with an issue')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              Get Help
            </button>
          )}
          {enableEnhancements && (
            <button 
              onClick={() => setInput('I have a feature idea')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              Suggest Feature
            </button>
          )}
          <button 
            onClick={() => setInput('What can you help me with?')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <TrendingUp className="w-3 h-3" />
            Explore
          </button>
        </div>

        {/* Provider Status Bar */}
        {health.providers && health.providers.length > 0 && (
          <div className="px-4 py-2 bg-gray-900/50 border-b border-gray-800 flex items-center gap-2">
            <Brain className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-gray-500">
              {health.providers.length} AI providers: {health.providers.join(', ')}
            </span>
          </div>
        )}

        {/* Connection Error Banner */}
        {connectionError && (
          <div className="bg-red-900/50 text-red-200 px-4 py-2 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Connection issue detected</span>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: primaryColor }} />
              <h4 className="text-white font-medium mb-2">Hi, I'm Javari!</h4>
              <p className="text-gray-400 text-sm">
                I'm your AI assistant powered by multiple AI providers. 
                Ask me anything about CR AudioViz AI, get help, or explore our platform!
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Claude</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">GPT-4</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Gemini</span>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-cyan-600 text-white'
                    : message.error
                    ? 'bg-red-900/50 text-red-200 border border-red-800'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Provider badge for assistant messages */}
                {message.role === 'assistant' && message.provider && !message.error && (
                  <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      via {message.provider}
                    </span>
                    {message.tokensUsed && (
                      <span className="text-xs text-gray-600">
                        {message.tokensUsed} tokens
                      </span>
                    )}
                  </div>
                )}
                
                {/* Feedback buttons for assistant messages */}
                {message.role === 'assistant' && !message.feedback && !message.error && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700">
                    <span className="text-xs text-gray-500">Helpful?</span>
                    <button
                      onClick={() => handleFeedback(message.id, 'good')}
                      className="text-gray-500 hover:text-green-400 p-1 transition-colors"
                      aria-label="Good response"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'bad')}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                      aria-label="Bad response"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {message.feedback && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <span className="text-xs text-gray-500">
                      {message.feedback === 'good' ? '✓ Thanks for the feedback!' : '✓ I\'ll learn from this!'}
                    </span>
                  </div>
                )}

                {/* Retry button for error messages */}
                {message.error && (
                  <button
                    onClick={handleRetry}
                    className="mt-2 flex items-center gap-1 text-xs text-red-300 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Try again
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-xs text-gray-400">Javari is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Javari anything..."
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{ backgroundColor: primaryColor }}
              className="text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by <a href="https://javariai.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Javari AI</a> • Autonomous Learning Active
          </p>
        </div>
      </Card>
    </div>
  );
}

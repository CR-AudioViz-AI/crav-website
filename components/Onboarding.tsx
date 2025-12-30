// /components/Onboarding.tsx
// User Onboarding Flow - CR AudioViz AI / Javari
// Multi-step wizard that guides users to value

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================================================
// TYPES
// =============================================================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
  skippable?: boolean;
}

interface StepProps {
  onNext: (data?: any) => void;
  onSkip?: () => void;
  onBack?: () => void;
  userData: OnboardingData;
  setUserData: (data: Partial<OnboardingData>) => void;
}

interface OnboardingData {
  name: string;
  useCase: string;
  interests: string[];
  experience: string;
  goals: string[];
  companyName?: string;
  companySize?: string;
  referralSource?: string;
  hasCompletedFirstChat: boolean;
  hasExploredTools: boolean;
}

interface OnboardingProps {
  userId: string;
  userEmail: string;
  userName?: string;
  onComplete: (data: OnboardingData) => void;
  onSkipAll?: () => void;
}

// =============================================================================
// STEP 1: WELCOME
// =============================================================================

function WelcomeStep({ onNext, userData, setUserData }: StepProps) {
  const [name, setName] = useState(userData.name || '');

  return (
    <div className="text-center max-w-xl mx-auto">
      {/* Javari Avatar */}
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
        <span className="text-4xl">🤖</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Javari! 👋
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        I'm your AI assistant, ready to help you create, build, and accomplish amazing things.
        Let's personalize your experience.
      </p>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
          What should I call you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      </div>

      <button
        onClick={() => {
          setUserData({ name });
          onNext();
        }}
        disabled={!name.trim()}
        className="w-full py-4 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Let's Get Started →
      </button>
    </div>
  );
}

// =============================================================================
// STEP 2: USE CASE
// =============================================================================

function UseCaseStep({ onNext, onBack, userData, setUserData }: StepProps) {
  const [selected, setSelected] = useState(userData.useCase || '');

  const useCases = [
    { id: 'personal', icon: '👤', title: 'Personal Use', desc: 'For my own projects and learning' },
    { id: 'business', icon: '💼', title: 'Business', desc: 'For my company or clients' },
    { id: 'creator', icon: '🎨', title: 'Content Creator', desc: 'Creating content, art, or media' },
    { id: 'developer', icon: '💻', title: 'Developer', desc: 'Building apps and software' },
    { id: 'student', icon: '📚', title: 'Student', desc: 'Learning and studying' },
    { id: 'other', icon: '✨', title: 'Other', desc: 'Something else entirely' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        How will you use Javari, {userData.name}?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        This helps me tailor recommendations for you
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {useCases.map((uc) => (
          <button
            key={uc.id}
            onClick={() => setSelected(uc.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selected === uc.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-2xl mb-2 block">{uc.icon}</span>
            <h3 className="font-medium text-gray-900 dark:text-white">{uc.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{uc.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => {
            setUserData({ useCase: selected });
            onNext();
          }}
          disabled={!selected}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// STEP 3: INTERESTS
// =============================================================================

function InterestsStep({ onNext, onBack, userData, setUserData }: StepProps) {
  const [selected, setSelected] = useState<string[]>(userData.interests || []);

  const interests = [
    { id: 'writing', icon: '✍️', label: 'Writing & Content' },
    { id: 'coding', icon: '💻', label: 'Coding & Development' },
    { id: 'design', icon: '🎨', label: 'Design & Graphics' },
    { id: 'marketing', icon: '📈', label: 'Marketing & Sales' },
    { id: 'research', icon: '🔍', label: 'Research & Analysis' },
    { id: 'education', icon: '📚', label: 'Learning & Education' },
    { id: 'music', icon: '🎵', label: 'Music & Audio' },
    { id: 'video', icon: '🎬', label: 'Video & Animation' },
    { id: 'business', icon: '💼', label: 'Business & Finance' },
    { id: 'productivity', icon: '⚡', label: 'Productivity' },
    { id: 'games', icon: '🎮', label: 'Games & Entertainment' },
    { id: 'social', icon: '💬', label: 'Social Media' }
  ];

  const toggleInterest = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        What interests you?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Select all that apply - I'll show you relevant tools and features
      </p>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8">
        {interests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              selected.includes(interest.id)
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-xl block mb-1">{interest.icon}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {interest.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => {
            setUserData({ interests: selected });
            onNext();
          }}
          disabled={selected.length === 0}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// STEP 4: EXPERIENCE LEVEL
// =============================================================================

function ExperienceStep({ onNext, onBack, userData, setUserData }: StepProps) {
  const [selected, setSelected] = useState(userData.experience || '');

  const levels = [
    { 
      id: 'beginner', 
      title: 'New to AI',
      desc: "I've never used an AI assistant before",
      icon: '🌱'
    },
    { 
      id: 'intermediate', 
      title: 'Some Experience',
      desc: "I've used ChatGPT or similar tools",
      icon: '🌿'
    },
    { 
      id: 'advanced', 
      title: 'Power User',
      desc: 'I use AI tools regularly and know prompting',
      icon: '🌳'
    }
  ];

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        What's your AI experience?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        I'll adjust my explanations accordingly
      </p>

      <div className="space-y-4 mb-8">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelected(level.id)}
            className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
              selected === level.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-3xl">{level.icon}</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{level.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{level.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => {
            setUserData({ experience: selected });
            onNext();
          }}
          disabled={!selected}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// STEP 5: FIRST CHAT (Interactive)
// =============================================================================

function FirstChatStep({ onNext, onBack, userData, setUserData }: StepProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { 
      role: 'assistant', 
      content: `Hi ${userData.name}! 👋 I'm Javari, your AI assistant. I can help you with ${userData.interests.slice(0, 3).join(', ')} and much more. What would you like to explore first?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(userData.hasCompletedFirstChat);

  const suggestions = [
    "What can you help me with?",
    "Show me the creative tools",
    "Tell me about the games",
    "How do credits work?"
  ];

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsTyping(true);
    setHasInteracted(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      default: `Great question! As your AI assistant, I can help you with writing, coding, research, creative projects, and so much more. I have access to professional tools for logo design, documents, presentations, and a library of games. What sounds interesting to you?`,
      tools: `I have a comprehensive suite of creative tools! You can create logos, design social media posts, write documents, build presentations, generate invoices, and more. Each tool is AI-powered to help you work faster. Want me to show you after we finish setting up?`,
      games: `The games library has hundreds of titles across different genres - action, puzzle, strategy, casual, and more! Perfect for taking a break or having some fun. You can access them from your dashboard.`,
      credits: `Credits are how you use premium features. You get free credits to start, and they're used for AI interactions and tool usage. On paid plans, credits never expire! You can always buy more if needed.`
    };

    let response = responses.default;
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('tool') || lowerMessage.includes('creative')) response = responses.tools;
    if (lowerMessage.includes('game')) response = responses.games;
    if (lowerMessage.includes('credit')) response = responses.credits;

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        Let's Chat! 💬
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
        Try asking me something - this is what I'm here for
      </p>

      {/* Chat Window */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4 h-80 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-md shadow-sm">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(suggestion)}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:border-blue-500 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isTyping}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => {
            setUserData({ hasCompletedFirstChat: true });
            onNext();
          }}
          disabled={!hasInteracted}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {hasInteracted ? 'Continue →' : 'Send a message first'}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// STEP 6: COMPLETION
// =============================================================================

function CompletionStep({ onNext, userData }: StepProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const recommendedTools = [
    { name: 'Javari AI Chat', icon: '💬', desc: 'Your AI assistant for anything' },
    { name: 'Logo Creator', icon: '🎨', desc: 'Design professional logos' },
    { name: 'Document Writer', icon: '📄', desc: 'Create polished documents' },
    { name: 'Games Hub', icon: '🎮', desc: 'Take a break with games' }
  ];

  return (
    <div className="max-w-xl mx-auto text-center">
      {/* Celebration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
            🎉
          </div>
        )}
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        You're All Set, {userData.name}! 🚀
      </h2>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Your profile is ready. Here's what I recommend based on your interests:
      </p>

      {/* Recommendations */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {recommendedTools.map((tool, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-left"
          >
            <span className="text-2xl mb-2 block">{tool.icon}</span>
            <h3 className="font-medium text-gray-900 dark:text-white">{tool.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tool.desc}</p>
          </div>
        ))}
      </div>

      {/* Credits Badge */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-8">
        <p className="text-blue-600 dark:text-blue-400 font-medium">
          🎁 You have <span className="text-xl font-bold">50 free credits</span> to get started!
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard →
      </button>
    </div>
  );
}

// =============================================================================
// MAIN ONBOARDING COMPONENT
// =============================================================================

const STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome', description: 'Get started', component: WelcomeStep },
  { id: 'useCase', title: 'Use Case', description: 'How you\'ll use Javari', component: UseCaseStep },
  { id: 'interests', title: 'Interests', description: 'What interests you', component: InterestsStep },
  { id: 'experience', title: 'Experience', description: 'Your AI experience', component: ExperienceStep, skippable: true },
  { id: 'firstChat', title: 'First Chat', description: 'Try chatting', component: FirstChatStep },
  { id: 'completion', title: 'Complete', description: 'You\'re ready!', component: CompletionStep }
];

export function Onboarding({ userId, userEmail, userName, onComplete, onSkipAll }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<OnboardingData>({
    name: userName || '',
    useCase: '',
    interests: [],
    experience: '',
    goals: [],
    hasCompletedFirstChat: false,
    hasExploredTools: false
  });

  const updateUserData = (data: Partial<OnboardingData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      saveOnboardingData();
      onComplete(userData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const saveOnboardingData = async () => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...userData,
          completedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Skip Button */}
      {onSkipAll && currentStep < STEPS.length - 1 && (
        <button
          onClick={onSkipAll}
          className="fixed top-4 right-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-50"
        >
          Skip Setup
        </button>
      )}

      {/* Step Indicators */}
      <div className="pt-8 pb-4">
        <div className="flex justify-center gap-2">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentStep
                  ? 'bg-blue-600 w-6'
                  : idx < currentStep
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              onNext={handleNext}
              onBack={currentStep > 0 ? handleBack : undefined}
              onSkip={STEPS[currentStep].skippable ? handleSkip : undefined}
              userData={userData}
              setUserData={updateUserData}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default Onboarding;

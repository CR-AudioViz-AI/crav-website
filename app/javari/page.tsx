import { Metadata } from "next"
import { JavariChat } from "@/components/javari/JavariChat"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Code, Zap, Brain, Sparkles, MessageSquare, Wrench, Shield } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Javari AI - Your Intelligent Assistant | CR AudioViz AI",
  description: "Chat with Javari, your AI-powered assistant for coding, analysis, creative work, and more."
}

export default function JavariPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <Bot className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Meet Javari AI
            </h1>
            <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto">
              Your autonomous AI assistant that helps with coding, analysis, creative writing, and building production-ready solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Chat Section */}
      <section className="px-4 py-8 md:py-12 -mt-8">
        <div className="container mx-auto max-w-4xl">
          <JavariChat className="shadow-2xl" showCredits={true} userCredits={100} />
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            What Javari Can Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CapabilityCard
              icon={<Code className="w-8 h-8" />}
              title="Code Assistant"
              description="Write, debug, and optimize code in any language"
            />
            <CapabilityCard
              icon={<Brain className="w-8 h-8" />}
              title="Analysis"
              description="Data analysis, research synthesis, and insights"
            />
            <CapabilityCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Creative Writing"
              description="Content creation, copywriting, and storytelling"
            />
            <CapabilityCard
              icon={<Wrench className="w-8 h-8" />}
              title="Problem Solving"
              description="Strategy, planning, and technical solutions"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Credits System"
              description="Pay only for what you use. Credits never expire on paid plans."
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6 text-blue-500" />}
              title="Conversation Memory"
              description="Javari remembers context throughout your session."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-green-500" />}
              title="Secure & Private"
              description="Your conversations are encrypted and never shared."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-lg text-purple-100 mb-6">
            Get started with 100 free credits when you sign up.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition">
              Sign Up Free
            </Link>
            <Link href="/pricing" className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function CapabilityCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-center p-6 hover:shadow-lg transition">
      <CardContent className="pt-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-purple-600">
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  )
}

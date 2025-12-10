'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  Lightbulb,
  HelpCircle,
  CreditCard,
  Bug,
  Shield,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import JavariWidget from '@/components/JavariWidget';

const COLORS = {
  navy: '#002B5B',
  red: '#FD201D',
  cyan: '#00BCD4',
};

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  source_app: string;
  created_at: string;
}

const CATEGORIES = [
  { value: 'billing', label: 'Billing & Credits', icon: CreditCard },
  { value: 'technical', label: 'Technical Issue', icon: Bug },
  { value: 'account', label: 'Account & Login', icon: Shield },
  { value: 'feature', label: 'How-To Question', icon: HelpCircle },
  { value: 'general', label: 'General Inquiry', icon: MessageSquare },
];

const STATUS_BADGES: Record<string, { color: string; label: string }> = {
  open: { color: 'bg-blue-500', label: 'Open' },
  in_progress: { color: 'bg-yellow-500', label: 'In Progress' },
  waiting: { color: 'bg-purple-500', label: 'Waiting' },
  resolved: { color: 'bg-green-500', label: 'Resolved' },
  closed: { color: 'bg-gray-500', label: 'Closed' },
};

export default function SupportPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: 'general',
    source_app: 'craudiovizai.com',
  });

  useEffect(() => {
    loadUser();
    loadTickets();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadTickets = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTickets(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.subject || !form.description) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user?.id,
      user_email: user?.email,
      user_name: user?.user_metadata?.full_name || user?.email,
      subject: form.subject,
      description: form.description,
      category: form.category,
      source_app: form.source_app,
    });

    if (error) {
      console.error('Error:', error);
      alert('Failed to create ticket');
    } else {
      setForm({ subject: '', description: '', category: 'general', source_app: 'craudiovizai.com' });
      setShowForm(false);
      loadTickets();
    }
    setSubmitting(false);
  };

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="py-12 px-4" style={{ backgroundColor: COLORS.navy }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Support Center</h1>
          <p className="text-gray-300 mb-6">
            Get help, submit tickets, or suggest new features
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: COLORS.red }}
              className="text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
            <Link href="/support/enhancements">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Lightbulb className="w-4 h-4 mr-2" />
                Feature Requests
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* New Ticket Form */}
        {showForm && (
          <Card className="mb-8 bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: COLORS.cyan }} />
                Create Support Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-white">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Description</label>
                <Textarea
                  placeholder="Please provide details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Related App</label>
                <Select value={form.source_app} onValueChange={(v) => setForm({ ...form, source_app: v })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="craudiovizai.com" className="text-white">CR AudioViz AI (Main)</SelectItem>
                    <SelectItem value="javariai.com" className="text-white">Javari AI</SelectItem>
                    <SelectItem value="cardverse" className="text-white">CardVerse</SelectItem>
                    <SelectItem value="other" className="text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ backgroundColor: COLORS.cyan }}
                  className="text-white flex-1"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">My Tickets</h2>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All</SelectItem>
                <SelectItem value="open" className="text-white">Open</SelectItem>
                <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                <SelectItem value="resolved" className="text-white">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!user ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 mb-4">Sign in to view your tickets</p>
                <Link href="/signin">
                  <Button style={{ backgroundColor: COLORS.red }} className="text-white">
                    Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 mb-4">No tickets yet</p>
                <Button onClick={() => setShowForm(true)} style={{ backgroundColor: COLORS.cyan }} className="text-white">
                  Create First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-cyan-400 font-mono text-sm">{ticket.ticket_number}</span>
                          <Badge className={`${STATUS_BADGES[ticket.status]?.color || 'bg-gray-500'} text-white text-xs`}>
                            {STATUS_BADGES[ticket.status]?.label || ticket.status}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                            {ticket.category}
                          </Badge>
                        </div>
                        <h3 className="text-white font-medium">{ticket.subject}</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {new Date(ticket.created_at).toLocaleDateString()} • {ticket.source_app}
                        </p>
                      </div>
                      <Link href={`/support/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm" className="text-cyan-400">
                          View <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Help Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <Sparkles className="w-8 h-8 mb-3" style={{ color: COLORS.cyan }} />
              <h3 className="text-white font-semibold mb-2">Ask Javari</h3>
              <p className="text-gray-400 text-sm mb-4">Get instant help from our AI assistant</p>
              <p className="text-cyan-400 text-sm">Click the chat bubble →</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <Lightbulb className="w-8 h-8 mb-3" style={{ color: COLORS.cyan }} />
              <h3 className="text-white font-semibold mb-2">Feature Requests</h3>
              <p className="text-gray-400 text-sm mb-4">Vote on ideas or suggest new features</p>
              <Link href="/support/enhancements">
                <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400">
                  View Roadmap
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Javari Widget */}
      <JavariWidget 
        sourceApp="craudiovizai.com" 
        enableTickets={true}
        enableEnhancements={true}
      />
    </div>
  );
}

// app/admin/grants/[id]/page.tsx
// Individual Grant Detail Page - Complete Management
// Timestamp: Saturday, December 13, 2025 - 12:05 PM EST

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, DollarSign, Calendar, FileText, CheckCircle, 
  Clock, AlertTriangle, Target, TrendingUp, Building, Users,
  Plus, Filter, Search, Download, Upload, Bell, Sparkles,
  Phone, Mail, MapPin, MessageSquare, BarChart3, PieChart,
  ChevronRight, ExternalLink, Edit, Trash2, Eye, Copy,
  AlertCircle, CheckCircle2, XCircle, HelpCircle, Briefcase,
  Globe, Send, Paperclip, User, Star, Archive, MoreHorizontal,
  FileUp, Link2, History, Lightbulb, Brain, Zap
} from 'lucide-react';
import GrantContactsSection from './components/GrantContactsSection';
import GrantDocumentsSection from './components/GrantDocumentsSection';
import GrantCommunicationsSection from './components/GrantCommunicationsSection';
import GrantMilestonesSection from './components/GrantMilestonesSection';
import GrantNotesSection from './components/GrantNotesSection';
import GrantAISection from './components/GrantAISection';
import GrantApplicationSection from './components/GrantApplicationSection';
import GrantActions from './components/GrantActions';

// Status configuration
const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  researching: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Search, label: 'Researching' },
  preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FileText, label: 'Preparing' },
  draft: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Edit, label: 'Draft' },
  internal_review: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Eye, label: 'Internal Review' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Target, label: 'Submitted' },
  under_review: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Clock, label: 'Under Review' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-500', icon: Trash2, label: 'Withdrawn' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-400', icon: Archive, label: 'Archived' },
};

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Critical' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'High' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Medium' },
  low: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400', label: 'Low' },
};

const MODULE_NAMES: Record<string, string> = {
  'first-responders': 'First Responders Haven',
  'veterans-transition': 'Veterans Transition Hub',
  'together-anywhere': 'Together Anywhere',
  'faith-communities': 'Faith Communities',
  'senior-connect': 'Senior Connect',
  'foster-care-network': 'Foster Care Network',
  'rural-health': 'Rural Health Access',
  'mental-health-youth': 'Youth Mental Health',
  'addiction-recovery': 'Recovery Together',
  'animal-rescue': 'Animal Rescue Network',
  'green-earth': 'Green Earth Initiative',
  'disaster-relief': 'Disaster Relief Hub',
  'small-business': 'Small Business Hub',
  'nonprofit-toolkit': 'Nonprofit Toolkit',
  'education-access': 'Education Access',
  'digital-literacy': 'Digital Literacy',
  'artists-collective': 'Artists Collective',
  'musicians-guild': 'Musicians Guild',
  'community-journalism': 'Community Journalism',
  'food-security': 'Food Security Network',
};

function formatCurrency(amount: number | null): string {
  if (!amount) return '$0';
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not set';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDeadlineUrgency(days: number | null): { color: string; label: string } {
  if (days === null) return { color: 'text-gray-500', label: 'Rolling' };
  if (days < 0) return { color: 'text-red-600 bg-red-50', label: `${Math.abs(days)} days overdue` };
  if (days === 0) return { color: 'text-red-600 bg-red-50 font-bold', label: 'DUE TODAY!' };
  if (days <= 3) return { color: 'text-red-600 bg-red-50', label: `${days} days - URGENT` };
  if (days <= 7) return { color: 'text-orange-600 bg-orange-50', label: `${days} days left` };
  if (days <= 14) return { color: 'text-yellow-600 bg-yellow-50', label: `${days} days left` };
  if (days <= 30) return { color: 'text-blue-600 bg-blue-50', label: `${days} days left` };
  return { color: 'text-green-600 bg-green-50', label: `${days} days left` };
}

async function getGrantDetails(supabase: any, grantId: string) {
  // Get grant opportunity
  const { data: grant, error } = await supabase
    .from('grant_opportunities')
    .select('*')
    .eq('id', grantId)
    .single();

  if (error || !grant) return null;

  // Get contacts
  const { data: contacts } = await supabase
    .from('grant_contacts')
    .select('*')
    .eq('grant_id', grantId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  // Get documents
  const { data: documents } = await supabase
    .from('grant_documents')
    .select('*')
    .eq('grant_id', grantId)
    .order('uploaded_at', { ascending: false });

  // Get communications
  const { data: communications } = await supabase
    .from('grant_communications')
    .select('*, grant_contacts(first_name, last_name)')
    .eq('grant_id', grantId)
    .order('communication_date', { ascending: false });

  // Get milestones
  const { data: milestones } = await supabase
    .from('grant_milestones')
    .select('*')
    .eq('grant_id', grantId)
    .order('due_date', { ascending: true });

  // Get notes
  const { data: notes } = await supabase
    .from('grant_notes')
    .select('*')
    .eq('grant_id', grantId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  // Get AI analysis
  const { data: aiAnalysis } = await supabase
    .from('grant_ai_analysis')
    .select('*')
    .eq('grant_id', grantId)
    .order('created_at', { ascending: false });

  // Get application drafts
  const { data: applications } = await supabase
    .from('grant_applications')
    .select('*')
    .eq('grant_id', grantId)
    .order('version', { ascending: false });

  return {
    grant,
    contacts: contacts || [],
    documents: documents || [],
    communications: communications || [],
    milestones: milestones || [],
    notes: notes || [],
    aiAnalysis: aiAnalysis || [],
    applications: applications || [],
  };
}

export default async function GrantDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Check admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
    
  if (!profile?.is_admin) redirect('/dashboard');

  const data = await getGrantDetails(supabase, params.id);
  if (!data) notFound();

  const { grant, contacts, documents, communications, milestones, notes, aiAnalysis, applications } = data;
  
  const statusConfig = STATUS_CONFIG[grant.status] || STATUS_CONFIG.researching;
  const priorityConfig = PRIORITY_CONFIG[grant.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = statusConfig.icon;
  const deadlineDays = getDaysUntil(grant.application_deadline);
  const deadlineUrgency = getDeadlineUrgency(deadlineDays);

  // Calculate progress metrics
  const pendingMilestones = milestones.filter((m: any) => m.status === 'pending').length;
  const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const milestonesProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/grants" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${priorityConfig.dot}`}></span>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{grant.grant_name}</h1>
                  <p className="text-xs text-gray-500">{grant.agency_name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </span>
              <GrantActions grant={grant} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alert Banner for Urgent Deadlines */}
        {deadlineDays !== null && deadlineDays <= 7 && deadlineDays >= 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-800">
                {deadlineDays === 0 ? 'Application due TODAY!' : `Application due in ${deadlineDays} days!`}
              </p>
              <p className="text-sm text-red-600">
                Deadline: {formatDate(grant.application_deadline)}
              </p>
            </div>
            <Link
              href={`/admin/grants/${grant.id}/application`}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Open Application
            </Link>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Available</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(grant.amount_available)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Requesting</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(grant.amount_requested)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Deadline</span>
            </div>
            <p className={`text-sm font-bold px-2 py-0.5 rounded ${deadlineUrgency.color}`}>
              {deadlineUrgency.label}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">Match Score</span>
            </div>
            <p className="text-xl font-bold text-purple-600">{grant.match_score || 0}%</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Win Probability</span>
            </div>
            <p className="text-xl font-bold text-orange-600">{grant.win_probability || 0}%</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Milestones</span>
            </div>
            <p className="text-xl font-bold text-indigo-600">{completedMilestones}/{totalMilestones}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grant Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Grant Details</h2>
                <Link
                  href={`/admin/grants/${grant.id}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Agency</label>
                    <p className="font-medium text-gray-900">{grant.agency_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Program</label>
                    <p className="font-medium text-gray-900">{grant.program_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Opportunity Number</label>
                    <p className="font-medium text-gray-900">{grant.opportunity_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Competition Level</label>
                    <p className="font-medium text-gray-900 capitalize">{grant.competition_level || 'Unknown'}</p>
                  </div>
                </div>

                {grant.description && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Description</label>
                    <p className="text-gray-700 mt-1">{grant.description}</p>
                  </div>
                )}

                {grant.eligibility_requirements && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Eligibility Requirements</label>
                    <p className="text-gray-700 mt-1">{grant.eligibility_requirements}</p>
                  </div>
                )}

                {grant.website_url && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Website</label>
                    <a 
                      href={grant.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                    >
                      <Globe className="w-4 h-4" />
                      {grant.website_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Target Modules */}
                {grant.target_modules && grant.target_modules.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Target CRAIverse Modules</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {grant.target_modules.map((module: string) => (
                        <span 
                          key={module} 
                          className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {MODULE_NAMES[module] || module}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {grant.keywords && grant.keywords.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Keywords</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {grant.keywords.map((keyword: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Timeline</h2>
              </div>
              <div className="p-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-4">
                    {/* Application Opens */}
                    <div className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        grant.application_opens && new Date(grant.application_opens) <= new Date() 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Application Opens</p>
                        <p className="text-sm text-gray-500">{formatDate(grant.application_opens)}</p>
                      </div>
                    </div>

                    {/* Application Deadline */}
                    <div className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        deadlineDays !== null && deadlineDays <= 7 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Application Deadline</p>
                        <p className="text-sm text-gray-500">{formatDate(grant.application_deadline)}</p>
                        {deadlineDays !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded ${deadlineUrgency.color}`}>
                            {deadlineUrgency.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Period */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center z-10">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Review Period</p>
                        <p className="text-sm text-gray-500">
                          {grant.review_period_start && grant.review_period_end
                            ? `${formatDate(grant.review_period_start)} - ${formatDate(grant.review_period_end)}`
                            : 'TBD'}
                        </p>
                      </div>
                    </div>

                    {/* Decision Expected */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center z-10">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Decision Expected</p>
                        <p className="text-sm text-gray-500">{formatDate(grant.decision_expected)}</p>
                      </div>
                    </div>

                    {/* Project Period */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center z-10">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Project Period (If Awarded)</p>
                        <p className="text-sm text-gray-500">
                          {grant.project_start_date && grant.project_end_date
                            ? `${formatDate(grant.project_start_date)} - ${formatDate(grant.project_end_date)}`
                            : 'TBD'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts Section */}
            <GrantContactsSection grantId={grant.id} contacts={contacts} />

            {/* Communications Section */}
            <GrantCommunicationsSection grantId={grant.id} communications={communications} contacts={contacts} />

            {/* Documents Section */}
            <GrantDocumentsSection grantId={grant.id} documents={documents} />

            {/* Application Draft Section */}
            <GrantApplicationSection grantId={grant.id} applications={applications} grant={grant} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis Card */}
            <GrantAISection grantId={grant.id} grant={grant} aiAnalysis={aiAnalysis} />

            {/* Milestones Section */}
            <GrantMilestonesSection grantId={grant.id} milestones={milestones} />

            {/* Notes Section */}
            <GrantNotesSection grantId={grant.id} notes={notes} />

            {/* Financial Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Financial Details</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount Available</span>
                  <span className="font-semibold text-green-600">{formatCurrency(grant.amount_available)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount Requested</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(grant.amount_requested)}</span>
                </div>
                {grant.amount_awarded && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount Awarded</span>
                    <span className="font-semibold text-green-600">{formatCurrency(grant.amount_awarded)}</span>
                  </div>
                )}
                {grant.match_required && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Match Required</span>
                    <span className="font-medium text-gray-900">{grant.match_required}%</span>
                  </div>
                )}
                {grant.indirect_rate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Indirect Rate Allowed</span>
                    <span className="font-medium text-gray-900">{grant.indirect_rate}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Grant created</p>
                      <p className="text-xs text-gray-500">{formatDate(grant.created_at)}</p>
                    </div>
                  </div>
                  {grant.submission_date && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Send className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Application submitted</p>
                        <p className="text-xs text-gray-500">{formatDate(grant.submission_date)}</p>
                      </div>
                    </div>
                  )}
                  {communications.slice(0, 3).map((comm: any) => (
                    <div key={comm.id} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-3 h-3 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{comm.communication_type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{formatDate(comm.communication_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

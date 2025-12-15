// app/admin/grants/[id]/components/GrantDocumentsSection.tsx
'use client';

import { useState } from 'react';
import { FileText, Plus, Upload, Download, Trash2, Eye, ChevronDown, ChevronUp, File, Image, FileSpreadsheet } from 'lucide-react';

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  description: string | null;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  application_draft: 'Application Draft',
  final_submission: 'Final Submission',
  award_letter: 'Award Letter',
  rejection_letter: 'Rejection Letter',
  budget: 'Budget',
  narrative: 'Narrative',
  letter_of_support: 'Letter of Support',
  evaluation: 'Evaluation',
  report: 'Report',
  correspondence: 'Correspondence',
  attachment: 'Attachment',
  other: 'Other',
};

const DOC_TYPE_ICONS: Record<string, any> = {
  application_draft: FileText,
  final_submission: FileText,
  budget: FileSpreadsheet,
  default: File,
};

export default function GrantDocumentsSection({ grantId, documents }: { grantId: string; documents: Document[] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div 
        className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          <h2 className="font-semibold text-gray-900">Documents</h2>
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowUpload(true); }}
            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {documents.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No documents uploaded</p>
              <button onClick={() => setShowUpload(true)} className="text-sm text-orange-600 hover:text-orange-700">
                Upload your first document
              </button>
            </div>
          ) : (
            documents.map((doc) => {
              const Icon = DOC_TYPE_ICONS[doc.document_type] || DOC_TYPE_ICONS.default;
              return (
                <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.document_name}</h3>
                        <p className="text-xs text-gray-500">
                          {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                          {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                          {` • ${formatDate(doc.uploaded_at)}`}
                        </p>
                        {doc.description && <p className="text-sm text-gray-600 mt-1">{doc.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.file_url && (
                        <>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </a>
                          <a href={doc.file_url} download
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                            <Download className="w-4 h-4" />
                          </a>
                        </>
                      )}
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// app/admin/grants/[id]/components/GrantCommunicationsSection.tsx
// ... (would create similar component for communications)

// app/admin/grants/[id]/components/GrantMilestonesSection.tsx
export function GrantMilestonesSection({ grantId, milestones }: { grantId: string; milestones: any[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'missed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-indigo-600">📌</span>
          <h2 className="font-semibold text-gray-900">Milestones</h2>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            {milestones.filter(m => m.status === 'pending').length} pending
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </div>

      {isExpanded && (
        <div className="p-4">
          {milestones.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No milestones set</p>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3">
                  <input type="checkbox" checked={milestone.status === 'completed'}
                    className="rounded border-gray-300 text-indigo-600" readOnly />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${milestone.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {milestone.milestone_name}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(milestone.due_date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(milestone.status)}`}>
                    {milestone.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// app/admin/grants/[id]/components/GrantNotesSection.tsx
export function GrantNotesSection({ grantId, notes }: { grantId: string; notes: any[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5">📝</span>
          <h2 className="font-semibold text-gray-900">Notes</h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{notes.length}</span>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700">+ Add</button>
      </div>

      {isExpanded && (
        <div className="p-4 max-h-[300px] overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className={`p-3 rounded-lg ${note.is_pinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                  {note.title && <p className="font-medium text-gray-900 text-sm">{note.title}</p>}
                  <p className="text-sm text-gray-700">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// app/admin/grants/[id]/components/GrantApplicationSection.tsx
export function GrantApplicationSection({ grantId, applications, grant }: { grantId: string; applications: any[]; grant: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">Application</h2>
        </div>
        <a href={`/admin/grants/${grantId}/application`}
          className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
          {applications.length > 0 ? 'Edit Application' : 'Start Application'}
        </a>
      </div>
      <div className="p-4">
        {applications.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No application draft started</p>
            <a href={`/admin/grants/${grantId}/application`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="w-4 h-4" />
              Start Application
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Version {app.version}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    app.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'final' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{app.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(app.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// app/admin/grants/[id]/components/GrantActions.tsx
export function GrantActions({ grant }: { grant: any }) {
  return (
    <div className="relative">
      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
        <span className="sr-only">Actions</span>
        ⋮
      </button>
    </div>
  );
}

// app/admin/grants/[id]/components/GrantCommunicationsSection.tsx
export function GrantCommunicationsSection({ grantId, communications, contacts }: { grantId: string; communications: any[]; contacts: any[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const COMM_TYPE_LABELS: Record<string, string> = {
    email_sent: 'Email Sent',
    email_received: 'Email Received',
    phone_call: 'Phone Call',
    video_call: 'Video Call',
    in_person_meeting: 'In-Person Meeting',
    letter_sent: 'Letter Sent',
    letter_received: 'Letter Received',
    webinar: 'Webinar',
    conference: 'Conference',
    site_visit: 'Site Visit',
    other: 'Other',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5">💬</span>
          <h2 className="font-semibold text-gray-900">Communications</h2>
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{communications.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
            <Plus className="w-4 h-4" />Log
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {communications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No communications logged</p>
            </div>
          ) : (
            communications.map((comm) => (
              <div key={comm.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm">
                    {comm.communication_type === 'email_sent' || comm.communication_type === 'email_received' ? '✉️' :
                     comm.communication_type === 'phone_call' ? '📞' : '💬'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {COMM_TYPE_LABELS[comm.communication_type] || comm.communication_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comm.communication_date).toLocaleDateString()}
                      </span>
                    </div>
                    {comm.subject && <p className="text-sm text-gray-700 font-medium">{comm.subject}</p>}
                    <p className="text-sm text-gray-600 mt-1">{comm.summary}</p>
                    {comm.followup_required && !comm.followup_completed && (
                      <div className="mt-2 px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-700">
                        Follow-up: {new Date(comm.followup_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

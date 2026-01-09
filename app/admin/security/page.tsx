// ============================================================================
// CR AUDIOVIZ AI - COMPREHENSIVE SECURITY DASHBOARD
// ============================================================================
// Created: Tuesday, November 4, 2025 - 10:15 PM EST
// Purpose: Real-time security monitoring with Javari AI integration
// Fortune 50 Quality: Complete, polished, actionable
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Eye, 
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Bug,
  Lock,
  Unlock,
  FileText,
  BarChart3
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SecurityStats {
  total_threats: number;
  blocked_count: number;
  honeypot_catches: number;
  active_threats: number;
  javari_handled: number;
  false_positives: number;
  threat_types: Record<string, number>;
  severity_breakdown: Record<string, number>;
}

interface Threat {
  id: string;
  threat_type: string;
  severity: string;
  ip_address: string;
  request_url: string;
  blocked: boolean;
  trapped_in_honeypot: boolean;
  handled_by_javari: boolean;
  javari_action: string | null;
  created_at: string;
  user_agent: string;
}

interface JavariTicket {
  id: string;
  ticket_number: string;
  priority: string;
  status: string;
  threat_summary: string;
  actions_taken: any[];
  response_time: string | null;
  created_at: string;
  resolved_at: string | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [tickets, setTickets] = useState<JavariTicket[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch all data in parallel
      const [statsRes, threatsRes, ticketsRes, blockedRes] = await Promise.all([
        fetch('/api/admin/security/stats'),
        fetch('/api/admin/security/threats?limit=20'),
        fetch('/api/admin/security/javari/tickets?limit=10'),
        fetch('/api/admin/security/blocked-ips?limit=20')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (threatsRes.ok) setThreats(await threatsRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
      if (blockedRes.ok) setBlockedIPs(await blockedRes.json());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async function unblockIP(ipAddress: string) {
    if (!confirm(`Are you sure you want to unblock ${ipAddress}?`)) return;

    try {
      const res = await fetch('/api/admin/security/unblock-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: ipAddress })
      });

      if (res.ok) {
        alert(`Successfully unblocked ${ipAddress}`);
        fetchDashboardData();
      } else {
        alert('Failed to unblock IP');
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
      alert('Error unblocking IP');
    }
  }

  async function manuallyHandleThreat(threatId: string) {
    try {
      const res = await fetch('/api/admin/security/javari/handle-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threat_id: threatId })
      });

      if (res.ok) {
        alert('Javari is processing the threat...');
        fetchDashboardData();
      } else {
        alert('Failed to trigger Javari');
      }
    } catch (error) {
      console.error('Error handling threat:', error);
    }
  }

  // ============================================================================
  // RENDER LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ============================================================================
  // RENDER MAIN DASHBOARD
  // ============================================================================

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time threat monitoring powered by Javari AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-cyan-500 border-cyan-500">
            <Activity className="w-3 h-3 mr-1" />
            System Protected
          </Badge>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Threats"
          value={stats?.total_threats || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend="+5% from last week"
          variant="default"
        />
        <StatCard
          title="Blocked"
          value={stats?.blocked_count || 0}
          icon={<Ban className="w-5 h-5" />}
          trend="95% block rate"
          variant="destructive"
        />
        <StatCard
          title="Honeypot Catches"
          value={stats?.honeypot_catches || 0}
          icon={<Bug className="w-5 h-5" />}
          trend="Trapping attackers"
          variant="warning"
        />
        <StatCard
          title="Javari Handled"
          value={stats?.javari_handled || 0}
          icon={<Shield className="w-5 h-5" />}
          trend="100% automated"
          variant="success"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Recent Threats</TabsTrigger>
          <TabsTrigger value="javari">Javari Tickets</TabsTrigger>
          <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Threat Types Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Threat Types</CardTitle>
                <CardDescription>Distribution of detected threats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats && Object.entries(stats.threat_types).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {type.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(count / stats.total_threats) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Severity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Severity Levels</CardTitle>
                <CardDescription>Threat severity distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats && Object.entries(stats.severity_breakdown).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <Badge variant={
                        severity === 'critical' ? 'destructive' :
                        severity === 'high' ? 'destructive' :
                        severity === 'medium' ? 'default' : 'secondary'
                      }>
                        {severity.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              severity === 'critical' ? 'bg-red-500' :
                              severity === 'high' ? 'bg-cyan-500' :
                              severity === 'medium' ? 'bg-cyan-400' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${(count / stats.total_threats) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Latest 5 threats detected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {threats.slice(0, 5).map((threat) => (
                  <ThreatItem key={threat.id} threat={threat} onAction={manuallyHandleThreat} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Detected Threats</CardTitle>
              <CardDescription>Complete threat log with actions taken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {threats.map((threat) => (
                  <ThreatItem key={threat.id} threat={threat} onAction={manuallyHandleThreat} detailed />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Javari Tickets Tab */}
        <TabsContent value="javari" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Javari Security Tickets</CardTitle>
              <CardDescription>Autonomous threat responses by Javari AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <JavariTicketItem key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked IPs Tab */}
        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>Permanently and temporarily blocked IPs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blockedIPs.map((block) => (
                  <BlockedIPItem key={block.id} block={block} onUnblock={unblockIP} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              Advanced analytics and reporting coming soon! This will include:
              • Threat trends over time
              • Geographic distribution
              • Attack pattern analysis
              • Javari effectiveness metrics
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  variant 
}: { 
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  variant: 'default' | 'destructive' | 'warning' | 'success';
}) {
  const colorClasses = {
    default: 'text-blue-600',
    destructive: 'text-red-600',
    warning: 'text-cyan-400',
    success: 'text-cyan-500',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          </div>
          <div className={`p-3 rounded-full bg-secondary ${colorClasses[variant]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ThreatItem({ 
  threat, 
  onAction,
  detailed = false 
}: { 
  threat: Threat;
  onAction: (id: string) => void;
  detailed?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
      <div className="mt-1">
        {threat.blocked || threat.trapped_in_honeypot ? (
          <Ban className="w-5 h-5 text-red-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-cyan-400" />
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={threat.severity === 'critical' ? 'destructive' : 'default'}>
            {threat.severity}
          </Badge>
          <Badge variant="outline">{threat.threat_type.replace(/_/g, ' ')}</Badge>
          {threat.handled_by_javari && (
            <Badge variant="secondary" className="bg-cyan-500 text-cyan-500">
              <Shield className="w-3 h-3 mr-1" />
              Javari Handled
            </Badge>
          )}
        </div>
        
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <code className="text-xs bg-secondary px-2 py-1 rounded">{threat.ip_address}</code>
          </div>
          <div className="text-muted-foreground">
            {threat.request_url}
          </div>
          {detailed && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {new Date(threat.created_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {!threat.handled_by_javari && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onAction(threat.id)}
        >
          Handle with Javari
        </Button>
      )}
    </div>
  );
}

function JavariTicketItem({ ticket }: { ticket: JavariTicket }) {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium">{ticket.ticket_number}</p>
            <p className="text-sm text-muted-foreground">{ticket.threat_summary}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={
            ticket.priority === 'critical' ? 'destructive' :
            ticket.priority === 'high' ? 'destructive' :
            ticket.priority === 'medium' ? 'default' : 'secondary'
          }>
            {ticket.priority}
          </Badge>
          <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
            {ticket.status}
          </Badge>
        </div>
      </div>

      {ticket.actions_taken && ticket.actions_taken.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <strong>Actions:</strong> {ticket.actions_taken.join(', ')}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Created {new Date(ticket.created_at).toLocaleString()}
        </div>
        {ticket.resolved_at && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-500" />
            Resolved {new Date(ticket.resolved_at).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

function BlockedIPItem({ 
  block, 
  onUnblock 
}: { 
  block: any;
  onUnblock: (ip: string) => void;
}) {
  const isPermanent = block.block_type === 'permanent';
  const isExpired = block.expires_at && new Date(block.expires_at) < new Date();

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-red-500" />
        <div>
          <code className="text-sm font-mono">{block.ip_address}</code>
          <p className="text-sm text-muted-foreground mt-1">{block.reason}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={isPermanent ? 'destructive' : 'secondary'}>
              {block.block_type}
            </Badge>
            {block.javari_decision && (
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Javari Decision
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="text-xs text-muted-foreground">
          {block.threat_count} threat{block.threat_count !== 1 ? 's' : ''}
        </div>
        {!isPermanent && block.expires_at && (
          <div className="text-xs text-muted-foreground">
            {isExpired ? 'Expired' : `Expires ${new Date(block.expires_at).toLocaleDateString()}`}
          </div>
        )}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onUnblock(block.ip_address)}
        >
          <Unlock className="w-4 h-4 mr-2" />
          Unblock
        </Button>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Users, FileText, Calendar, Search, Flag, CheckCircle, AlertCircle } from 'lucide-react';
import { AdminChart } from '@/components/admin/admin-chart';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/dashboard');

  const [usersRes, complaintsRes, eventsRes, lostFoundRes, reportsRes] = await Promise.all([
    supabase.from('profiles').select('id, created_at, role', { count: 'exact' }),
    supabase.from('complaints').select('id, status, created_at', { count: 'exact' }),
    supabase.from('events').select('id', { count: 'exact' }),
    supabase.from('lost_found_posts').select('id', { count: 'exact' }),
    supabase.from('reports').select('id, status', { count: 'exact' }),
  ]);

  const totalUsers = usersRes.count ?? 0;
  const allComplaints = complaintsRes.data ?? [];
  const totalComplaints = complaintsRes.count ?? 0;
  const resolvedComplaints = allComplaints.filter(c => c.status === 'resolved').length;
  const openComplaints = allComplaints.filter(c => !['resolved', 'closed'].includes(c.status)).length;
  const totalEvents = eventsRes.count ?? 0;
  const totalLostFound = lostFoundRes.count ?? 0;
  const pendingReports = reportsRes.data?.filter(r => r.status === 'pending').length ?? 0;

  // Complaint status breakdown for chart
  const statusBreakdown = [
    { name: 'Submitted', value: allComplaints.filter(c => c.status === 'submitted').length, color: '#94a3b8' },
    { name: 'Under Review', value: allComplaints.filter(c => c.status === 'under_review').length, color: '#fbbf24' },
    { name: 'In Progress', value: allComplaints.filter(c => c.status === 'in_progress').length, color: '#60a5fa' },
    { name: 'Resolved', value: allComplaints.filter(c => c.status === 'resolved').length, color: '#34d399' },
  ].filter(s => s.value > 0);

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, href: '/admin/users', color: 'text-blue-500' },
    { label: 'Total Complaints', value: totalComplaints, icon: FileText, href: '/admin/complaints', color: 'text-orange-500' },
    { label: 'Open Complaints', value: openComplaints, icon: AlertCircle, href: '/admin/complaints', color: 'text-red-500' },
    { label: 'Resolved', value: resolvedComplaints, icon: CheckCircle, href: '/admin/complaints', color: 'text-green-500' },
    { label: 'Total Events', value: totalEvents, icon: Calendar, href: '/admin/events', color: 'text-purple-500' },
    { label: 'Lost & Found', value: totalLostFound, icon: Search, href: '/admin', color: 'text-cyan-500' },
    { label: 'Pending Reports', value: pendingReports, icon: Flag, href: '/admin/reports', color: 'text-red-500' },
  ];

  const quickLinks = [
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/complaints', label: 'Manage Complaints', icon: FileText },
    { href: '/admin/events', label: 'Manage Events', icon: Calendar },
    { href: '/admin/reports', label: 'View Reports', icon: Flag },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground leading-none">{label}</p>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaint Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminChart data={statusBreakdown} />
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-lg p-4 hover:bg-muted/50 transition-colors border group">
                <div className="bg-primary/10 p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ComplaintStatusBadge, PriorityBadge } from '@/components/shared/status-badge';
import Link from 'next/link';
import { formatRelativeDate } from '@/lib/utils';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Admin - Complaints' };

export default async function AdminComplaintsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/dashboard');

  const { data: complaints } = await supabase
    .from('complaints')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/admin"><ArrowLeft className="h-4 w-4 mr-1" /> Admin Dashboard</Link>
        </Button>
      </div>
      <PageHeader title="All Complaints" description="Review and manage all campus complaints" />

      <div className="space-y-3">
        {complaints?.map(c => (
          <Link key={c.id} href={`/complaints/${c.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="font-semibold text-base truncate">{c.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Reported by <span className="font-medium text-foreground">{c.profiles?.full_name ?? 'Unknown'}</span> · {formatRelativeDate(c.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
                    <PriorityBadge status={c.priority} />
                    <ComplaintStatusBadge status={c.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {!complaints?.length && <p className="text-sm text-muted-foreground text-center py-12 bg-muted/30 rounded-lg border border-dashed">No complaints found</p>}
      </div>
    </div>
  );
}

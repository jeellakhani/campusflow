import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { formatRelativeDate } from '@/lib/utils';
import { ArrowLeft, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = { title: 'Admin - Reports' };

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/dashboard');

  const { data: reports } = await supabase
    .from('reports')
    .select('*, reporter:profiles!reporter_id(full_name)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/admin"><ArrowLeft className="h-4 w-4 mr-1" /> Admin Dashboard</Link>
        </Button>
      </div>
      <PageHeader title="Content Reports" description={`${reports?.filter(r => r.status === 'pending').length ?? 0} pending reports requiring review`} />

      <div className="space-y-3">
        {reports?.map(r => (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-1 bg-red-100 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                    <Flag className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-base capitalize">{r.reason.replace('_', ' ')}</p>
                      <Badge variant="secondary" className="text-[10px] uppercase">{r.resource_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reported by {r.reporter?.full_name ?? 'Unknown'} · {formatRelativeDate(r.created_at)}
                    </p>
                    {r.description && (
                      <div className="mt-3 bg-muted/50 p-3 rounded-md border text-sm text-foreground/90">
                        {r.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <Badge
                    variant={r.status === 'pending' ? 'destructive' : r.status === 'resolved' ? 'secondary' : 'outline'}
                    className="capitalize"
                  >
                    {r.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!reports?.length && (
          <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
            <Flag className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium">No reports yet</p>
            <p className="text-sm text-muted-foreground">The community is well-behaved!</p>
          </div>
        )}
      </div>
    </div>
  );
}

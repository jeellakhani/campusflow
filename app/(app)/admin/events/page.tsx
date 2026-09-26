import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { formatEventDate } from '@/lib/utils';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = { title: 'Admin - Events' };

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/dashboard');

  const { data: events } = await supabase
    .from('events')
    .select('*, profiles(full_name), event_participants(id)')
    .order('start_date', { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/admin"><ArrowLeft className="h-4 w-4 mr-1" /> Admin Dashboard</Link>
        </Button>
      </div>
      <PageHeader title="All Events" description={`Managing ${events?.length ?? 0} campus events`} />

      <div className="space-y-3">
        {events?.map(e => (
          <Link key={e.id} href={`/events/${e.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="font-semibold text-base truncate">{e.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Organized by <span className="font-medium text-foreground">{e.profiles?.full_name}</span> · {formatEventDate(e.start_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      <Users className="h-4 w-4" />
                      <span>{e.event_participants?.length ?? 0}</span>
                    </div>
                    <Badge variant="outline" className="capitalize">{e.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {!events?.length && <p className="text-sm text-muted-foreground text-center py-12 bg-muted/30 rounded-lg border border-dashed">No events found</p>}
      </div>
    </div>
  );
}

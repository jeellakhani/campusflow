import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { formatEventDate } from '@/lib/utils';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '@/types';
import Image from 'next/image';

export const metadata = { title: 'Events' };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tab?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await searchParams;
  const now = new Date().toISOString();
  const isUpcoming = params.tab !== 'past';

  let query = supabase
    .from('events')
    .select('*, profiles(full_name, avatar_url), event_participants(id, user_id)')
    .eq('is_published', true)
    .order('start_date', { ascending: isUpcoming });

  if (isUpcoming) {
    query = query.gte('start_date', now);
  } else {
    query = query.lt('start_date', now);
  }

  if (params.category) query = query.eq('category', params.category);

  const { data: events } = await query;

  const categories = ['academic', 'cultural', 'sports', 'technical', 'social', 'workshop', 'seminar', 'other'];

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Campus Events"
        description="Discover and join events happening on campus"
        action={{ label: 'Create Event', href: '/events/new' }}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button variant={isUpcoming ? 'default' : 'outline'} size="sm" asChild>
          <Link href="/events">Upcoming</Link>
        </Button>
        <Button variant={!isUpcoming ? 'default' : 'outline'} size="sm" asChild>
          <Link href="/events?tab=past">Past</Link>
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={!params.category ? 'secondary' : 'outline'} size="sm" asChild>
          <Link href={`/events${params.tab ? `?tab=${params.tab}` : ''}`}>All</Link>
        </Button>
        {categories.map(c => (
          <Button key={c} variant={params.category === c ? 'secondary' : 'outline'} size="sm" asChild>
            <Link href={`/events?${params.tab ? `tab=${params.tab}&` : ''}category=${c}`}>
              {c}
            </Link>
          </Button>
        ))}
      </div>

      {!events || events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Be the first to create an event for your campus community."
          action={{ label: 'Create Event', href: '/events/new' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(events as Event[]).map((event) => {
            const participantCount = event.event_participants?.length ?? 0;
            const isJoined = event.event_participants?.some((p: any) => p.user_id === user.id);

            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:bg-muted/20 transition-colors h-full flex flex-col">
                  {event.cover_image_url ? (
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <Image src={event.cover_image_url} alt={event.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-primary/40" />
                    </div>
                  )}
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm line-clamp-2">{event.title}</h3>
                      {isJoined && (
                        <Badge variant="secondary" className="text-xs shrink-0">Joined</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">{event.description}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatEventDate(event.start_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {participantCount} joined
                        {event.max_participants && ` / ${event.max_participants} max`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

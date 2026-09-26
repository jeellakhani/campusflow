import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { JoinLeaveButton } from '@/components/events/join-leave-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatEventDate, getInitials } from '@/lib/utils';
import { Calendar, MapPin, Users, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { id } = await params;

  const { data: event } = await supabase
    .from('events')
    .select('*, profiles(full_name, avatar_url, email), event_participants(id, user_id, joined_at, profiles(full_name, avatar_url))')
    .eq('id', id)
    .single();

  if (!event) notFound();

  const participantCount = event.event_participants?.length ?? 0;
  const isJoined = event.event_participants?.some((p: { user_id: string }) => p.user_id === user.id);
  const isFull = event.max_participants !== null && participantCount >= event.max_participants;
  const isOrganizer = event.organizer_id === user.id;
  const isPast = new Date(event.start_date) < new Date();

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/events"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Events</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {event.cover_image_url && (
          <div className="rounded-lg overflow-hidden aspect-video relative">
            <Image src={event.cover_image_url} alt={event.title} fill className="object-cover bg-muted" />
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize text-xs">{event.category}</Badge>
                  {isPast && <Badge variant="secondary" className="text-xs">Past</Badge>}
                </div>
                <h1 className="text-xl font-semibold">{event.title}</h1>
              </div>
              {!isPast && !isOrganizer && (
                <JoinLeaveButton eventId={id} isJoined={!!isJoined} isFull={isFull && !isJoined} />
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-6 whitespace-pre-wrap">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatEventDate(event.start_date)}</span>
              </div>
              {event.end_date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Ends: {formatEventDate(event.end_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{participantCount} joined{event.max_participants ? ` / ${event.max_participants} max` : ''}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t">
              <Avatar className="h-7 w-7">
                <AvatarImage src={event.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{getInitials(event.profiles?.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm">Organized by </span>
                <span className="text-sm font-medium">{event.profiles?.full_name ?? 'Unknown'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        {event.event_participants && event.event_participants.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Participants ({participantCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {event.event_participants.slice(0, 20).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px]">{getInitials(p.profiles?.full_name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium pr-1">{p.profiles?.full_name ?? 'Unknown'}</span>
                  </div>
                ))}
                {participantCount > 20 && (
                  <span className="text-sm text-muted-foreground flex items-center">+{participantCount - 20} more</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

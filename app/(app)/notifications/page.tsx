import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { MarkAllReadButton } from '@/components/notifications/mark-all-read-button';
import { formatRelativeDate } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Notification } from '@/types';

export const metadata = { title: 'Notifications' };

const RESOURCE_LINKS: Record<string, (id: string) => string> = {
  complaint: (id) => `/complaints/${id}`,
  event: (id) => `/events/${id}`,
  question: (id) => `/community/${id}`,
  answer: (id) => `/community/${id}`,
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!actor_id(full_name, avatar_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length ?? 0;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'You are all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {!notifications || notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="We'll let you know when there's activity on your posts or events."
        />
      ) : (
        <div className="space-y-3">
          {(notifications as unknown as Notification[]).map((notif) => {
            const resourceLink = notif.resource_type && notif.resource_id
              ? RESOURCE_LINKS[notif.resource_type]?.(notif.resource_id)
              : undefined;

            const content = (
              <Card className={cn(
                'transition-colors',
                !notif.is_read ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
              )}>
                <CardContent className="p-4 flex gap-4">
                  <div className="mt-1">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border",
                      !notif.is_read ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Bell className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm leading-tight">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1.5 font-medium">{formatRelativeDate(notif.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            );

            if (resourceLink) {
              return <Link key={notif.id} href={resourceLink} className="block">{content}</Link>;
            }
            return <div key={notif.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}

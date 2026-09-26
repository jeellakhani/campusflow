import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/page-header';
import { RoleBadge } from '@/components/shared/status-badge';
import { getInitials, formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = { title: 'Admin - Users' };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect('/dashboard');

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/admin"><ArrowLeft className="h-4 w-4 mr-1" /> Admin Dashboard</Link>
        </Button>
      </div>
      <PageHeader title="All Users" description={`Managing ${users?.length ?? 0} registered users`} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.map(u => (
          <Card key={u.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 shrink-0 border">
                  <AvatarImage src={u.avatar_url ?? undefined} />
                  <AvatarFallback>{getInitials(u.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold text-base truncate">{u.full_name ?? 'Unnamed User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  <div className="flex items-center justify-between pt-2 mt-1">
                    <RoleBadge status={u.role} />
                    <span className="text-[10px] text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!users?.length && <p className="text-sm text-muted-foreground text-center py-12 col-span-full bg-muted/30 rounded-lg border border-dashed">No users found</p>}
      </div>
    </div>
  );
}

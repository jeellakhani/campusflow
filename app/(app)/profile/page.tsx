import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitials, formatDate, formatRelativeDate } from '@/lib/utils';
import { RoleBadge, ComplaintStatusBadge } from '@/components/shared/status-badge';
import { Calendar, FileText, MessageCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { Profile } from '@/types';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const [complaintsRes, eventsRes, questionsRes] = await Promise.all([
    supabase.from('complaints').select('id, title, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('events').select('id, title, start_date, category, created_at').eq('organizer_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('questions').select('id, title, is_resolved, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ]);

  if (!profile) redirect('/login');

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-background shadow-sm">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              <h2 className="font-bold text-xl">{profile.full_name ?? 'Student'}</h2>
              <p className="text-sm text-muted-foreground mb-1">{profile.email}</p>
              {profile.username && (
                <p className="text-sm font-medium text-primary bg-primary/10 inline-block px-2 py-0.5 rounded-full mt-1 mb-4">
                  @{profile.username}
                </p>
              )}
              <div className="flex justify-center mt-2">
                <RoleBadge status={profile.role} />
              </div>
              {profile.bio && (
                <p className="text-sm text-foreground/80 mt-4 text-left border-t pt-4">
                  {profile.bio}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" /> Academic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">College</p>
                <p className="text-sm font-medium">{profile.college || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Department</p>
                <p className="text-sm font-medium">{profile.department || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Year of Study</p>
                <p className="text-sm font-medium">{profile.year_of_study ? `Year ${profile.year_of_study}` : 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Member Since</p>
                <p className="text-sm font-medium">{formatDate(profile.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ProfileEditForm profile={profile as Profile} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">My Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="complaints">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="complaints" className="flex-1">Complaints</TabsTrigger>
                  <TabsTrigger value="events" className="flex-1">Events</TabsTrigger>
                  <TabsTrigger value="questions" className="flex-1">Questions</TabsTrigger>
                </TabsList>

                <TabsContent value="complaints" className="space-y-3">
                  {complaintsRes.data?.map(c => (
                    <Link key={c.id} href={`/complaints/${c.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors bg-card">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeDate(c.created_at)}</p>
                        </div>
                      </div>
                      <ComplaintStatusBadge status={c.status} />
                    </Link>
                  ))}
                  {!complaintsRes.data?.length && <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-lg border border-dashed">No complaints submitted</p>}
                </TabsContent>

                <TabsContent value="events" className="space-y-3">
                  {eventsRes.data?.map(e => (
                    <Link key={e.id} href={`/events/${e.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors bg-card">
                      <div className="flex items-center gap-3 min-w-0">
                        <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeDate(e.created_at)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize shrink-0">{e.category}</Badge>
                    </Link>
                  ))}
                  {!eventsRes.data?.length && <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-lg border border-dashed">No events organized</p>}
                </TabsContent>

                <TabsContent value="questions" className="space-y-3">
                  {questionsRes.data?.map(q => (
                    <Link key={q.id} href={`/community/${q.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors bg-card">
                      <div className="flex items-center gap-3 min-w-0">
                        <MessageCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{q.title}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeDate(q.created_at)}</p>
                        </div>
                      </div>
                      {q.is_resolved && <Badge className="bg-green-100 text-green-800 border-none shrink-0">Resolved</Badge>}
                    </Link>
                  ))}
                  {!questionsRes.data?.length && <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-lg border border-dashed">No questions asked</p>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

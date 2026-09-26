import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import Link from "next/link";
import { FileText, Calendar, Search, MessageCircle, ArrowRight } from "lucide-react";
import { formatRelativeDate, formatEventDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch dashboard data in parallel
  const [complaintsRes, eventsRes, questionsRes, lfRes] = await Promise.all([
    supabase.from("complaints").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("events").select("*, profiles(full_name)").eq("is_published", true).gte("start_date", new Date().toISOString()).order("start_date").limit(3),
    supabase.from("questions").select("*, profiles(full_name, avatar_url)").order("created_at", { ascending: false }).limit(4),
    supabase.from("lost_found_posts").select("*").order("created_at", { ascending: false }).limit(3),
  ]);

  const complaints = complaintsRes.data || [];
  const events = eventsRes.data || [];
  const questions = questionsRes.data || [];
  const lostFound = lfRes.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back to CampusFlow. Here's what's happening.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.length}</div>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">scheduled this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost & Found</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lostFound.length}</div>
            <p className="text-xs text-muted-foreground">recently reported</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discussions</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">in community Q&A</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Complaints</CardTitle>
            <Link href="/complaints" className="text-xs text-primary hover:underline flex items-center">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent complaints.</p>
              ) : (
                complaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <Link href={`/complaints/${complaint.id}`} className="font-medium hover:underline text-sm">
                        {complaint.title}
                      </Link>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span>{formatRelativeDate(complaint.created_at)}</span>
                        <span>•</span>
                        <span className="capitalize">{complaint.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge status={complaint.priority} />
                      <ComplaintStatusBadge status={complaint.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Upcoming Events</CardTitle>
              <Link href="/events" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events.</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-md p-2 min-w-12 shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold">
                          {new Date(event.start_date).getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Link href={`/events/${event.id}`} className="font-medium text-sm hover:underline line-clamp-1">
                          {event.title}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1">{event.location}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Community Q&A</CardTitle>
              <Link href="/community" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No discussions yet.</p>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={q.profiles?.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">{getInitials(q.profiles?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5 min-w-0">
                        <Link href={`/community/${q.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                          {q.title}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {q.profiles?.full_name} • {formatRelativeDate(q.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

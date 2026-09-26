import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ComplaintStatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { formatRelativeDate } from "@/lib/utils";
import { FileText, MapPin } from "lucide-react";
import { Complaint } from "@/types";

export const metadata = { title: "Complaints" };

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  let query = supabase
    .from("complaints")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data: complaints } = await query;

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="My Complaints"
        description="Track and manage the issues you've reported."
        action={{ label: "New Complaint", href: "/complaints/new" }}
      />

      <div className="flex gap-2 mb-6">
        <Button variant={!params.status || params.status === "all" ? "default" : "outline"} size="sm" asChild>
          <Link href="/complaints">All</Link>
        </Button>
        <Button variant={params.status === "submitted" ? "default" : "outline"} size="sm" asChild>
          <Link href="/complaints?status=submitted">Submitted</Link>
        </Button>
        <Button variant={params.status === "in_progress" ? "default" : "outline"} size="sm" asChild>
          <Link href="/complaints?status=in_progress">In Progress</Link>
        </Button>
        <Button variant={params.status === "resolved" ? "default" : "outline"} size="sm" asChild>
          <Link href="/complaints?status=resolved">Resolved</Link>
        </Button>
      </div>

      {!complaints || complaints.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No complaints found"
          description="You haven't reported any issues matching this filter."
          action={{ label: "Report Issue", href: "/complaints/new" }}
        />
      ) : (
        <div className="grid gap-4">
          {(complaints as Complaint[]).map((complaint) => (
            <Link key={complaint.id} href={`/complaints/${complaint.id}`}>
              <Card className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base">{complaint.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{complaint.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {complaint.location}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{complaint.category}</span>
                        <span>•</span>
                        <span>{formatRelativeDate(complaint.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge status={complaint.priority} />
                      <ComplaintStatusBadge status={complaint.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

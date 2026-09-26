import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintStatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { StatusTimeline } from "@/components/complaints/status-timeline";
import { CommentSection } from "@/components/complaints/comment-section";
import { StatusUpdateForm } from "@/components/complaints/status-update-form";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = ["admin", "moderator"].includes(profile?.role || "student");

  const { data: complaint } = await supabase
    .from("complaints")
    .select("*, profiles(full_name, email)")
    .eq("id", id)
    .single();

  if (!complaint) notFound();
  if (complaint.user_id !== user.id && !isAdmin) redirect("/complaints");

  const { data: comments } = await supabase
    .from("complaint_comments")
    .select("*, profiles(full_name, avatar_url, role)")
    .eq("complaint_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={isAdmin ? "/admin/complaints" : "/complaints"}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold leading-none tracking-tight">{complaint.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Reported by {complaint.profiles?.full_name} on {formatDate(complaint.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <ComplaintStatusBadge status={complaint.status} />
                  <PriorityBadge status={complaint.priority} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{complaint.location}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">Category: {complaint.category}</span>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {complaint.image_url && (
                <div className="mt-4 rounded-md overflow-hidden border">
                  <div className="relative aspect-video max-w-lg">
                    <Image src={complaint.image_url} alt="Complaint attachment" fill className="object-contain bg-muted" />
                  </div>
                </div>
              )}

              {complaint.admin_note && (
                <div className="mt-6 bg-muted/50 p-4 rounded-md border-l-4 border-primary">
                  <h4 className="text-sm font-semibold mb-1">Admin Note</h4>
                  <p className="text-sm whitespace-pre-wrap">{complaint.admin_note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <CommentSection complaintId={id} comments={comments || []} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline 
                currentStatus={complaint.status} 
                createdAt={complaint.created_at}
                resolvedAt={complaint.resolved_at}
              />
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusUpdateForm 
                  complaintId={id} 
                  currentStatus={complaint.status} 
                  currentNote={complaint.admin_note || ""} 
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

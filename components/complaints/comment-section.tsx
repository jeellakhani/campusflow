"use client";

import { useTransition } from "react";
import { addComment } from "@/app/actions/complaints";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { ComplaintComment } from "@/types";

interface CommentSectionProps {
  complaintId: string;
  comments: ComplaintComment[];
}

export function CommentSection({ complaintId, comments }: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await addComment(complaintId, formData);
      if (result?.error) toast.error(result.error);
      else {
        const form = document.getElementById("comment-form") as HTMLFormElement;
        form?.reset();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{getInitials(comment.profiles?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.profiles?.full_name}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
                  {comment.profiles?.role !== "student" && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded capitalize">
                      {comment.profiles?.role}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Start the discussion!</p>
          )}
        </div>

        <div className="border-t pt-4">
          <form id="comment-form" action={handleSubmit} className="flex gap-3">
            <Textarea 
              name="content" 
              placeholder="Add a comment..." 
              required 
              rows={2} 
              className="resize-none min-h-0" 
            />
            <Button type="submit" disabled={isPending} className="shrink-0 h-auto">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

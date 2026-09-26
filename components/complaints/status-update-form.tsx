"use client";

import { useTransition } from "react";
import { updateComplaintStatus } from "@/app/actions/complaints";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StatusUpdateFormProps {
  complaintId: string;
  currentStatus: string;
  currentNote: string;
}

const statuses = [
  { id: "submitted", label: "Submitted" },
  { id: "under_review", label: "Under Review" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
];

export function StatusUpdateForm({ complaintId, currentStatus, currentNote }: StatusUpdateFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateComplaintStatus(complaintId, formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Status updated successfully");
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Update Status</Label>
        <select 
          name="status" 
          id="status" 
          defaultValue={currentStatus} 
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin_note">Admin Note (visible to user)</Label>
        <Textarea 
          id="admin_note" 
          name="admin_note" 
          defaultValue={currentNote} 
          placeholder="Add a note explaining the status change..." 
          rows={3} 
        />
      </div>

      <Button type="submit" size="sm" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Update Complaint
      </Button>
    </form>
  );
}

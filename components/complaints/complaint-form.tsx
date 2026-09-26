"use client";

import { useTransition } from "react";
import { createComplaint } from "@/app/actions/complaints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { COMPLAINT_STATUS_COLORS } from "@/lib/utils";

const categories = ["electricity", "water", "hostel", "classroom", "internet", "cleaning", "security", "other"];
const priorities = ["low", "medium", "high", "urgent"];

export function ComplaintForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createComplaint(formData);
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" placeholder="Brief summary of the issue" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" placeholder="Provide more details..." rows={4} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <select name="category" id="category" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="">Select category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <select name="priority" id="priority" defaultValue="medium" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input id="location" name="location" placeholder="e.g. Room 302, Block B" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image Attachment (optional)</Label>
        <Input id="image" name="image" type="file" accept="image/*" className="file:text-sm file:font-medium" />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Submit Complaint
      </Button>
    </form>
  );
}

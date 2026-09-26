"use client";

import { useTransition } from "react";
import { createLostFoundPost } from "@/app/actions/lost-found";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const categories = ["electronics", "documents", "clothing", "accessories", "books", "keys", "wallet", "phone", "other"];

export function LostFoundForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createLostFoundPost(formData);
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Report Type *</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="lost" required className="accent-primary" />
            <span className="text-sm">I lost an item</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="found" required className="accent-primary" />
            <span className="text-sm">I found an item</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="item_name">Item Name *</Label>
        <Input id="item_name" name="item_name" placeholder="e.g. Blue Water Bottle, ID Card" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" placeholder="Provide details like color, brand, or distinguishing features..." rows={3} required />
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
          <Label htmlFor="date_lost_found">Date Lost/Found *</Label>
          <Input id="date_lost_found" name="date_lost_found" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input id="location" name="location" placeholder="Where was it lost or found?" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_info">Contact Info (Optional)</Label>
        <Input id="contact_info" name="contact_info" placeholder="How should people reach you? (Phone/Room No.)" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image Attachment (optional)</Label>
        <Input id="image" name="image" type="file" accept="image/*" className="file:text-sm file:font-medium" />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Post Item
      </Button>
    </form>
  );
}

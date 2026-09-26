"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { complaintSchema, commentSchema, statusUpdateSchema } from "@/lib/validations/complaint";
import { uploadFile } from "@/lib/utils";
import { z } from "zod";

export async function createComplaint(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      location: formData.get("location"),
      priority: formData.get("priority"),
    };

    const validatedData = complaintSchema.parse(rawData);

    // Handle image upload
    let imageUrl = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFile(supabase, imageFile, "complaint-images");
    }

    const { error } = await supabase.from("complaints").insert({
      ...validatedData,
      user_id: user.id,
      image_url: imageUrl,
    });

    if (error) throw error;

    revalidatePath("/complaints");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.errors[0].message };
    return { error: "Failed to create complaint" };
  }
}

export async function updateComplaintStatus(complaintId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify admin/moderator
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "moderator"].includes(profile.role)) {
    return { error: "Unauthorized" };
  }

  try {
    const rawData = {
      status: formData.get("status"),
      admin_note: formData.get("admin_note"),
    };

    const validatedData = statusUpdateSchema.parse(rawData);
    const updateData: any = { status: validatedData.status };
    if (validatedData.admin_note) updateData.admin_note = validatedData.admin_note;
    if (validatedData.status === "resolved") updateData.resolved_at = new Date().toISOString();

    const { data: complaint, error } = await supabase
      .from("complaints")
      .update(updateData)
      .eq("id", complaintId)
      .select("user_id, title")
      .single();

    if (error) throw error;

    // Send notification to user
    await supabase.from("notifications").insert({
      user_id: complaint.user_id,
      actor_id: user.id,
      type: "complaint_status",
      title: "Complaint Status Updated",
      message: `Your complaint "${complaint.title}" is now ${validatedData.status.replace('_', ' ')}.`,
      resource_type: "complaint",
      resource_id: complaintId,
    });

    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath("/complaints");
    return { success: true };
  } catch (err) {
    return { error: "Failed to update status" };
  }
}

export async function addComment(complaintId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const content = formData.get("content");
    const validatedData = commentSchema.parse({ content });

    const { error } = await supabase.from("complaint_comments").insert({
      complaint_id: complaintId,
      user_id: user.id,
      content: validatedData.content,
    });

    if (error) throw error;

    // Notify author if comment is from someone else
    const { data: complaint } = await supabase.from("complaints").select("user_id, title").eq("id", complaintId).single();
    if (complaint && complaint.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: complaint.user_id,
        actor_id: user.id,
        type: "complaint_comment",
        title: "New Comment",
        message: `Someone commented on your complaint "${complaint.title}"`,
        resource_type: "complaint",
        resource_id: complaintId,
      });
    }

    revalidatePath(`/complaints/${complaintId}`);
    return { success: true };
  } catch (err) {
    return { error: "Failed to add comment" };
  }
}

export async function deleteComplaint(complaintId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("complaints").delete().eq("id", complaintId);
  if (error) return { error: "Failed to delete" };

  revalidatePath("/complaints");
  return { success: true };
}

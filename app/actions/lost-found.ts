"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { lostFoundSchema } from "@/lib/validations/lost-found";
import { uploadFile } from "@/lib/utils";
import { z } from "zod";

export async function createLostFoundPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const rawData = {
      type: formData.get("type"),
      item_name: formData.get("item_name"),
      description: formData.get("description"),
      category: formData.get("category"),
      location: formData.get("location"),
      date_lost_found: formData.get("date_lost_found"),
      contact_info: formData.get("contact_info") || undefined,
    };

    const validatedData = lostFoundSchema.parse(rawData);

    let imageUrl = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFile(supabase, imageFile, "lost-found-images");
    }

    const { error } = await supabase.from("lost_found_posts").insert({
      ...validatedData,
      user_id: user.id,
      image_url: imageUrl,
    });

    if (error) throw error;

    revalidatePath("/lost-found");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.errors[0].message };
    return { error: "Failed to create post" };
  }
}

export async function markAsResolved(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("lost_found_posts")
    .update({ is_resolved: true })
    .match({ id: postId, user_id: user.id });

  if (error) return { error: "Failed to resolve" };

  revalidatePath("/lost-found");
  return { success: true };
}

export async function deleteLostFoundPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("lost_found_posts").delete().match({ id: postId, user_id: user.id });
  if (error) return { error: "Failed to delete" };

  revalidatePath("/lost-found");
  return { success: true };
}

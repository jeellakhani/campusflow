"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { profileSchema } from "@/lib/validations/profile";
import { uploadFile } from "@/lib/utils";
import { z } from "zod";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const rawData = {
      full_name: formData.get("full_name"),
      username: formData.get("username"),
      college: formData.get("college") || undefined,
      department: formData.get("department") || undefined,
      year_of_study: formData.get("year_of_study") ? parseInt(formData.get("year_of_study") as string) : undefined,
      bio: formData.get("bio") || undefined,
    };

    const validatedData = profileSchema.parse(rawData);

    let avatarUrl = undefined;
    const avatarFile = formData.get("avatar") as File | null;
    if (avatarFile && avatarFile.size > 0) {
      avatarUrl = await uploadFile(supabase, avatarFile, "avatars");
    }

    const updateData = { ...validatedData };
    if (avatarUrl) {
      (updateData as any).avatar_url = avatarUrl;
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id);

    if (error) {
      if (error.code === '23505') return { error: "Username already taken" };
      throw error;
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.errors[0].message };
    return { error: "Failed to update profile" };
  }
}

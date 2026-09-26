"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { eventSchema } from "@/lib/validations/event";
import { uploadFile } from "@/lib/utils";
import { z } from "zod";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      location: formData.get("location"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date") || undefined,
      max_participants: formData.get("max_participants") ? parseInt(formData.get("max_participants") as string) : undefined,
      registration_deadline: formData.get("registration_deadline") || undefined,
    };

    const validatedData = eventSchema.parse(rawData);

    let coverUrl = null;
    const coverFile = formData.get("cover_image") as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadFile(supabase, coverFile, "event-covers");
    }

    const { error } = await supabase.from("events").insert({
      ...validatedData,
      organizer_id: user.id,
      cover_image_url: coverUrl,
    });

    if (error) throw error;

    revalidatePath("/events");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.errors[0].message };
    return { error: "Failed to create event" };
  }
}

export async function joinEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const { error } = await supabase.from("event_participants").insert({
      event_id: eventId,
      user_id: user.id,
    });

    if (error) {
      if (error.code === '23505') return { error: "Already joined" };
      throw error;
    }

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return { success: true };
  } catch (err) {
    return { error: "Failed to join event" };
  }
}

export async function leaveEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("event_participants").delete().match({
    event_id: eventId,
    user_id: user.id,
  });

  if (error) return { error: "Failed to leave" };

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: "Failed to delete" };

  revalidatePath("/events");
  return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { questionSchema, answerSchema } from "@/lib/validations/question";
import { z } from "zod";

export async function createQuestion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const tagsStr = formData.get("tags") as string;
    const tags = tagsStr ? tagsStr.split(",").filter(Boolean) : [];

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      tags,
    };

    const validatedData = questionSchema.parse(rawData);

    const { error } = await supabase.from("questions").insert({
      ...validatedData,
      user_id: user.id,
    });

    if (error) throw error;

    revalidatePath("/community");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.errors[0].message };
    return { error: "Failed to post question" };
  }
}

export async function createAnswer(questionId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const rawData = { content: formData.get("content") };
    const validatedData = answerSchema.parse(rawData);

    const { error } = await supabase.from("answers").insert({
      question_id: questionId,
      user_id: user.id,
      content: validatedData.content,
    });

    if (error) throw error;

    // Notify question author
    const { data: q } = await supabase.from("questions").select("user_id, title").eq("id", questionId).single();
    if (q && q.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: q.user_id,
        actor_id: user.id,
        type: "question_answer",
        title: "New Answer",
        message: `Someone answered your question "${q.title}"`,
        resource_type: "question",
        resource_id: questionId,
      });
    }

    revalidatePath(`/community/${questionId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) return { error: err.errors[0].message };
    return { error: "Failed to post answer" };
  }
}

export async function acceptAnswer(answerId: string, questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Start transaction equivalent (requires plpgsql or multiple steps)
  // Step 1: verify ownership
  const { data: q } = await supabase.from("questions").select("user_id").eq("id", questionId).single();
  if (!q || q.user_id !== user.id) return { error: "Unauthorized" };

  // Step 2: mark question resolved
  await supabase.from("questions").update({ is_resolved: true }).eq("id", questionId);
  
  // Step 3: mark answer accepted
  await supabase.from("answers").update({ is_accepted: true }).eq("id", answerId);

  revalidatePath(`/community/${questionId}`);
  return { success: true };
}

export async function toggleQuestionLike(questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("question_likes")
    .select("id")
    .match({ question_id: questionId, user_id: user.id })
    .single();

  if (existing) {
    await supabase.from("question_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("question_likes").insert({ question_id: questionId, user_id: user.id });
  }

  revalidatePath(`/community/${questionId}`);
  return { success: true };
}

export async function toggleAnswerLike(answerId: string, questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("answer_likes")
    .select("id")
    .match({ answer_id: answerId, user_id: user.id })
    .single();

  if (existing) {
    await supabase.from("answer_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("answer_likes").insert({ answer_id: answerId, user_id: user.id });
  }

  revalidatePath(`/community/${questionId}`);
  return { success: true };
}

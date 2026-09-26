import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { AnswerSection } from '@/components/community/answer-section';
import { LikeButton } from '@/components/community/like-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { id } = await params;



  const { data: question } = await supabase
    .from('questions')
    .select('*, profiles(full_name, avatar_url)')
    .eq('id', id)
    .single();

  if (!question) notFound();

  const [answersRes, likesRes, userLikeRes] = await Promise.all([
    supabase.from('answers').select('*, profiles(full_name, avatar_url)').eq('question_id', id).order('is_accepted', { ascending: false }).order('created_at'),
    supabase.from('question_likes').select('id').eq('question_id', id),
    supabase.from('question_likes').select('id').eq('question_id', id).eq('user_id', user.id).single(),
  ]);

  const answers = answersRes.data ?? [];
  const likeCount = likesRes.data?.length ?? 0;
  const isLiked = !!userLikeRes.data;
  const isOwner = question.user_id === user.id;

  // Get answer like counts
  const answerIds = answers.map(a => a.id);
  const [answerLikesRes, userAnswerLikesRes] = await Promise.all([
    answerIds.length > 0 ? supabase.from('answer_likes').select('answer_id').in('answer_id', answerIds) : Promise.resolve({ data: [] }),
    answerIds.length > 0 ? supabase.from('answer_likes').select('answer_id').in('answer_id', answerIds).eq('user_id', user.id) : Promise.resolve({ data: [] }),
  ]);

  const answerLikeCounts: Record<string, number> = {};
  const userAnswerLikes = new Set(userAnswerLikesRes.data?.map(l => l.answer_id) ?? []);
  answerLikesRes.data?.forEach(l => { answerLikeCounts[l.answer_id] = (answerLikeCounts[l.answer_id] ?? 0) + 1; });

  const enrichedAnswers = answers.map(a => ({
    ...a,
    like_count: answerLikeCounts[a.id] ?? 0,
    is_liked: userAnswerLikes.has(a.id),
  }));

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/community"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden border-t-4 border-t-primary">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="capitalize text-xs font-medium">{question.category}</Badge>
                  {question.is_resolved && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-transparent text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Resolved
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-4">{question.title}</h1>
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                  <p className="whitespace-pre-wrap">{question.description}</p>
                </div>
              </div>
            </div>

            {question.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 my-6">
                {question.tags.map((tag: string) => (
                  <span key={tag} className="text-xs text-primary bg-primary/10 rounded px-2 py-1 font-medium">#{tag}</span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={question.profiles?.avatar_url ?? undefined} />
                  <AvatarFallback>{getInitials(question.profiles?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{question.profiles?.full_name}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(question.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground hidden sm:inline-block">{question.views || 0} views</span>
                <LikeButton
                  resourceId={question.id}
                  resourceType="question"
                  questionId={question.id}
                  likeCount={likeCount}
                  isLiked={isLiked}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <AnswerSection
          questionId={id}
          answers={enrichedAnswers as any}
          currentUserId={user.id}
          isQuestionOwner={isOwner}
          isResolved={question.is_resolved}
        />
      </div>
    </div>
  );
}

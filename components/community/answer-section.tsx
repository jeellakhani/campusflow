'use client';

import { useTransition } from 'react';
import { createAnswer, acceptAnswer } from '@/app/actions/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { LikeButton } from './like-button';
import { Answer } from '@/types';

interface AnswerSectionProps {
  questionId: string;
  answers: (Answer & { like_count: number; is_liked: boolean })[];
  currentUserId: string;
  isQuestionOwner: boolean;
  isResolved: boolean;
}

export function AnswerSection({ questionId, answers, currentUserId, isQuestionOwner, isResolved }: AnswerSectionProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createAnswer(questionId, formData);
      if (result?.error) toast.error(result.error);
      else {
        const form = document.getElementById('answer-form') as HTMLFormElement;
        form?.reset();
        toast.success('Answer posted!');
      }
    });
  };

  const handleAccept = (answerId: string) => {
    startTransition(async () => {
      const result = await acceptAnswer(answerId, questionId);
      if (result?.error) toast.error(result.error);
      else toast.success('Answer accepted!');
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">{answers.length} Answer{answers.length !== 1 ? 's' : ''}</h2>

      <div className="space-y-4">
        {answers.map((answer) => (
          <Card key={answer.id} className={answer.is_accepted ? 'border-green-500 shadow-sm' : ''}>
            <CardContent className="p-5">
              <div className="flex gap-4">
                {/* Voting Column */}
                <div className="flex flex-col items-center gap-2 pt-2">
                  <LikeButton
                    resourceId={answer.id}
                    resourceType="answer"
                    questionId={questionId}
                    likeCount={answer.like_count}
                    isLiked={answer.is_liked}
                    vertical
                  />
                  {answer.is_accepted && (
                    <CheckCircle className="h-6 w-6 text-green-500 mt-2" />
                  )}
                  {isQuestionOwner && !isResolved && !answer.is_accepted && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAccept(answer.id)}
                      disabled={isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-green-600 mt-2"
                      title="Accept this answer"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap mb-6">
                    {answer.content}
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <div className="bg-muted/50 rounded-md p-3 min-w-48 text-sm flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={answer.profiles?.avatar_url ?? undefined} />
                        <AvatarFallback>{getInitials(answer.profiles?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">{answer.profiles?.full_name}</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeDate(answer.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {answers.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No answers yet</p>
          <p className="text-sm text-muted-foreground">Be the first to share your knowledge!</p>
        </div>
      )}

      {/* Answer form */}
      <Card className="mt-8 border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Your Answer</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form id="answer-form" action={handleSubmit} className="space-y-4">
            <Textarea name="content" placeholder="Write a detailed, helpful answer..." rows={8} required className="resize-y" />
            <Button type="submit" disabled={isPending} size="lg">
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Post Answer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useTransition } from 'react';
import { toggleQuestionLike, toggleAnswerLike } from '@/app/actions/community';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  resourceId: string;
  resourceType: 'question' | 'answer';
  questionId: string;
  likeCount: number;
  isLiked: boolean;
  vertical?: boolean;
}

export function LikeButton({ resourceId, resourceType, questionId, likeCount, isLiked, vertical = false }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      if (resourceType === 'question') {
        await toggleQuestionLike(resourceId);
      } else {
        await toggleAnswerLike(resourceId, questionId);
      }
    });
  };

  if (vertical) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isPending}
        className={cn('flex flex-col h-auto w-12 py-2 gap-1 rounded-full border border-transparent hover:border-border', isLiked && 'text-primary bg-primary/5')}
      >
        <ChevronUp className={cn('h-6 w-6', isLiked && 'stroke-[3px]')} />
        <span className="text-sm font-medium">{likeCount}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn('gap-2', isLiked && 'bg-primary/5 border-primary/30 text-primary')}
    >
      <ChevronUp className={cn('h-4 w-4', isLiked && 'stroke-[3px]')} />
      <span className="font-medium">{likeCount}</span>
    </Button>
  );
}

'use client';

import { useTransition } from 'react';
import { joinEvent, leaveEvent } from '@/app/actions/events';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';

interface JoinLeaveButtonProps {
  eventId: string;
  isJoined: boolean;
  isFull: boolean;
}

export function JoinLeaveButton({ eventId, isJoined, isFull }: JoinLeaveButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      if (isJoined) {
        const result = await leaveEvent(eventId);
        if (result?.error) toast.error(result.error);
        else toast.success('You left the event');
      } else {
        const result = await joinEvent(eventId);
        if (result?.error) toast.error(result.error);
        else toast.success('You joined the event!');
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || (isFull && !isJoined)}
      variant={isJoined ? 'outline' : 'default'}
      size="sm"
    >
      {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      {!isPending && (isJoined ? <UserMinus className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />)}
      {isJoined ? 'Leave Event' : isFull ? 'Event Full' : 'Join Event'}
    </Button>
  );
}

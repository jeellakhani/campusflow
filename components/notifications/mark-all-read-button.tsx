'use client';

import { useTransition } from 'react';
import { markAllNotificationsRead } from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCheck, Loader2 } from 'lucide-react';

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result?.error) toast.error(result.error);
      else toast.success('All notifications marked as read');
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCheck className="h-4 w-4 mr-2" />}
      Mark all read
    </Button>
  );
}

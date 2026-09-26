import { Metadata } from 'next';
import { EventForm } from '@/components/events/event-form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = { title: 'Create Event' };

export default function NewEventPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Create an Event"
        description="Organize a campus event and invite students to join."
      />
      <EventForm />
    </div>
  );
}

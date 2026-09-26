import { Metadata } from 'next';
import { QuestionForm } from '@/components/community/question-form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = { title: 'Ask a Question' };

export default function AskQuestionPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Ask a Question"
        description="Get help from fellow students and campus community."
      />
      <QuestionForm />
    </div>
  );
}

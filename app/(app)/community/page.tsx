import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { formatRelativeDate } from '@/lib/utils';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { Question } from '@/types';

export const metadata = { title: 'Community' };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await searchParams;

  let query = supabase
    .from('questions')
    .select('*, profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false });

  if (params.category) query = query.eq('category', params.category);

  const { data: questions } = await query;

  // Get answer counts and like counts
  const questionIds = questions?.map(q => q.id) ?? [];
  const [answersRes, likesRes] = await Promise.all([
    questionIds.length > 0
      ? supabase.from('answers').select('question_id').in('question_id', questionIds)
      : Promise.resolve({ data: [] }),
    questionIds.length > 0
      ? supabase.from('question_likes').select('question_id').in('question_id', questionIds)
      : Promise.resolve({ data: [] }),
  ]);

  const answerCounts: Record<string, number> = {};
  const likeCounts: Record<string, number> = {};
  answersRes.data?.forEach(a => { answerCounts[a.question_id] = (answerCounts[a.question_id] ?? 0) + 1; });
  likesRes.data?.forEach(l => { likeCounts[l.question_id] = (likeCounts[l.question_id] ?? 0) + 1; });

  const categories = ['academic', 'hostel', 'campus', 'technical', 'social', 'general', 'events', 'administration'];

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Community Q&A"
        description="Ask questions, share knowledge, help your peers"
        action={{ label: 'Ask Question', href: '/community/ask' }}
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={!params.category ? 'default' : 'outline'} size="sm" asChild>
          <Link href="/community">All</Link>
        </Button>
        {categories.map(c => (
          <Button key={c} variant={params.category === c ? 'default' : 'outline'} size="sm" asChild>
            <Link href={`/community?category=${c}`} className="capitalize">{c}</Link>
          </Button>
        ))}
      </div>

      {!questions || questions.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No questions yet"
          description="Be the first to ask a question to the campus community."
          action={{ label: 'Ask Question', href: '/community/ask' }}
        />
      ) : (
        <div className="space-y-3">
          {(questions as Question[]).map((q) => (
            <Link key={q.id} href={`/community/${q.id}`}>
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Stats */}
                    <div className="flex flex-col items-center justify-center gap-3 text-center shrink-0 w-12 sm:w-16">
                      <div>
                        <p className={`text-lg font-bold leading-none ${q.is_resolved ? 'text-green-600' : ''}`}>
                          {answerCounts[q.id] ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">answers</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{likeCounts[q.id] ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">likes</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-base text-primary/90">{q.title}</h3>
                        {q.is_resolved && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{q.description}</p>
                      <div className="flex items-center gap-3 flex-wrap text-xs">
                        <Badge variant="secondary" className="text-[10px] capitalize font-medium">{q.category}</Badge>
                        {q.tags?.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">#{tag}</span>
                        ))}
                        <span className="text-muted-foreground ml-auto">{formatRelativeDate(q.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

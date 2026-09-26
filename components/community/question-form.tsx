'use client';

import { useState, useTransition } from 'react';
import { createQuestion } from '@/app/actions/community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = ['academic', 'hostel', 'campus', 'technical', 'social', 'general', 'events', 'administration'];

export function QuestionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('tags', tags.join(','));
    
    startTransition(async () => {
      const result = await createQuestion(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Question posted successfully!");
        router.push("/community");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Question Title *</Label>
        <Input id="title" name="title" placeholder="What do you want to know?" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Details *</Label>
        <Textarea id="description" name="description" placeholder="Provide more context about your question..." rows={5} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <select name="category" id="category" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <option value="">Select category</option>
          {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Tags (up to 5)</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { 
              if (e.key === 'Enter') { 
                e.preventDefault(); 
                addTag(); 
              } 
            }}
            placeholder="Add a tag and press Enter..."
            maxLength={20}
          />
          <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Press Enter to add a tag. Only lowercase letters, numbers, and hyphens.</p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Post Question
      </Button>
    </form>
  );
}

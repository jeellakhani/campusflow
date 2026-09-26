'use client';

import { useTransition } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) toast.error(result.error);
      else toast.success('Profile updated successfully!');
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ''} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input id="username" name="username" defaultValue={profile.username ?? ''} required />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="college">College</Label>
          <Input id="college" name="college" defaultValue={profile.college ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" defaultValue={profile.department ?? ''} />
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <Label htmlFor="year_of_study">Year of Study</Label>
        <select name="year_of_study" id="year_of_study" defaultValue={profile.year_of_study ?? ''} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <option value="">Select year</option>
          {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ''} placeholder="Tell us a little about yourself..." rows={4} className="resize-y" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Profile Picture (optional)</Label>
        <Input id="avatar" name="avatar" type="file" accept="image/*" className="file:text-sm file:font-medium max-w-sm" />
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}

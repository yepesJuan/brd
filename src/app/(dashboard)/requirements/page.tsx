import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { RequirementList } from '@/components/requirements/RequirementList';
import { Button } from '@/components/ui/Button';

export default async function RequirementsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session?.user.id)
    .single();

  const isBusinessUser = user?.role === 'BUSINESS';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requirements</h1>
          <p className="text-gray-600 mt-1">
            View and sign off on business requirements documents
          </p>
        </div>
        {isBusinessUser && (
          <Link href="/requirements/new">
            <Button>Upload New Requirement</Button>
          </Link>
        )}
      </div>

      <RequirementList />
    </div>
  );
}

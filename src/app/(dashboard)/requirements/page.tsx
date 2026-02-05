import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { RequirementList } from '@/components/requirements/RequirementList';
import { Button } from '@/components/ui/Button';

export default async function RequirementsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser?.id)
    .single();

  const isBusinessUser = user?.role === 'BUSINESS';
  const currentUserId = authUser?.id;

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
          <div className="flex items-center gap-2">
            <Link href="/requirements/generate">
              <Button variant="outline">
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </Button>
            </Link>
            <Link href="/requirements/new">
              <Button>Upload Document</Button>
            </Link>
          </div>
        )}
      </div>

      <RequirementList currentUserId={currentUserId} />
    </div>
  );
}

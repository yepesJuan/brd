import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { UploadForm } from '@/components/requirements/UploadForm';

export default async function NewRequirementPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  // Only BUSINESS users can upload requirements
  if (user?.role !== 'BUSINESS') {
    redirect('/requirements');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload New Requirement</h1>
        <p className="text-gray-600 mt-1">
          Upload a BRD document to begin the sign-off process
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <UploadForm />
      </div>
    </div>
  );
}

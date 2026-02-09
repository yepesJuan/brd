import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { StatusBadge, RoleBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { SignOffPanel } from '@/components/sign-offs/SignOffPanel';
import { DownloadButton } from '@/components/requirements/DownloadButton';
import { EpicLinkEditor } from '@/components/requirements/EpicLinkEditor';
import { formatDateTime } from '@/lib/utils';
import type { Status, User } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RequirementDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!currentUser) {
    redirect('/login');
  }

  // Get requirement with relations
  const { data: requirement, error } = await supabase
    .from('requirements')
    .select(`
      *,
      uploaded_by_user:users!uploaded_by(id, name, avatar_url, role)
    `)
    .eq('id', id)
    .single();

  if (error || !requirement) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href="/requirements"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Requirements
      </Link>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{requirement.title}</h1>
              <StatusBadge status={requirement.status as Status} />
            </div>

            {requirement.description && (
              <p className="text-gray-600 mb-4">{requirement.description}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Avatar
                  src={requirement.uploaded_by_user.avatar_url}
                  name={requirement.uploaded_by_user.name}
                  size="sm"
                />
                <span>{requirement.uploaded_by_user.name}</span>
                <RoleBadge role={requirement.uploaded_by_user.role} size="sm" />
              </div>
              <span>·</span>
              <span>Created {formatDateTime(requirement.created_at)}</span>
            </div>

            {requirement.status_changed_at && (
              <p className="text-sm text-gray-500 mt-2">
                Status changed {formatDateTime(requirement.status_changed_at)}
              </p>
            )}
          </div>

          {/* Document */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">{requirement.file_name}</p>
                  <p className="text-sm text-gray-500">Click to download</p>
                </div>
              </div>
              <DownloadButton filePath={requirement.file_path} fileName={requirement.file_name} />
            </div>
          </div>

          {/* Epic Link */}
          <EpicLinkEditor
            requirementId={requirement.id}
            currentEpicLink={requirement.epic_link}
            canEdit={currentUser.role === 'BUSINESS' || currentUser.role === 'PRODUCT'}
          />
        </div>

        {/* Sign-off panel */}
        <div className="lg:col-span-2">
          <SignOffPanel
            requirementId={requirement.id}
            status={requirement.status as Status}
            currentUser={currentUser as User}
          />
        </div>
      </div>
    </div>
  );
}

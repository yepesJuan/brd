'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { BRDGenerator } from '@/components/brd-generator';
import { toast } from 'sonner';

export default function GenerateBRDPage() {
  const router = useRouter();

  const createRequirement = trpc.requirements.create.useMutation({
    onSuccess: (data) => {
      router.push(`/requirements/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitForApproval = async (document: string, title: string) => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in');
    }

    // Create a Blob from the markdown content
    const blob = new Blob([document], { type: 'text/markdown' });
    const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brd.md`;
    const filePath = `${user.id}/${Date.now()}-${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('requirements')
      .upload(filePath, blob, {
        contentType: 'text/markdown',
      });

    if (uploadError) {
      throw uploadError;
    }

    // Extract description from the document (first paragraph after "Deliverable Overview")
    let description = '';
    const overviewMatch = document.match(/## Deliverable Overview[^\n]*\n+([^\n#]+)/);
    if (overviewMatch) {
      description = overviewMatch[1].trim().substring(0, 500);
    }

    // Create the requirement record
    await createRequirement.mutateAsync({
      title: `BRD: ${title}`,
      description: description || 'AI-generated Business Requirements Document',
      filePath,
      fileName,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/requirements"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Requirements
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Generate BRD with AI</h1>
        <p className="text-gray-600 mt-1">
          Answer questions to create a comprehensive Business Requirements Document
        </p>
      </div>

      {/* BRD Generator */}
      <BRDGenerator onSubmitForApproval={handleSubmitForApproval} />
    </div>
  );
}

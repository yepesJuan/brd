'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface BRDDocumentPreviewProps {
  document: string;
  onSubmitForApproval?: (documentContent: string, title: string) => Promise<void>;
}

export function BRDDocumentPreview({
  document: markdownContent,
  onSubmitForApproval,
}: BRDDocumentPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract title from the document (first H1)
  const extractTitle = (): string => {
    const match = markdownContent.match(/^#\s+\*?\*?Deliverable\s*\|\s*(.+?)\*?\*?\s*$/m);
    if (match) {
      return match[1].trim();
    }
    // Fallback: look for any H1
    const h1Match = markdownContent.match(/^#\s+(.+)$/m);
    return h1Match ? h1Match[1].replace(/\*+/g, '').trim() : 'Untitled BRD';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      toast.success('Document copied to clipboard');
    } catch {
      toast.error('Failed to copy document');
    }
  };

  const handleDownload = () => {
    const title = extractTitle();
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brd.md`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const link = globalThis.document.createElement('a');
    link.href = url;
    link.download = filename;
    globalThis.document.body.appendChild(link);
    link.click();
    globalThis.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  const handleSubmitForApproval = async () => {
    if (!onSubmitForApproval) return;

    setIsSubmitting(true);
    try {
      const title = extractTitle();
      await onSubmitForApproval(markdownContent, title);
      toast.success('Document submitted for approval');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Document Preview</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </Button>
        </div>
      </div>

      {/* Document content */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white p-6">
        <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-table:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
        </article>
      </div>

      {/* Submit button */}
      {onSubmitForApproval && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            onClick={handleSubmitForApproval}
            loading={isSubmitting}
            className="w-full"
            size="lg"
          >
            Submit for Approval
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            This will create a new requirement and start the sign-off workflow
          </p>
        </div>
      )}
    </div>
  );
}

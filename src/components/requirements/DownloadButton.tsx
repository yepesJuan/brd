'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface DownloadButtonProps {
  filePath: string;
  fileName: string;
}

export function DownloadButton({ filePath, fileName }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.storage
        .from('requirements')
        .createSignedUrl(filePath, 3600);

      if (error) {
        toast.error('Failed to generate download link');
        return;
      }

      // Open in new tab or trigger download
      window.open(data.signedUrl, '_blank');
    } catch {
      toast.error('Download failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      loading={isLoading}
    >
      Download
    </Button>
  );
}

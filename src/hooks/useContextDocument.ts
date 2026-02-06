'use client';

import { useState, useCallback } from 'react';

export interface ContextDocumentInfo {
  fileName: string;
  fileSize: number;
  wordCount: number;
  truncated: boolean;
}

export interface ContextDocument {
  info: ContextDocumentInfo;
  content: string;
}

type ParseStatus = 'idle' | 'parsing' | 'success' | 'error';

interface UseContextDocumentReturn {
  document: ContextDocument | null;
  status: ParseStatus;
  error: string | null;
  parseFile: (file: File) => Promise<void>;
  clearDocument: () => void;
}

export function useContextDocument(): UseContextDocumentReturn {
  const [document, setDocument] = useState<ContextDocument | null>(null);
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setStatus('parsing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse document');
      }

      setDocument({
        info: {
          fileName: data.fileName,
          fileSize: data.fileSize,
          wordCount: data.wordCount,
          truncated: data.truncated,
        },
        content: data.content,
      });
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse document');
      setStatus('error');
      setDocument(null);
    }
  }, []);

  const clearDocument = useCallback(() => {
    setDocument(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    document,
    status,
    error,
    parseFile,
    clearDocument,
  };
}

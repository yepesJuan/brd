'use client';

import { useState, useCallback } from 'react';
import { ContextDocument, ContextDocumentInfo } from '@/hooks/useContextDocument';

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];
const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt,.md';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ContextDocumentUploadProps {
  document: ContextDocument | null;
  status: 'idle' | 'parsing' | 'success' | 'error';
  error: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function ContextDocumentUpload({
  document,
  status,
  error,
  onFileSelect,
  onClear,
}: ContextDocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
      setIsExpanded(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateAndSelectFile = useCallback((file: File) => {
    // Check file extension for .md files (MIME type can be inconsistent)
    const ext = file.name.toLowerCase().split('.').pop();
    const isValidExtension = ['pdf', 'docx', 'txt', 'md'].includes(ext || '');
    const isValidMime = ACCEPTED_FILE_TYPES.includes(file.type) || file.type === '';

    if (!isValidExtension && !isValidMime) {
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSelectFile(droppedFile);
    }
  }, [validateAndSelectFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSelectFile(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Show attached document state
  if (document && status === 'success') {
    return (
      <AttachedDocument
        info={document.info}
        onRemove={onClear}
      />
    );
  }

  // Collapsed state - show toggle button
  if (!isExpanded && status === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add reference document (optional)
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Reference Document</span>
        {status === 'idle' && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-2 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : status === 'parsing'
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {status !== 'parsing' && (
          <input
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        )}

        {status === 'parsing' ? (
          <div className="space-y-2">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <p className="text-sm text-gray-600">Parsing document...</p>
          </div>
        ) : (
          <div className="space-y-1">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
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
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, DOCX, TXT, or MD (max 10MB)</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        The document content will be used to help generate your BRD with relevant context.
      </p>
    </div>
  );
}

interface AttachedDocumentProps {
  info: ContextDocumentInfo;
  onRemove: () => void;
}

function AttachedDocument({ info, onRemove }: AttachedDocumentProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-green-100 p-2">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{info.fileName}</p>
            <p className="text-xs text-gray-500">
              {formatFileSize(info.fileSize)} &middot; {info.wordCount.toLocaleString()} words
              {info.truncated && (
                <span className="text-amber-600"> (truncated)</span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Remove document"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

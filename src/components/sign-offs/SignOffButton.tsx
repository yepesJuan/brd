'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

interface SignOffButtonProps {
  onSignOff: (comment?: string) => void;
  isLoading: boolean;
  disabled: boolean;
  hasSigned: boolean;
  isOwnRole: boolean;
}

export function SignOffButton({
  onSignOff,
  isLoading,
  disabled,
  hasSigned,
  isOwnRole,
}: SignOffButtonProps) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSignOff(comment || undefined);
    setComment('');
    setShowComment(false);
  };

  // Already signed
  if (hasSigned) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">Signed</span>
      </div>
    );
  }

  // Not user's role - show disabled state
  if (!isOwnRole) {
    return (
      <Button variant="outline" size="sm" disabled>
        Sign Off
      </Button>
    );
  }

  // Requirement is locked
  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        Locked
      </Button>
    );
  }

  // Show comment form
  if (showComment) {
    return (
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit} loading={isLoading}>
            Confirm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowComment(false);
              setComment('');
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Default: show sign off button
  return (
    <Button size="sm" onClick={() => setShowComment(true)}>
      Sign Off
    </Button>
  );
}

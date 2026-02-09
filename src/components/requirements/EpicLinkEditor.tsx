"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

interface EpicLinkEditorProps {
  requirementId: string;
  currentEpicLink: string | null;
  canEdit: boolean;
}

export function EpicLinkEditor({
  requirementId,
  currentEpicLink,
  canEdit,
}: EpicLinkEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [epicLink, setEpicLink] = useState(currentEpicLink || "");
  const [error, setError] = useState<string | null>(null);
  const [displayedLink, setDisplayedLink] = useState(currentEpicLink);

  const utils = trpc.useUtils();
  const updateEpicLink = trpc.requirements.updateEpicLink.useMutation({
    onSuccess: () => {
      toast.success("Epic link updated");
      setDisplayedLink(epicLink || null);
      setIsEditing(false);
      setError(null);
      utils.requirements.getById.invalidate({ id: requirementId });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update epic link");
    },
  });

  const handleSave = () => {
    // Validate URL if not empty
    if (epicLink && !isValidUrl(epicLink)) {
      setError("Please enter a valid URL");
      return;
    }

    updateEpicLink.mutate({
      id: requirementId,
      epicLink: epicLink || "",
    });
  };

  const handleCancel = () => {
    setEpicLink(displayedLink || "");
    setIsEditing(false);
    setError(null);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Display mode - show link or "Add epic link" prompt
  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Jira Epic</h2>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              {displayedLink ? "Edit" : "Add"}
            </Button>
          )}
        </div>

        {displayedLink ? (
          <a
            href={displayedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            {displayedLink}
          </a>
        ) : (
          <p className="text-sm text-gray-500">
            {canEdit
              ? 'No epic linked yet. Click "Add" to link a Jira epic.'
              : "No epic linked"}
          </p>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Jira Epic</h2>

      <div className="space-y-4">
        <Input
          id="epicLink"
          type="url"
          value={epicLink}
          onChange={(e) => {
            setEpicLink(e.target.value);
            setError(null);
          }}
          placeholder="https://cityfurniture.atlassian.net/browse/PROJ-123"
          error={error || undefined}
        />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            loading={updateEpicLink.isPending}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={updateEpicLink.isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

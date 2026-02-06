'use client';

import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ContextDocumentInput {
  fileName: string;
  content: string;
}

interface UseBRDGeneratorReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  documentReady: boolean;
  generatedDocument: string | null;
  contextDocument: ContextDocumentInput | null;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
  startNewBRD: (contextDocument?: ContextDocumentInput) => Promise<void>;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useBRDGenerator(): UseBRDGeneratorReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentReady, setDocumentReady] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [contextDocument, setContextDocument] = useState<ContextDocumentInput | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/brd-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          contextDocument: contextDocument || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Check if document is ready
      if (data.documentReady) {
        setDocumentReady(true);
        setGeneratedDocument(data.generatedDocument);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, contextDocument]);

  const startNewBRD = useCallback(async (contextDoc?: ContextDocumentInput) => {
    setError(null);
    setIsLoading(true);
    setMessages([]);
    setDocumentReady(false);
    setGeneratedDocument(null);
    setContextDocument(contextDoc || null);

    try {
      const response = await fetch('/api/brd-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          isInitial: true,
          contextDocument: contextDoc || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();

      // Add initial assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages([assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setError(null);
    setDocumentReady(false);
    setGeneratedDocument(null);
    setContextDocument(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    documentReady,
    generatedDocument,
    contextDocument,
    sendMessage,
    resetChat,
    startNewBRD,
  };
}

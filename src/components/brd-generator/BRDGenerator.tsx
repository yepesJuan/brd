'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useBRDGenerator, Message } from '@/hooks/useBRDGenerator';
import { Button } from '@/components/ui/Button';
import { BRDDocumentPreview } from './BRDDocumentPreview';

interface BRDGeneratorProps {
  onSubmitForApproval?: (document: string, title: string) => Promise<void>;
}

export function BRDGenerator({ onSubmitForApproval }: BRDGeneratorProps) {
  const {
    messages,
    isLoading,
    error,
    documentReady,
    generatedDocument,
    sendMessage,
    resetChat,
    startNewBRD,
  } = useBRDGenerator();

  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Show split view when preview is enabled and document is ready
  if (showPreview && generatedDocument) {
    return (
      <div className="flex h-[calc(100vh-12rem)] gap-4">
        {/* Chat side */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
              Hide Preview
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-4">
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Preview side */}
        <div className="flex-1 min-w-0">
          <BRDDocumentPreview
            document={generatedDocument}
            onSubmitForApproval={onSubmitForApproval}
          />
        </div>
      </div>
    );
  }

  // Empty state - no conversation started
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <svg
              className="h-8 w-8 text-blue-600"
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
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Generate a Business Requirements Document
          </h2>
          <p className="text-gray-600 mb-6">
            I'll guide you through creating a comprehensive BRD by asking questions
            about your project. When we're done, I'll generate a formatted document
            ready for approval.
          </p>
          <Button onClick={startNewBRD} loading={isLoading} size="lg">
            Start New BRD
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">BRD Generator</h2>
        <div className="flex items-center gap-2">
          {documentReady && (
            <Button variant="primary" size="sm" onClick={() => setShowPreview(true)}>
              Show Preview
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={resetChat}>
            Start Over
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-4 mb-4">
        <MessageList messages={messages} />
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
            <LoadingDots />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Document ready notification */}
      {documentReady && !showPreview && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-green-800">Your BRD is ready!</p>
              <p className="text-sm text-green-700">Click "Show Preview" to review and submit for approval.</p>
            </div>
            <Button size="sm" onClick={() => setShowPreview(true)}>
              Show Preview
            </Button>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={documentReady ? "Ask follow-up questions or request changes..." : "Type your response..."}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" loading={isLoading} disabled={!input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex gap-1">
      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

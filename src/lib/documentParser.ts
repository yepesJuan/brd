import mammoth from 'mammoth';

const MAX_CONTENT_LENGTH = 50000; // ~50k chars for token safety

export interface ParsedDocument {
  content: string;
  wordCount: number;
  truncated: boolean;
  originalLength: number;
}

export type SupportedFileType = 'pdf' | 'docx' | 'txt' | 'md';

function getMimeType(fileName: string): SupportedFileType | null {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'txt':
      return 'txt';
    case 'md':
      return 'md';
    default:
      return null;
  }
}

function truncateContent(content: string): { text: string; truncated: boolean; originalLength: number } {
  const originalLength = content.length;
  if (content.length <= MAX_CONTENT_LENGTH) {
    return { text: content, truncated: false, originalLength };
  }

  // Truncate at a word boundary
  let truncated = content.substring(0, MAX_CONTENT_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > MAX_CONTENT_LENGTH * 0.9) {
    truncated = truncated.substring(0, lastSpace);
  }

  return {
    text: truncated + '\n\n[Document truncated due to length...]',
    truncated: true,
    originalLength,
  };
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

async function parsePDF(buffer: Buffer): Promise<string> {
  // Use dynamic import for pdfjs-dist legacy build (Node.js compatible)
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function parseTextFile(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

export async function parseDocument(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
  const fileType = getMimeType(fileName);

  if (!fileType) {
    throw new Error(`Unsupported file type: ${fileName}`);
  }

  let rawContent: string;

  switch (fileType) {
    case 'pdf':
      rawContent = await parsePDF(buffer);
      break;
    case 'docx':
      rawContent = await parseDOCX(buffer);
      break;
    case 'txt':
    case 'md':
      rawContent = parseTextFile(buffer);
      break;
  }

  // Clean up whitespace
  rawContent = rawContent.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  const { text, truncated, originalLength } = truncateContent(rawContent);

  return {
    content: text,
    wordCount: countWords(text),
    truncated,
    originalLength,
  };
}

export function isValidFileType(fileName: string): boolean {
  return getMimeType(fileName) !== null;
}

export function getAcceptedFileTypes(): string {
  return '.pdf,.docx,.txt,.md';
}

export function getAcceptedMimeTypes(): string[] {
  return [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];
}

import { NextRequest, NextResponse } from 'next/server';
import { parseDocument, isValidFileType } from '@/lib/documentParser';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidFileType(file.name)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: PDF, DOCX, TXT, MD' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Parse the document
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseDocument(buffer, file.name);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      content: parsed.content,
      wordCount: parsed.wordCount,
      truncated: parsed.truncated,
      originalLength: parsed.originalLength,
    });
  } catch (error) {
    console.error('Document parsing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse document' },
      { status: 500 }
    );
  }
}

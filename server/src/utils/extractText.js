import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export class UnsupportedFileTypeError extends Error {}
export class EmptyTextError extends Error {}

async function extractFromPdf(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = (result.text || '').trim();
    return text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').replace(/\n{3,}/g, '\n\n').trim();
  } finally {
    await parser.destroy();
  }
}

async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || '').trim();
}

export async function extractResumeText(file) {
  const name = file.originalname.toLowerCase();

  let text;
  if (name.endsWith('.pdf')) {
    text = await extractFromPdf(file.buffer);
  } else if (name.endsWith('.docx')) {
    text = await extractFromDocx(file.buffer);
  } else {
    throw new UnsupportedFileTypeError('Only PDF and DOCX files are supported.');
  }

  if (!text) {
    throw new EmptyTextError(
      'Could not extract any text from this file. It may be a scanned image or an empty document.'
    );
  }

  return text;
}
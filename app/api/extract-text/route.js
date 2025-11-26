import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getFileData } from '@/lib/contracts';

export async function POST(request) {
    try {
        const session = await getSession();
        const user = session.user;

        if (!user || !user.isLoggedIn) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { file_name, contId } = await request.json()
        if (!file_name || !contId) {
            return NextResponse.json({ success: false, error: 'File name and contract ID are required' }, { status: 400 })
        }

        const fileExt = file_name.split('.').pop().toLowerCase()

        const supportedTypes = ['txt', 'pdf', 'docx'];
        if (!supportedTypes.includes(fileExt)) {
            return NextResponse.json({ 
                success: false, 
                error: `Unsupported file type: ${fileExt}. Supported: ${supportedTypes.join(', ')}` 
            }, { status: 400 });
        }

        let text = ''
        // Use server-side admin client to fetch contract metadata and file
        const download = await getFileData(contId);
        if (!download.success || !download.data) {
            return NextResponse.json({ success: false, error: `Failed to download file data: ${download.error}` }, { status: 500 });
        }
        const downloadData = download.data;
        
        // Use Blob.text() for text-based files
        if (fileExt === 'txt') {
            text = await downloadData.text();
        } else if (fileExt === 'pdf') {
            // Convert blob to array buffer for PDF parsing
            const arrayBuffer = await downloadData.arrayBuffer();
            try {
                // Try direct text extraction first
                text = await downloadData.text();
                if (!text || text.trim().length < 19) {
                    // Fallback to PDFParse if native text extraction fails
                    const PDFParse = require('pdf-parse-new');
                    const buffer = Buffer.from(arrayBuffer);
                    const data = await PDFParse(buffer);
                    text = data.text;
                }
            } catch (pdfError) {
                console.error('PDF text extraction failed: ', pdfError);
                return NextResponse.json({ 
                    success: false, 
                    error: 'Failed to extract text from PDF: ' + pdfError.message
                }, { status: 500 });
            }
        } else if (fileExt === 'docx') {
            try {
                const mammoth = await import('mammoth');
                const arrayBuffer = await downloadData.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } catch (docxError) {
                console.error('DOCX extraction failed: ', docxError);
                return NextResponse.json({ 
                    success: false, 
                    error: 'Failed to extract text from DOCX file: ' + docxError.message
                }, { status: 500 });
            }
        }

        if (text && text.trim().length > 0) {
            const extractedDates = extractDatesWithContext(text);

            return NextResponse.json({
                success: true,
                dates_found: extractedDates.length,
                extracted_dates: extractedDates,
                text_sample: text.substring(0, 200) + '...',
                error: null
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'No extractable text found in the file',
                dates_found: 0,
                extracted_dates: []
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Processing error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

function extractDatesWithContext(text) {
    try {
        const datePatterns = [
            // ISO: YYYY-MM-DD
            /\b\d{4}-\d{2}-\d{2}\b/g,
            
            // YYYY/MM/DD
            /\b\d{4}\/\d{1,2}\/\d{1,2}\b/g,

            // US: MM/DD/YYYY or MM-DD-YYYY or European: DD/MM/YYYY or DD-MM-YYYY  
            /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/g,
            
            // Month DD, YYYY
            /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
            
            // DD Month YYYY
            /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi,
        ];

        const datesWithContext = [];
        
        datePatterns.forEach(pattern => {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(text)) !== null) {
                const dateStr = match[0];
                const position = match.index;
                
                const description = extractContextBetweenBoundaries(text, position, 150);
                const context = extractContextBetweenBoundaries(text, position, 80);
                
                datesWithContext.push({
                    date: dateStr,
                    description: description,
                    context: context
                });
            }
        });

        const uniqueDates = removeDuplicateDates(datesWithContext);
        return uniqueDates;
    } catch (error) {
        console.error('Date extraction error:', error);
        return [];
    }
}

function extractContextBetweenBoundaries(text, position, maxLength = 200) {
    const boundaries = ['.', '!', '?', ';', '\n'];
    
    let start = position;
    while (start > 0 && (position - start) < maxLength/2) {
        if (boundaries.includes(text[start])) {
            start++;
            break;
        }
        start--;
    }
    start = Math.max(0, start);
    
    let end = position;
    while (end < text.length && (end - position) < maxLength/2) {
        if (boundaries.includes(text[end])) {
            break;
        }
        end++;
    }
    
    return text.substring(start, end).trim().replace(/\s+/g, ' ');
}

function removeDuplicateDates(datesArray) {
    const seen = new Set();
    return datesArray.filter(dateObj => {
        const key = `${dateObj.date}-${dateObj.description.substring(0, 50)}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
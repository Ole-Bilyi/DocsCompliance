import { NextResponse } from 'next/server'
import textract from 'textract'
import PDFParse from 'pdf-parse'

export async function POST(request) {
    try {
        const { file_url, file_name, contId } = await request.json()
        if (!file_url || !file_name || !contId) {
            return NextResponse.json(
                { success: false, error: 'File URL, file name and contract ID are required' }, 
                { status: 400 }
            )
        }

        const fileExt = file_name.split('.').pop().toLowerCase()
        let text = ''

        if (fileExt === 'pdf') {
            // Fetch PDF and parse it properly
            const response = await fetch(file_url)
            const buffer = await response.arrayBuffer()
            const data = await PDFParse(Buffer.from(buffer))
            text = data.text
        } else if (fileExt === 'docx' || fileExt === 'txt') {
            // Use textract for docx and txt files
            text = await new Promise((resolve, reject) => {
                textract.fromUrl(file_url, (error, extractedText) => {
                    if (error) reject(error)
                    else resolve(extractedText)
                })
            })
        } else {
            return NextResponse.json(
                { success: false, error: `Unsupported file type: ${fileExt}` }, 
                { status: 400 }
            )
        }

        const extractedDates = extractDatesFromText(text)

        return NextResponse.json({
            success: true,
            dates_found: extractedDates.length,
            extracted_dates: extractedDates,
            error: null
        })

    } catch (error) {
        console.error('Processing error:', error)
        return NextResponse.json(
            { success: false, error: error.message }, 
            { status: 500 }
        )
    }
}

function extractDatesFromText(text) {
    try {
        // Comprehensive date regex patterns
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
        ]

        const allDates = []
        
        datePatterns.forEach(pattern => {
            const matches = text.match(pattern) || []
            allDates.push(...matches)
        })

        const uniqueDates = [...new Set(allDates)]

        return uniqueDates
    } catch (error) {
        console.error('Date extraction error:', error)
        return []
    }
}
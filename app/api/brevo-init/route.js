import { getkey } from '@/lib/auth';
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const clientKey = await getkey();
        
        if (!clientKey.success) {
            console.error('Brevo client key error:', clientKey.error);
            return new NextResponse(
                `console.error("Brevo initialization failed: ${clientKey.error}");`,
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/javascript',
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                    },
                }
            );
        }

        if (!clientKey.data) {
            console.error('Brevo client key is empty');
            return new NextResponse(
                'console.error("Brevo initialization failed: Client key is empty");',
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/javascript',
                        'Cache-Control': 'no-store, no-cache, must-revalidate',
                    },
                }
            );
        }

        const scriptContent = `
            (function() {
                window.Brevo = window.Brevo || [];
                Brevo.push([
                    "init",
                    {
                        client_key: "${clientKey.data.replace(/"/g, '\\"')}",
                    }
                ]);
                
                // Optional: Add ready state check
                if (typeof window.BrevoReady === 'function') {
                    window.BrevoReady();
                }
            })();
        `;

        return new NextResponse(scriptContent, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=3600', 
            },
        });
        
    } catch (error) {
        console.error('Unexpected error in Brevo init:', error);
        return new NextResponse(
            `console.error("Brevo initialization error: ${error.message}");`,
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/javascript',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            }
        );
    }
}
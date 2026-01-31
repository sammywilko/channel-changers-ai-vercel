import { corsHeaders } from './_lib/gemini.js';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    return new Response(
        JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: 'vercel'
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        }
    );
}

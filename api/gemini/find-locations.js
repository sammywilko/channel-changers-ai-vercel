import { ai, jsonResponse, errorResponse, corsHeaders } from '../_lib/gemini.js';

export const config = {
    runtime: 'edge',
    maxDuration: 60,
};

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    if (req.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        const { aesthetic, city } = await req.json();

        if (!aesthetic || !city) {
            return errorResponse('aesthetic and city are required', 400);
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find 5 filming locations in ${city} that match this aesthetic: "${aesthetic}". Provide the name and a brief description of why it fits.`,
            config: {
                tools: [{ googleMaps: {} }],
            },
        });

        return jsonResponse({
            text: response.text,
            chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        });
    } catch (error) {
        console.error('Location search error:', error);
        return errorResponse(error.message || 'Internal server error', 500);
    }
}

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
        const { videoBase64, mimeType, prompt } = await req.json();

        if (!videoBase64 || !mimeType) {
            return errorResponse('videoBase64 and mimeType are required', 400);
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: videoBase64 } },
                    { text: prompt || "Analyze this video for key marketing insights." }
                ]
            }
        });

        return jsonResponse({ analysis: response.text });
    } catch (error) {
        console.error('Video analysis error:', error);
        return errorResponse(error.message || 'Internal server error', 500);
    }
}

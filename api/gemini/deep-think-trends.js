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
        const { niche } = await req.json();

        if (!niche) {
            return errorResponse('niche is required', 400);
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze the ${niche} industry. Predict 3 major shifts for late 2025. Don't just list trends; explain the sociological and technological drivers behind them.`,
            config: {
                thinkingConfig: { thinkingBudget: 2048 },
            }
        });

        return jsonResponse({
            thinking: response.candidates?.[0]?.content?.parts?.find(p => p.thought)?.text || null,
            analysis: response.text
        });
    } catch (error) {
        console.error('Trend analysis error:', error);
        return errorResponse(error.message || 'Internal server error', 500);
    }
}

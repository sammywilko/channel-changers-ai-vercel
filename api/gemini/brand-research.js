import { ai, Type, jsonResponse, errorResponse, corsHeaders } from '../_lib/gemini.js';

export const config = {
    runtime: 'edge',
    maxDuration: 60,
};

export default async function handler(req) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    if (req.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        const { brandName, websiteUrl } = await req.json();

        if (!brandName) {
            return errorResponse('brandName is required', 400);
        }

        const icpSchema = {
            type: Type.OBJECT,
            properties: {
                icp_summary: { type: Type.STRING },
                pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                desires: { type: Type.ARRAY, items: { type: Type.STRING } },
                archetype_name: { type: Type.STRING },
                voice_type: { type: Type.STRING },
                nano_banana_character_brief: { type: Type.STRING },
            },
            required: ["icp_summary", "pain_points", "desires", "archetype_name"],
        };

        const prompt = `Analyze brand "${brandName}" (${websiteUrl || 'N/A'}). Define ICP, pain points, desires, archetype, voice, and a Nano Banana visual brief.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: icpSchema,
            },
        });

        const text = response.text;
        if (!text) {
            return errorResponse('No response from Gemini', 500);
        }

        return jsonResponse(JSON.parse(text));
    } catch (error) {
        console.error('Brand research error:', error);
        return errorResponse(error.message || 'Internal server error', 500);
    }
}

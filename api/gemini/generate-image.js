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
        const { prompt, size = '1K', aspectRatio = '1:1' } = await req.json();

        if (!prompt) {
            return errorResponse('prompt is required', 400);
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: prompt,
            config: {
                imageConfig: {
                    imageSize: size,
                    aspectRatio
                }
            }
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (!imagePart?.inlineData?.data) {
            return errorResponse('Failed to generate image', 500);
        }

        return jsonResponse({
            imageUrl: `data:image/png;base64,${imagePart.inlineData.data}`
        });
    } catch (error) {
        console.error('Image generation error:', error);
        return errorResponse(error.message || 'Internal server error', 500);
    }
}

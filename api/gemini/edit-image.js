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
        const { imageBase64, imageMimeType, editPrompt } = await req.json();

        if (!imageBase64 || !imageMimeType || !editPrompt) {
            return errorResponse('imageBase64, imageMimeType, and editPrompt are required', 400);
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
                    { text: editPrompt }
                ]
            },
            config: {
                imageConfig: {
                    imageSize: '1K'
                }
            }
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (!imagePart?.inlineData?.data) {
            return errorResponse('Failed to edit image', 500);
        }

        return jsonResponse({
            imageUrl: `data:image/png;base64,${imagePart.inlineData.data}`
        });
    } catch (error) {
        console.error('Image edit error:', error);
        return errorResponse(error.message || 'Internal server error', 500);
    }
}

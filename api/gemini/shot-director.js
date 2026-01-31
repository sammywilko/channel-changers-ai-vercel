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
        const { imageBase64, imageMimeType, style = 'cinematic', preset = 'default' } = await req.json();

        if (!imageBase64 || !imageMimeType) {
            return errorResponse('imageBase64 and imageMimeType are required', 400);
        }

        // First, analyze the input image to understand the scene
        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
                    { text: `Analyze this image briefly. Describe: 1) The main subject 2) The environment/setting 3) The lighting 4) Key visual elements. Be concise, max 100 words.` }
                ]
            }
        });

        const sceneAnalysis = analysisResponse.text || 'A scene';

        // Define shot types based on preset
        const shotLayouts = {
            default: [
                'Wide establishing shot - full environment with subject small in frame',
                'Medium shot - waist up, balanced framing',
                'Close-up - face or main subject fills frame',
                'Low angle shot - camera looking up, heroic feel',
                'Eye level shot - neutral, straight-on perspective',
                'High angle shot - camera looking down',
                'Over-the-shoulder shot - from behind another element',
                'Dutch tilt - 15 degree dramatic angle',
                'Extreme close-up - macro detail shot'
            ],
            product: [
                'Hero shot - product centered, dramatic lighting',
                '3/4 angle - product at 45 degrees',
                'Top-down flat lay - product from above',
                'Low angle - product looks grand',
                'Eye level - product at natural viewing height',
                'Detail macro - texture and material close-up',
                'In-use context - product being used',
                'Package shot - with packaging visible',
                'Lifestyle setting - product in environment'
            ],
            character: [
                'Wide establishing - character in environment',
                'Medium full - head to knees',
                'Medium close-up - chest up',
                'Close-up - face focus',
                'Extreme close-up - eyes only',
                'Profile view - side angle',
                'Over-shoulder POV - what character sees',
                'Low angle hero - looking up',
                'High angle vulnerable - looking down'
            ]
        };

        const shots = shotLayouts[preset] || shotLayouts.default;

        // Generate the 3x3 grid image
        const gridPrompt = `Generate a single image containing a 3x3 grid of 9 different cinematographic camera angles.

SCENE TO RECREATE: ${sceneAnalysis}

GRID LAYOUT (9 panels, left to right, top to bottom):
1. ${shots[0]}
2. ${shots[1]}
3. ${shots[2]}
4. ${shots[3]}
5. ${shots[4]}
6. ${shots[5]}
7. ${shots[6]}
8. ${shots[7]}
9. ${shots[8]}

REQUIREMENTS:
- Maintain PERFECT consistency of subject, colors, and styling across all 9 shots
- Each panel should be clearly separated with thin borders
- ${style === 'cinematic' ? 'Cinematic look with film-like color grading' : ''}
- ${style === 'documentary' ? 'Natural, documentary style lighting' : ''}
- ${style === 'commercial' ? 'Clean, bright commercial photography look' : ''}
- ${style === 'social' ? 'Vibrant, social media optimized colors' : ''}
- Professional cinematography quality
- Each shot should look like it could be a frame from a professional production

Output a single square image with the 3x3 grid layout.`;

        const gridResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
                    { text: gridPrompt }
                ]
            },
            config: {
                imageConfig: {
                    imageSize: '2K',
                    aspectRatio: '1:1'
                }
            }
        });

        const imagePart = gridResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (!imagePart?.inlineData?.data) {
            return errorResponse('Failed to generate shot grid', 500);
        }

        return jsonResponse({
            gridImageUrl: `data:image/png;base64,${imagePart.inlineData.data}`,
            sceneAnalysis,
            shotDescriptions: shots.map((shot, index) => ({
                position: index + 1,
                row: Math.floor(index / 3) + 1,
                column: (index % 3) + 1,
                shotType: shot.split(' - ')[0],
                description: shot
            })),
            preset,
            style
        });
    } catch (error) {
        console.error('Shot director error:', error);
        return errorResponse(error.message || 'Internal server error', 500);
    }
}

import express from 'express';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const app = express();
app.use(express.json({ limit: '50mb' }));

// ===========================================
// MIDDLEWARE: Request Logging & Timing
// ===========================================
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = crypto.randomUUID().slice(0, 8);

    // Add request ID to response headers for debugging
    res.setHeader('X-Request-ID', requestId);

    // Log on response finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        const icon = res.statusCode >= 400 ? '❌' : '✅';

        console[logLevel === 'error' ? 'error' : 'log'](
            `${icon} [${requestId}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
        );
    });

    next();
});

// Validate environment
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY is required');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Store video assets for extension (per-session, in production use Redis)
const videoAssetCache = new Map();

// ============================================
// AI Proxy Endpoints
// ============================================

// Brand Research
app.post('/api/gemini/brand-research', async (req, res, next) => {
    try {
        const { brandName, websiteUrl } = req.body;

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

        const prompt = `Analyze brand "${brandName}" (${websiteUrl}). Define ICP, pain points, desires, archetype, voice, and a Nano Banana visual brief.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: icpSchema,
            },
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");

        res.json(JSON.parse(text));
    } catch (error) {
        next(error);
    }
});

// Video Analysis
app.post('/api/gemini/analyze-video', async (req, res, next) => {
    try {
        const { videoBase64, mimeType, prompt } = req.body;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: videoBase64 } },
                    { text: prompt || "Analyze this video for key marketing insights." }
                ]
            }
        });

        res.json({ analysis: response.text });
    } catch (error) {
        next(error);
    }
});

// Veo Video Generation
app.post('/api/gemini/generate-video', async (req, res, next) => {
    try {
        const { prompt, aspectRatio = '16:9', imageBase64, imageMimeType, sessionId } = req.body;

        let params = {
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio
            }
        };

        if (imageBase64) {
            params.image = { imageBytes: imageBase64, mimeType: imageMimeType };
        }

        let operation = await ai.models.generateVideos(params);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const videoAsset = operation.response?.generatedVideos?.[0]?.video;

        // Cache for extension capability (using session ID)
        if (sessionId && videoAsset) {
            videoAssetCache.set(sessionId, videoAsset);
        }

        const videoUri = videoAsset?.uri;
        if (!videoUri) throw new Error("No video URI returned");

        // Return video URL without API key - proxy it instead
        res.json({
            videoUrl: `/api/media/video?uri=${encodeURIComponent(videoUri)}`,
            canExtend: true
        });
    } catch (error) {
        next(error);
    }
});

// Veo Video Extension
app.post('/api/gemini/extend-video', async (req, res, next) => {
    try {
        const { prompt, sessionId } = req.body;

        const cachedAsset = videoAssetCache.get(sessionId);
        if (!cachedAsset) {
            return res.status(400).json({ error: "No previous video to extend. Generate one first." });
        }

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-generate-preview',
            prompt: prompt || "Continue the scene naturally.",
            video: cachedAsset,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9',
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const videoAsset = operation.response?.generatedVideos?.[0]?.video;
        videoAssetCache.set(sessionId, videoAsset);

        const videoUri = videoAsset?.uri;
        if (!videoUri) throw new Error("No video URI returned");

        res.json({
            videoUrl: `/api/media/video?uri=${encodeURIComponent(videoUri)}`,
            canExtend: true
        });
    } catch (error) {
        next(error);
    }
});

// Media Proxy - streams video without exposing API key
app.get('/api/media/video', async (req, res, next) => {
    try {
        const { uri } = req.query;
        if (!uri) return res.status(400).json({ error: 'URI required' });

        // Fetch with API key server-side
        const response = await fetch(`${uri}&key=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status}`);
        }

        res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4');
        res.setHeader('Cache-Control', 'max-age=3600');

        // Stream the response
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (error) {
        next(error);
    }
});

// Location Scout (Maps)
app.post('/api/gemini/find-locations', async (req, res, next) => {
    try {
        const { aesthetic, city } = req.body;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find 5 filming locations in ${city} that match this aesthetic: "${aesthetic}". Provide the name and a brief description of why it fits.`,
            config: {
                tools: [{ googleMaps: {} }],
            },
        });

        res.json({
            text: response.text,
            chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        });
    } catch (error) {
        next(error);
    }
});

// Deep Think Trends
app.post('/api/gemini/deep-think-trends', async (req, res, next) => {
    try {
        const { niche } = req.body;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze the ${niche} industry. Predict 3 major shifts for late 2025. Don't just list trends; explain the sociological and technological drivers behind them.`,
            config: {
                thinkingConfig: { thinkingBudget: 2048 },
            }
        });

        res.json({ analysis: response.text });
    } catch (error) {
        next(error);
    }
});

// Podcast Generation
app.post('/api/gemini/generate-podcast', async (req, res, next) => {
    try {
        const { dialogue } = req.body;
        const prompt = dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            { speaker: 'Host', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                            { speaker: 'Guest', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } }
                        ]
                    }
                }
            }
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            res.json({ audioUrl: `data:audio/wav;base64,${audioData}` });
        } else {
            throw new Error("No audio returned");
        }
    } catch (error) {
        next(error);
    }
});

// Asset Tagging
app.post('/api/gemini/tag-asset', async (req, res, next) => {
    try {
        const { base64, mimeType } = req.body;

        const tagAssetTool = {
            name: 'saveAssetMetadata',
            description: 'Saves the analyzed metadata of an uploaded creative asset to the database.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Visual tags (e.g. 'outdoor', 'sunny', 'happy')" },
                    category: { type: Type.STRING, enum: ['b-roll', 'product_shot', 'interview', 'ugc'], description: "The type of video/image" },
                    mood: { type: Type.STRING, description: "The emotional tone" }
                },
                required: ['tags', 'category', 'mood']
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64 } },
                    { text: "Analyze this asset and save its metadata using the available tool." }
                ]
            },
            config: {
                tools: [{ functionDeclarations: [tagAssetTool] }]
            }
        });

        const calls = response.functionCalls;
        if (calls && calls.length > 0) {
            res.json({ metadata: calls[0].args });
        } else {
            res.json({ metadata: null });
        }
    } catch (error) {
        next(error);
    }
});

// Trending Topics
app.post('/api/gemini/trending-topics', async (req, res, next) => {
    try {
        const { niche } = req.body;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `What are the top 5 trending topics right now related to ${niche}?`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            topic: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            viral_reason: { type: Type.STRING },
                        }
                    }
                }
            }
        });

        const trends = JSON.parse(response.text || '[]');
        res.json({ trends, sources: [] });
    } catch (error) {
        next(error);
    }
});

// Image Generation
app.post('/api/gemini/generate-image', async (req, res, next) => {
    try {
        const { prompt, size = '1K', aspectRatio = '1:1' } = req.body;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { imageSize: size, aspectRatio } }
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) {
            res.json({ imageUrl: `data:image/png;base64,${imagePart.inlineData.data}` });
        } else {
            throw new Error("No image data");
        }
    } catch (error) {
        next(error);
    }
});

// Image Editing
app.post('/api/gemini/edit-image', async (req, res, next) => {
    try {
        const { imageBase64, mimeType, prompt } = req.body;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) {
            res.json({ imageUrl: `data:image/png;base64,${imagePart.inlineData.data}` });
        } else {
            throw new Error("No edited image");
        }
    } catch (error) {
        next(error);
    }
});

// Image Analysis
app.post('/api/gemini/analyze-image', async (req, res, next) => {
    try {
        const { imageBase64, mimeType, prompt } = req.body;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }] },
        });

        res.json({ analysis: response.text });
    } catch (error) {
        next(error);
    }
});

// Text-to-Speech
app.post('/api/gemini/generate-speech', async (req, res, next) => {
    try {
        const { text, voiceName = 'Kore' } = req.body;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            res.json({ audioUrl: `data:audio/wav;base64,${audioData}` });
        } else {
            throw new Error("No audio data returned");
        }
    } catch (error) {
        next(error);
    }
});

// Banger Check (mock for now - was already mock)
app.post('/api/gemini/banger-check', async (req, res, next) => {
    try {
        const { scriptContent } = req.body;

        // This was already a mock implementation
        await new Promise(resolve => setTimeout(resolve, 1500));

        res.json({
            id: crypto.randomUUID(),
            total_score: Math.floor(Math.random() * (99 - 70 + 1) + 70),
            hook_strength: 22,
            pain_desire_targeting: 18,
            verdict: 'banger',
            strengths: ["Strong hook", "Good pacing"],
            weaknesses: ["CTA could be clearer"],
            rewrite_suggestions: ["Make the ending punchier"]
        });
    } catch (error) {
        next(error);
    }
});

// Generic Text Generation (for pipeline prompts)
app.post('/api/gemini/generate', async (req, res, next) => {
    try {
        const { prompt, model = 'fast', maxOutputTokens = 4000, temperature = 0.7 } = req.body;

        const modelMap = {
            fast: 'gemini-3-flash-preview',
            thinking: 'gemini-3-pro-preview',
            pro: 'gemini-3-pro-preview',
        };

        const response = await ai.models.generateContent({
            model: modelMap[model] || modelMap.fast,
            contents: prompt,
            config: {
                maxOutputTokens,
                temperature,
            },
        });

        res.json({ text: response.text });
    } catch (error) {
        next(error);
    }
});

// Shot Director - 3x3 Camera Angle Grid Generator
app.post('/api/gemini/shot-director', async (req, res, next) => {
    try {
        const { imageBase64, imageMimeType, style = 'cinematic', preset = 'default' } = req.body;

        if (!imageBase64 || !imageMimeType) {
            return res.status(400).json({ error: 'imageBase64 and imageMimeType are required' });
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
            throw new Error('Failed to generate shot grid');
        }

        res.json({
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
        next(error);
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===========================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ===========================================
app.use((err, req, res, next) => {
    // Log the full error for debugging
    console.error('🔥 API Error:', {
        path: req.path,
        method: req.method,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Categorize error types for better client handling
    let errorType = 'SERVER_ERROR';
    if (err.message?.includes('API key')) errorType = 'AUTH_ERROR';
    else if (err.message?.includes('rate limit')) errorType = 'RATE_LIMIT';
    else if (err.message?.includes('timeout')) errorType = 'TIMEOUT';
    else if (statusCode === 400) errorType = 'VALIDATION_ERROR';

    // Send consistent error response
    res.status(statusCode).json({
        error: err.message || 'An unexpected error occurred',
        type: errorType,
        requestId: res.getHeader('X-Request-ID'),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

export default app;

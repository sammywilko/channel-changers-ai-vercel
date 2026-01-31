/**
 * Frontend API Client
 * Replaces direct Gemini SDK calls with backend proxy requests.
 * API keys are never exposed to the client.
 */

// Generate unique session ID for video extension chaining
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('cc-session-id');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('cc-session-id', sessionId);
    }
    return sessionId;
};

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

// Generic API call helper
async function apiCall<T>(endpoint: string, body: object): Promise<T> {
    const response = await fetch(`/api/gemini/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `API call failed: ${response.status}`);
    }

    return response.json();
}

// ============================================
// Brand Research
// ============================================
export const researchBrand = async (brandName: string, websiteUrl: string) => {
    return apiCall('brand-research', { brandName, websiteUrl });
};

// ============================================
// Script Banger Check
// ============================================
export const checkScriptBanger = async (scriptContent: string) => {
    return apiCall('banger-check', { scriptContent });
};

// ============================================
// Video Analysis
// ============================================
export const analyzeVideo = async (videoFile: File, prompt: string) => {
    const videoBase64 = await fileToBase64(videoFile);
    const result = await apiCall<{ analysis: string }>('analyze-video', {
        videoBase64,
        mimeType: videoFile.type,
        prompt,
    });
    return result.analysis;
};

// ============================================
// Veo Video Generation
// ============================================
export const generateVeoVideo = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    imageFile?: File
) => {
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;

    if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        imageMimeType = imageFile.type;
    }

    const result = await apiCall<{ videoUrl: string; canExtend: boolean }>('generate-video', {
        prompt,
        aspectRatio,
        imageBase64,
        imageMimeType,
        sessionId: getSessionId(),
    });

    return result.videoUrl;
};

// ============================================
// Veo Video Extension
// ============================================
export const extendVeoVideo = async (prompt: string) => {
    const result = await apiCall<{ videoUrl: string; canExtend: boolean }>('extend-video', {
        prompt,
        sessionId: getSessionId(),
    });

    return result.videoUrl;
};

// ============================================
// Location Scout (Maps)
// ============================================
export const findFilmingLocations = async (aesthetic: string, city: string) => {
    return apiCall<{ text: string; chunks: any[] }>('find-locations', { aesthetic, city });
};

// ============================================
// Deep Oracle (Thinking Model)
// ============================================
export const deepThinkTrends = async (niche: string) => {
    const result = await apiCall<{ analysis: string }>('deep-think-trends', { niche });
    return result.analysis;
};

// ============================================
// Podcast Studio (Multi-Speaker TTS)
// ============================================
export const generatePodcast = async (
    dialogue: Array<{ speaker: 'Host' | 'Guest'; text: string }>
) => {
    const result = await apiCall<{ audioUrl: string }>('generate-podcast', { dialogue });
    return result.audioUrl;
};

// ============================================
// Smart Asset Manager (Function Calling)
// ============================================
export const tagAndOrganizeAsset = async (file: File) => {
    const base64 = await fileToBase64(file);
    const result = await apiCall<{ metadata: any }>('tag-asset', {
        base64,
        mimeType: file.type,
    });
    return result.metadata;
};

// ============================================
// Trending Topics
// ============================================
export const getTrendingTopics = async (niche: string) => {
    return apiCall<{ trends: any[]; sources: any[] }>('trending-topics', { niche });
};

// ============================================
// Content Repurposing
// ============================================
export const repurposeContent = async (sourceText: string, formats: string[]) => {
    // This was returning empty array in original - keeping as placeholder
    return [];
};

// ============================================
// Image Generation
// ============================================
export const generateImage = async (
    prompt: string,
    size: '1K' | '2K' | '4K' = '1K',
    aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '1:1'
) => {
    const result = await apiCall<{ imageUrl: string }>('generate-image', {
        prompt,
        size,
        aspectRatio,
    });
    return result.imageUrl;
};

// ============================================
// Image Editing
// ============================================
export const editImage = async (imageFile: File, prompt: string) => {
    const imageBase64 = await fileToBase64(imageFile);
    const result = await apiCall<{ imageUrl: string }>('edit-image', {
        imageBase64,
        mimeType: imageFile.type,
        prompt,
    });
    return result.imageUrl;
};

// ============================================
// Image Analysis
// ============================================
export const analyzeImage = async (imageFile: File, prompt: string) => {
    const imageBase64 = await fileToBase64(imageFile);
    const result = await apiCall<{ analysis: string }>('analyze-image', {
        imageBase64,
        mimeType: imageFile.type,
        prompt,
    });
    return result.analysis;
};

// ============================================
// Text-to-Speech
// ============================================
export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
    const result = await apiCall<{ audioUrl: string }>('generate-speech', { text, voiceName });
    return result.audioUrl;
};

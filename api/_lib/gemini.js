import { GoogleGenAI, Type } from "@google/genai";

// Shared Gemini client for all API routes
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
}

export const ai = new GoogleGenAI({ apiKey: API_KEY });
export { Type };

// Helper to add CORS headers for Vercel
export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

// Helper to create error response
export function errorResponse(message, status = 500) {
    return new Response(
        JSON.stringify({ error: message }),
        {
            status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        }
    );
}

// Helper to create JSON response
export function jsonResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        }
    );
}

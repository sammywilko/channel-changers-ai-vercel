import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../../services/api';

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (global.fetch as any).mockReset();
    });

    describe('researchBrand', () => {
        it('should call the brand-research endpoint', async () => {
            const mockResponse = {
                icp_summary: 'Test summary',
                pain_points: ['point 1'],
                desires: ['desire 1'],
                archetype_name: 'Test Archetype',
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await api.researchBrand('Test Brand', 'https://test.com');

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/gemini/brand-research',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw on API error', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'API Error' }),
            });

            await expect(api.researchBrand('Test', 'https://test.com')).rejects.toThrow('API Error');
        });
    });

    describe('generateVeoVideo', () => {
        it('should call generate-video endpoint with correct params', async () => {
            const mockResponse = { videoUrl: '/api/media/video?uri=test', canExtend: true };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            // Mock sessionStorage
            (sessionStorage.getItem as any).mockReturnValue('session-123');

            const result = await api.generateVeoVideo('Test prompt', '16:9');

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/gemini/generate-video',
                expect.objectContaining({
                    method: 'POST',
                })
            );
            expect(result).toBe('/api/media/video?uri=test');
        });
    });

    describe('generateImage', () => {
        it('should call generate-image endpoint', async () => {
            const mockResponse = { imageUrl: 'data:image/png;base64,abc123' };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await api.generateImage('A cat', '1K', '1:1');

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/gemini/generate-image',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"prompt":"A cat"'),
                })
            );
            expect(result).toBe('data:image/png;base64,abc123');
        });
    });

    describe('getTrendingTopics', () => {
        it('should return trending topics for a niche', async () => {
            const mockResponse = {
                trends: [{ topic: 'AI', summary: 'Trending', viral_reason: 'Tech' }],
                sources: [],
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await api.getTrendingTopics('technology');

            expect(result.trends).toHaveLength(1);
            expect(result.trends[0].topic).toBe('AI');
        });
    });

    describe('checkScriptBanger', () => {
        it('should analyze a script and return scores', async () => {
            const mockResponse = {
                id: 'test-id',
                total_score: 85,
                verdict: 'banger',
                strengths: ['Good hook'],
                weaknesses: [],
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await api.checkScriptBanger('Test script content');

            expect(result.total_score).toBe(85);
            expect(result.verdict).toBe('banger');
        });
    });

    describe('error handling', () => {
        it('should handle network errors', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            await expect(api.researchBrand('Test', 'https://test.com')).rejects.toThrow('Network error');
        });

        it('should handle malformed JSON responses', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                json: () => Promise.reject(new Error('Invalid JSON')),
            });

            await expect(api.generateImage('test', '1K', '1:1')).rejects.toThrow();
        });
    });
});

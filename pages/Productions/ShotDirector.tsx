import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';

interface ShotDescription {
    position: number;
    row: number;
    column: number;
    shotType: string;
    description: string;
}

export const ShotDirector: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [style, setStyle] = useState<'cinematic' | 'documentary' | 'commercial' | 'social'>('cinematic');
    const [preset, setPreset] = useState<'default' | 'product' | 'character'>('default');
    const [gridImageUrl, setGridImageUrl] = useState<string>('');
    const [sceneAnalysis, setSceneAnalysis] = useState<string>('');
    const [shotDescriptions, setShotDescriptions] = useState<ShotDescription[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!imageFile) {
            setError('Please upload an image first');
            return;
        }

        setLoading(true);
        setError('');
        setGridImageUrl('');

        try {
            // Convert file to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64 = result.split(',')[1] ?? '';
                    resolve(base64);
                };
                reader.readAsDataURL(imageFile);
            });

            const imageBase64 = await base64Promise;

            const response = await fetch('/api/gemini/shot-director', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64,
                    imageMimeType: imageFile.type,
                    style,
                    preset
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate shot grid');
            }

            const data = await response.json();
            setGridImageUrl(data.gridImageUrl);
            setSceneAnalysis(data.sceneAnalysis);
            setShotDescriptions(data.shotDescriptions || []);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'Failed to generate shot grid');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">🎬 Shot Director</h2>
                    <p className="text-muted-foreground mt-1">
                        Transform one image into 9 cinematographic camera angles
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reference Image</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Upload Image</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* Preview */}
                        {imagePreview && (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Reference"
                                    className="w-full max-h-64 object-contain rounded-md border border-border"
                                />
                            </div>
                        )}

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Style</label>
                                <Select value={style} onChange={e => setStyle(e.target.value as typeof style)}>
                                    <option value="cinematic">Cinematic</option>
                                    <option value="documentary">Documentary</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="social">Social Media</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Preset</label>
                                <Select value={preset} onChange={e => setPreset(e.target.value as typeof preset)}>
                                    <option value="default">Default (9 Angles)</option>
                                    <option value="product">Product Shots</option>
                                    <option value="character">Character Study</option>
                                </Select>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            isLoading={loading}
                            className="w-full"
                            disabled={!imageFile}
                        >
                            {loading ? 'Generating 9 Shots...' : '🎬 Generate Shot Grid'}
                        </Button>

                        {loading && (
                            <p className="text-xs text-muted-foreground text-center">
                                This may take 15-30 seconds...
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Result Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Shot Grid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {gridImageUrl ? (
                            <div className="space-y-4">
                                <div className="relative group">
                                    <img
                                        src={gridImageUrl}
                                        alt="Shot Grid"
                                        className="w-full rounded-md shadow-lg"
                                    />
                                    <a
                                        href={gridImageUrl}
                                        download={`shot-grid-${Date.now()}.png`}
                                        className="absolute bottom-3 right-3 bg-black/80 text-white px-4 py-2 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                                    >
                                        📥 Download Grid
                                    </a>
                                </div>

                                {/* Scene Analysis */}
                                {sceneAnalysis && (
                                    <div className="p-3 bg-secondary/30 rounded-md">
                                        <h4 className="text-sm font-medium mb-1">Scene Analysis</h4>
                                        <p className="text-xs text-muted-foreground">{sceneAnalysis}</p>
                                    </div>
                                )}

                                {/* Shot Descriptions */}
                                {shotDescriptions.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {shotDescriptions.map((shot) => (
                                            <div
                                                key={shot.position}
                                                className="p-2 bg-secondary/20 rounded text-center"
                                            >
                                                <span className="text-xs font-medium text-primary">
                                                    {shot.shotType}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-80 flex flex-col items-center justify-center bg-black/20 rounded-md text-muted-foreground">
                                <div className="text-4xl mb-2">🎬</div>
                                <p className="text-sm">
                                    {loading ? 'Generating your shots...' : 'Upload an image and click Generate'}
                                </p>
                                <p className="text-xs mt-2 opacity-60">
                                    Your 3x3 shot grid will appear here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* How It Works */}
            <Card>
                <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-2">
                            <div className="text-3xl">📸</div>
                            <h4 className="font-medium">1. Upload Reference</h4>
                            <p className="text-xs text-muted-foreground">
                                Upload any image - a scene, product, or character
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl">🤖</div>
                            <h4 className="font-medium">2. AI Analyzes</h4>
                            <p className="text-xs text-muted-foreground">
                                Gemini understands your scene and generates variations
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl">🎬</div>
                            <h4 className="font-medium">3. Get 9 Angles</h4>
                            <p className="text-xs text-muted-foreground">
                                Receive a complete shot list for storyboarding
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

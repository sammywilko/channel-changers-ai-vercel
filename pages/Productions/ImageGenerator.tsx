import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { generateImage, editImage } from '../../services/geminiService';

export const ImageGenerator: React.FC = () => {
  const location = useLocation();
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '3:4' | '4:3'>('1:1');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.initialPrompt) {
      setPrompt(location.state.initialPrompt);
    }
  }, [location.state]);

  const handleAction = async () => {
    if (!prompt) return alert("Enter a prompt");
    setLoading(true);
    setResultUrl('');
    
    try {
        let url;
        if (mode === 'generate') {
            url = await generateImage(prompt, size, aspectRatio);
        } else {
            if (!imageFile) return alert("Upload an image to edit");
            url = await editImage(imageFile, prompt);
        }
        if (url) setResultUrl(url);
    } catch (e) {
        console.error(e);
        alert("Operation failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Image Studio</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex gap-4 border-b border-border pb-2">
                <button 
                    onClick={() => setMode('generate')}
                    className={`text-sm font-medium px-4 py-2 rounded-t-md transition-colors ${mode === 'generate' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                    Generate (Nano Banana Pro)
                </button>
                <button 
                    onClick={() => setMode('edit')}
                    className={`text-sm font-medium px-4 py-2 rounded-t-md transition-colors ${mode === 'edit' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                    Edit (Nano Banana Flash)
                </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Prompt</label>
                <textarea 
                    className="w-full h-24 rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={mode === 'generate' ? "A futuristic robot holding a skateboard..." : "Add a retro filter, remove background..."}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                />
            </div>

            {mode === 'generate' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Image Size</label>
                        <Select value={size} onChange={e => setSize(e.target.value as any)}>
                            <option value="1K">Standard (1K)</option>
                            <option value="2K">High Quality (2K)</option>
                            <option value="4K">Ultra Quality (4K)</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Aspect Ratio</label>
                        <Select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)}>
                            <option value="1:1">Square (1:1) - Instagram</option>
                            <option value="16:9">Landscape (16:9) - YouTube/Web</option>
                            <option value="9:16">Portrait (9:16) - TikTok/Reels</option>
                            <option value="4:3">Standard (4:3) - Classic</option>
                            <option value="3:4">Portrait (3:4) - Social Feed</option>
                        </Select>
                    </div>
                </div>
            )}

            {mode === 'edit' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Source Image</label>
                    <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </div>
            )}

            <Button onClick={handleAction} isLoading={loading} className="w-full">
                {mode === 'generate' ? 'Generate Image' : 'Edit Image'}
            </Button>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Result</CardTitle></CardHeader>
            <CardContent>
                {resultUrl ? (
                    <div className="relative group">
                        <img src={resultUrl} alt="Generated" className="w-full rounded-md shadow-md" />
                        <a 
                            href={resultUrl} 
                            download={`generated-${Date.now()}.png`}
                            className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Download
                        </a>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center bg-black/20 rounded-md text-muted-foreground">
                        {loading ? 'Processing...' : 'Image will appear here'}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
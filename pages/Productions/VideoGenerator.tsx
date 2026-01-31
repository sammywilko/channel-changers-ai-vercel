import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { generateVeoVideo, extendVeoVideo } from '../../services/geminiService';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [canExtend, setCanExtend] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return alert("Please enter a prompt");
    setIsGenerating(true);
    setVideoUrl('');
    setCanExtend(false);
    try {
      const url = await generateVeoVideo(prompt, aspectRatio, imageFile || undefined);
      setVideoUrl(url);
      setCanExtend(true);
    } catch (error) {
      console.error(error);
      alert("Generation failed. Check console/API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtend = async () => {
      if (!videoUrl) return;
      setIsGenerating(true);
      try {
          const url = await extendVeoVideo(prompt || "Extend this scene naturally");
          setVideoUrl(url); // Update to new extended video
      } catch (error) {
          console.error(error);
          alert("Extension failed");
      } finally {
          setIsGenerating(false);
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Veo Video Generator</h2>
        <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          Powered by Veo
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Director's Chair</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex justify-between">
                  <span>Prompt</span>
                  <span className="text-xs text-muted-foreground">Be descriptive</span>
              </label>
              <textarea 
                className="w-full h-32 rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none font-sans"
                placeholder="Describe the video... (e.g. A neon hologram of a cat running through a cyberpunk city, cinematic lighting, 4k)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Image (Optional)</label>
              <div className={`border border-input rounded-md p-4 bg-secondary/30 transition-colors ${imageFile ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="ref-img" />
                  <label htmlFor="ref-img" className="cursor-pointer flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center border border-border text-lg">
                          🖼️
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-medium">{imageFile ? imageFile.name : 'Upload Reference Image'}</p>
                          <p className="text-xs text-muted-foreground">{imageFile ? 'Ready to animate' : 'Bring a static image to life'}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); document.getElementById('ref-img')?.click() }}>
                          Browse
                      </Button>
                  </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <Select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as any)}>
                <option value="16:9">Landscape (16:9) - YouTube/Web</option>
                <option value="9:16">Portrait (9:16) - TikTok/Reels</option>
              </Select>
            </div>

            <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full h-12 text-lg" disabled={isGenerating}>
              {isGenerating ? 'Generating Video...' : 'Generate with Veo'}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Preview Monitor</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center min-h-[400px]">
            {videoUrl ? (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black aspect-video ring-1 ring-border">
                    <video controls autoPlay loop className="w-full h-full object-contain" src={videoUrl}>
                        Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex justify-center gap-4">
                    <a href={videoUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline">⬇️ Download</Button>
                    </a>
                    {canExtend && (
                        <Button onClick={handleExtend} isLoading={isGenerating} variant="secondary">
                            ➕ Extend (+5s)
                        </Button>
                    )}
                  </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-black/20 rounded-lg border border-border/50 relative overflow-hidden p-8">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-6 z-10">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono">Veo</div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-lg font-medium animate-pulse text-foreground">Creating your video...</p>
                            <p className="text-sm text-muted-foreground">This can take up to 60 seconds</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-4 text-4xl">
                            🎬
                        </div>
                        <p className="text-lg font-medium text-foreground">Ready to Create</p>
                        <p className="text-sm text-center max-w-xs mt-2">Enter a prompt or upload an image to start generating high-quality video.</p>
                    </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
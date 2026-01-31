import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { analyzeVideo } from '../../services/geminiService';

export const VideoAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [prompt, setPrompt] = useState('Analyze this video for hooks, retention strategies, and brand alignment.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [mode, setMode] = useState<'upload' | 'youtube'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (mode === 'upload' && !file) return alert("Please select a file");
    if (mode === 'youtube' && !youtubeLink) return alert("Please enter a URL");

    setIsAnalyzing(true);
    setResult('');

    try {
      if (mode === 'upload' && file) {
        const analysis = await analyzeVideo(file, prompt);
        setResult(analysis || "No analysis returned.");
      } else {
        // Mocking YouTube analysis for this frontend demo
        await new Promise(r => setTimeout(r, 2000));
        setResult(`(Simulation) Analysis of YouTube Video: ${youtubeLink}\n\n1. **Hook**: Strong visual start with high contrast.\n2. **Pacing**: Fast cuts every 2 seconds keep retention high.\n3. **Content**: Matches standard viral formats for tech reviews.\n4. **Audio**: Music swells during key reveals.`);
      }
    } catch (error) {
      console.error(error);
      setResult("Error analyzing video. Ensure API key is valid and file size is supported.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Video Understanding</h2>
        <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          Powered by Gemini 1.5 Pro
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Input Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 border-b border-border pb-4">
              <button 
                className={`text-sm font-medium pb-1 transition-colors ${mode === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setMode('upload')}
              >
                Upload File
              </button>
              <button 
                className={`text-sm font-medium pb-1 transition-colors ${mode === 'youtube' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setMode('youtube')}
              >
                YouTube Link
              </button>
            </div>

            {mode === 'upload' ? (
              <div className={`border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors ${file ? 'bg-primary/5 border-primary/50' : 'hover:bg-secondary/30'}`}>
                <Input type="file" accept="video/*" onChange={handleFileChange} className="hidden" id="video-upload" />
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <span className="text-4xl">📤</span>
                  <span className="text-sm font-medium">Click to upload video</span>
                  <span className="text-xs text-muted-foreground">MP4, MOV up to 50MB</span>
                </label>
                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-primary text-sm font-medium bg-background/50 py-1 px-3 rounded-full">
                    <span>🎥</span> {file.name}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube URL</label>
                <Input 
                  placeholder="https://youtube.com/watch?v=..." 
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Prompt</label>
              <textarea 
                className="w-full h-32 rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none font-sans"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <Button onClick={handleAnalyze} isLoading={isAnalyzing} className="w-full">
              {isAnalyzing ? 'Analyzing Frames...' : 'Run Analysis'}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full min-h-[500px]">
          <CardHeader>
            <CardTitle>Insights & Strategy</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-primary space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xl">👁️</div>
                </div>
                <div className="text-center space-y-2">
                   <p className="font-medium text-lg">Analyzing Video Content...</p>
                   <p className="text-sm text-muted-foreground">Identifying hooks, pacing, and visual patterns</p>
                </div>
                <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-2/3"></div>
                </div>
              </div>
            ) : result ? (
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap bg-secondary/30 p-6 rounded-md flex-1 overflow-y-auto border border-border/50">
                {result}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-md m-2">
                <span className="text-5xl mb-4 opacity-50">📊</span>
                <p className="text-sm font-medium">Results will appear here</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Upload a video to start</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
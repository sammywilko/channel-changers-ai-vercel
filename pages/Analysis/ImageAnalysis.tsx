import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { analyzeImage } from '../../services/geminiService';

export const ImageAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Describe this image in detail and identify key brand elements.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleAnalyze = async () => {
      if (!file) return alert("Select a file");
      setLoading(true);
      try {
          const text = await analyzeImage(file, prompt);
          setResult(text || "No result");
      } catch (e) {
          console.error(e);
          alert("Analysis failed");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Image Analysis</h2>
        <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          Powered by Gemini 1.5 Pro
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-fit">
            <CardHeader><CardTitle>Upload Asset</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className={`border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors ${file ? 'bg-primary/5 border-primary/50' : 'hover:bg-secondary/30'}`}>
                    <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" id="img-up" />
                    <label htmlFor="img-up" className="cursor-pointer block">
                        <span className="text-4xl block mb-2">📷</span>
                        <span className="text-sm font-medium underline decoration-primary/50 underline-offset-4">Click to upload image</span>
                    </label>
                    {file && <p className="text-xs mt-3 text-primary font-mono">{file.name}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Prompt</label>
                    <textarea 
                        className="w-full h-24 rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                    />
                </div>
                <Button onClick={handleAnalyze} isLoading={loading} className="w-full">
                    {loading ? 'Analyzing...' : 'Analyze with Gemini Pro'}
                </Button>
            </CardContent>
        </Card>
        
        <Card className="flex flex-col h-full min-h-[400px]">
            <CardHeader><CardTitle>AI Insights</CardTitle></CardHeader>
            <CardContent className="flex-1 flex flex-col">
                {loading ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-primary space-y-4 animate-in fade-in">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-medium">Analyzing Visuals...</p>
                    </div>
                ) : result ? (
                    <div className="flex-1 flex flex-col">
                        <div className="prose prose-invert prose-sm max-h-[500px] overflow-y-auto bg-secondary/30 p-6 rounded-md border border-border/50 flex-1">
                            {result}
                        </div>
                        <Button 
                            variant="secondary" 
                            className="mt-4 w-full"
                            onClick={() => navigate('/productions/images', { 
                                state: { initialPrompt: `Create an image based on these visual insights: ${result.substring(0, 250)}...` } 
                            })}
                        >
                            🎨 Generate Variant from Insights
                        </Button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-md m-2">
                        <span className="text-4xl mb-3 opacity-50">🔍</span>
                        <p className="text-sm">Analysis results will appear here</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
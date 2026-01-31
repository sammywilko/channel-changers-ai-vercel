import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { repurposeContent } from '../../services/geminiService';

export const Repurposer: React.FC = () => {
  const [content, setContent] = useState('');
  const [formats, setFormats] = useState({
      twitter: true,
      linkedin: false,
      blog: false,
      newsletter: false
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRepurpose = async () => {
    if (!content) return;
    const selectedFormats = Object.entries(formats).filter(([_, v]) => v).map(([k]) => k);
    if (selectedFormats.length === 0) return alert("Select at least one format");
    
    setLoading(true);
    try {
        const res = await repurposeContent(content, selectedFormats);
        setResults(res);
    } catch (e) {
        console.error(e);
        alert("Repurposing failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Content Repurposer</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Source Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <textarea 
                    className="w-full h-64 rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Paste your video script, transcript, or rough notes here..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                
                <div className="space-y-2">
                    <label className="text-sm font-medium">Target Formats</label>
                    <div className="flex flex-wrap gap-4">
                        {(Object.keys(formats) as Array<keyof typeof formats>).map(f => (
                            <label key={f} className="flex items-center gap-2 cursor-pointer border border-input px-3 py-2 rounded-md hover:bg-secondary/50">
                                <input 
                                    type="checkbox" 
                                    checked={formats[f]} 
                                    onChange={e => setFormats({...formats, [f]: e.target.checked})}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="capitalize text-sm">{f}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <Button onClick={handleRepurpose} isLoading={loading} className="w-full">
                    Generate Variants
                </Button>
            </CardContent>
        </Card>

        <Card className="flex flex-col h-full min-h-[500px]">
            <CardHeader><CardTitle>Output Assets</CardTitle></CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-6">
                {results.length > 0 ? (
                    results.map((item, i) => (
                        <div key={i} className="border border-border rounded-md p-4 bg-secondary/20">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold uppercase text-muted-foreground">{item.format}</span>
                                <button 
                                    className="text-xs text-primary hover:underline"
                                    onClick={() => navigator.clipboard.writeText(item.content)}
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <p>Generated content will appear here</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { findFilmingLocations } from '../../services/geminiService';

export const LocationScout: React.FC = () => {
  const [city, setCity] = useState('');
  const [aesthetic, setAesthetic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [chunks, setChunks] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!city || !aesthetic) return alert("Please fill in both fields");
    setLoading(true);
    try {
        const { text, chunks } = await findFilmingLocations(aesthetic, city);
        setResult(text || "No locations found.");
        setChunks(chunks || []);
    } catch (e) {
        console.error(e);
        alert("Location search failed.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Location Scout</h2>
        <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          Powered by Google Maps Grounding
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-fit">
            <CardHeader><CardTitle>Scouting Parameters</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">City / Area</label>
                    <Input placeholder="e.g. Shinjuku, Tokyo" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Visual Aesthetic</label>
                    <Input placeholder="e.g. Neon Noir, Minimalist Brutalism" value={aesthetic} onChange={e => setAesthetic(e.target.value)} />
                </div>
                <Button onClick={handleSearch} isLoading={loading} className="w-full">
                    Find Locations
                </Button>
            </CardContent>
        </Card>

        <Card className="min-h-[500px]">
            <CardHeader><CardTitle>Scout Report</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {chunks.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Verified Maps Data:</p>
                        {chunks.map((chunk, i) => (
                            <div key={i} className="bg-secondary/30 p-3 rounded-md border border-border flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm text-primary">{chunk.web?.title || "Unknown Location"}</p>
                                </div>
                                <a href={chunk.web?.uri} target="_blank" rel="noreferrer">
                                    <Button size="sm" variant="outline">View Map</Button>
                                </a>
                            </div>
                        ))}
                    </div>
                )}
                
                {result ? (
                    <div className="prose prose-invert prose-sm">
                        {/* Basic Markdown Rendering could go here */}
                        <div className="whitespace-pre-wrap">{result}</div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        Enter details to scout locations.
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { tagAndOrganizeAsset } from '../../services/geminiService';

export const AssetManager: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  const handleUpload = async () => {
      if(!file) return;
      setLoading(true);
      try {
          const result = await tagAndOrganizeAsset(file);
          setMetadata(result);
      } catch (e) {
          console.error(e);
          alert("Failed to analyze asset");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Smart Asset Manager</h2>
        <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            Tool Use & Function Calling
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Upload Creative</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                    <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" id="asset-up" />
                    <label htmlFor="asset-up" className="cursor-pointer block">
                        <span className="text-4xl block mb-4">📂</span>
                        <span className="text-sm underline">Click to upload raw asset</span>
                    </label>
                    {file && <p className="mt-4 text-primary font-medium">{file.name}</p>}
                </div>
                <Button onClick={handleUpload} isLoading={loading} className="w-full">
                    Analyze & Tag
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Automated Metadata</CardTitle></CardHeader>
            <CardContent>
                {metadata ? (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase text-muted-foreground font-bold mb-2">Category</p>
                            <Badge variant="blue" className="text-lg">{metadata.category}</Badge>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-muted-foreground font-bold mb-2">Mood</p>
                            <p className="text-lg font-medium">{metadata.mood}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-muted-foreground font-bold mb-2">Visual Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {metadata.tags.map((tag: string, i: number) => (
                                    <Badge key={i} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-md text-sm text-center">
                            ✅ Asset saved to database
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        {loading ? 'AI is watching and tagging...' : 'Upload an asset to see automated tagging.'}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
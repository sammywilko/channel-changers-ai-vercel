import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { generatePodcast } from '../../services/geminiService';

type DialogueLine = { id: string; speaker: 'Host' | 'Guest'; text: string };

export const PodcastStudio: React.FC = () => {
  const [lines, setLines] = useState<DialogueLine[]>([
      { id: '1', speaker: 'Host', text: 'Welcome back to the Future of Tech. Today we are discussing AI.' },
      { id: '2', speaker: 'Guest', text: 'Thanks for having me. The landscape is changing rapidly.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const addLine = () => {
      setLines([...lines, { id: crypto.randomUUID(), speaker: lines[lines.length-1].speaker === 'Host' ? 'Guest' : 'Host', text: '' }]);
  };

  const updateLine = (id: string, text: string) => {
      setLines(lines.map(l => l.id === id ? { ...l, text } : l));
  };

  const handleGenerate = async () => {
      setLoading(true);
      try {
          const url = await generatePodcast(lines);
          setAudioUrl(url);
      } catch(e) {
          console.error(e);
          alert("Podcast generation failed");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Podcast Studio</h2>
        <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          Multi-Speaker TTS
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="h-[600px] flex flex-col">
            <CardHeader><CardTitle>Script</CardTitle></CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
                {lines.map((line) => (
                    <div key={line.id} className={`flex gap-3 ${line.speaker === 'Host' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${line.speaker === 'Host' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-500'}`}>
                            {line.speaker}
                        </div>
                        <textarea 
                            className="flex-1 bg-secondary/30 rounded-md p-3 text-sm border border-transparent focus:border-border resize-none h-20"
                            value={line.text}
                            onChange={(e) => updateLine(line.id, e.target.value)}
                        />
                    </div>
                ))}
                <Button variant="outline" onClick={addLine} className="w-full border-dashed">+ Add Line</Button>
            </CardContent>
            <div className="p-6 border-t border-border">
                <Button onClick={handleGenerate} isLoading={loading} className="w-full">Generate Podcast</Button>
            </div>
        </Card>

        <Card>
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px]">
                {audioUrl ? (
                    <div className="text-center space-y-6">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-600 animate-pulse mx-auto flex items-center justify-center">
                            <span className="text-4xl">🎙️</span>
                        </div>
                        <div>
                            <audio controls src={audioUrl} className="w-full max-w-md" />
                        </div>
                        <a href={audioUrl} download="podcast.wav">
                            <Button variant="ghost">Download WAV</Button>
                        </a>
                    </div>
                ) : (
                    <p className="text-muted-foreground">Generate audio to listen</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { generateSpeech } from '../../services/geminiService';

export const AudioGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [loading, setLoading] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);

  const handleGenerate = async () => {
      if (!text) return;
      setLoading(true);
      try {
          const data = await generateSpeech(text, voice);
          setAudioData(data);
      } catch (e) {
          console.error(e);
          alert("TTS Failed");
      } finally {
          setLoading(false);
      }
  };

  const playAudio = () => {
      if (!audioData) return;
      // Decode base64 to array buffer and play
      const binaryString = window.atob(audioData);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // Create blob (assuming raw pcm is wrapped or wav if supported, for simplicity using generic audio approach or need specific PCM player)
      // Note: The Gemini API returns raw PCM. Playing it in browser requires AudioContext.
      // For this demo, we will try to play it using AudioContext as required by instructions.
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const int16 = new Int16Array(bytes.buffer);
      // Convert Int16 to Float32
      const float32 = new Float32Array(int16.length);
      for(let i=0; i<int16.length; i++) {
          float32[i] = int16[i] / 32768.0;
      }
      
      const buffer = audioCtx.createBuffer(1, float32.length, 24000); // 24kHz default
      buffer.getChannelData(0).set(float32);
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Audio Studio</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Text to Speech</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <textarea 
                    className="w-full h-32 rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Enter text to speak..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <div className="space-y-2">
                    <label className="text-sm font-medium">Voice</label>
                    <Select value={voice} onChange={e => setVoice(e.target.value)}>
                        <option value="Kore">Kore (Balanced)</option>
                        <option value="Puck">Puck (Energetic)</option>
                        <option value="Charon">Charon (Deep)</option>
                        <option value="Fenrir">Fenrir (Authoritative)</option>
                        <option value="Zephyr">Zephyr (Calm)</option>
                    </Select>
                </div>
                <Button onClick={handleGenerate} isLoading={loading} className="w-full">
                    Generate Speech
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Output</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64">
                {audioData ? (
                    <div className="text-center space-y-4">
                        <div className="text-6xl">🔊</div>
                        <p className="text-sm text-muted-foreground">Audio Generated</p>
                        <Button onClick={playAudio} variant="secondary">Play Audio</Button>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No audio generated yet.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
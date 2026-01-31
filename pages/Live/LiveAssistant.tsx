import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GoogleGenAI, Modality } from '@google/genai';

// Simple blob creation for PCM
function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const LiveAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [volume, setVolume] = useState(0);
  
  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<any>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
     // Initialize GenAI
     const apiKey = process.env.API_KEY || '';
     aiRef.current = new GoogleGenAI({ apiKey });
     return () => {
         stopSession();
     }
  }, []);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 10));

  const startSession = async () => {
    if (!aiRef.current) return;
    setIsActive(true);
    addLog("Connecting to Gemini Live...");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup Audio Contexts
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        inputContextRef.current = new AudioContext({ sampleRate: 16000 });
        outputContextRef.current = new AudioContext({ sampleRate: 24000 });

        // Connect session
        const sessionPromise = aiRef.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: "You are a helpful co-host for a live stream. Keep answers short, punchy, and engaging.",
            },
            callbacks: {
                onopen: () => {
                    addLog("Session Connected!");
                    
                    // Setup Input Stream
                    const source = inputContextRef.current!.createMediaStreamSource(stream);
                    const processor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        // Visualize volume roughly
                        let sum = 0;
                        for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                        setVolume(Math.sqrt(sum / inputData.length) * 100);

                        const blob = createBlob(inputData);
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({ media: blob });
                        });
                    };
                    
                    source.connect(processor);
                    processor.connect(inputContextRef.current!.destination);
                },
                onmessage: async (msg: any) => {
                    // Handle Audio Output
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && outputContextRef.current) {
                        const binary = atob(audioData);
                        const bytes = new Uint8Array(binary.length);
                        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                        
                        const int16 = new Int16Array(bytes.buffer);
                        const float32 = new Float32Array(int16.length);
                        for(let i=0; i<int16.length; i++) float32[i] = int16[i] / 32768.0;

                        const buffer = outputContextRef.current.createBuffer(1, float32.length, 24000);
                        buffer.getChannelData(0).set(float32);

                        const source = outputContextRef.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(outputContextRef.current.destination);
                        
                        const now = outputContextRef.current.currentTime;
                        const start = Math.max(nextStartTimeRef.current, now);
                        source.start(start);
                        nextStartTimeRef.current = start + buffer.duration;
                    }
                    
                    if (msg.serverContent?.turnComplete) {
                        addLog("Turn complete");
                    }
                },
                onclose: () => {
                    addLog("Session Closed");
                    setIsActive(false);
                },
                onerror: (e: any) => {
                    console.error(e);
                    addLog("Error: " + e.message);
                }
            }
        });
        
        sessionRef.current = await sessionPromise;

    } catch (e: any) {
        console.error(e);
        addLog("Failed to start: " + e.message);
        setIsActive(false);
    }
  };

  const stopSession = () => {
      if (sessionRef.current) {
          // No explicit close method in some SDK versions on the resolved object directly if it's a promise wrapper, 
          // but we usually just close contexts and let connection drop.
          // The SDK might expose close on the session object.
          // For now, close contexts.
      }
      if (inputContextRef.current) inputContextRef.current.close();
      if (outputContextRef.current) outputContextRef.current.close();
      setIsActive(false);
      setVolume(0);
      addLog("Stopped.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Live Assistant</h2>
        <Badge variant={isActive ? "success" : "default"} className={isActive ? "animate-pulse" : ""}>
            {isActive ? "🔴 ON AIR" : "OFFLINE"}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center min-h-[400px]">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-100 ${isActive ? "bg-primary/20 shadow-[0_0_40px_rgba(212,175,55,0.4)]" : "bg-secondary"}`}>
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center" style={{ transform: `scale(${1 + volume/50})` }}>
                    <span className="text-4xl text-primary-foreground">🎙️</span>
                </div>
            </div>
            
            <div className="mt-8 flex gap-4">
                {!isActive ? (
                    <Button onClick={startSession} size="lg" className="px-8">
                        Start Co-Host
                    </Button>
                ) : (
                    <Button onClick={stopSession} variant="destructive" size="lg" className="px-8">
                        Stop Session
                    </Button>
                )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
                Model: gemini-2.5-flash-native-audio-preview
            </p>
        </Card>

        <Card>
            <CardHeader><CardTitle>Session Logs</CardTitle></CardHeader>
            <CardContent>
                <div className="bg-black/50 rounded-md p-4 h-[300px] overflow-y-auto font-mono text-xs space-y-2">
                    {logs.map((log, i) => (
                        <div key={i} className="text-emerald-500">
                            <span className="opacity-50 mr-2">{new Date().toLocaleTimeString()}</span>
                            {log}
                        </div>
                    ))}
                    {logs.length === 0 && <span className="text-muted-foreground">Ready to connect...</span>}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
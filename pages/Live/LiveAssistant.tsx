import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const LiveAssistant: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Live Assistant</h2>
                <Badge variant="default">OFFLINE</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center">
                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-4xl">🎙️</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-4 max-w-md px-4">
                        <h3 className="text-xl font-semibold">Coming Soon</h3>
                        <p className="text-muted-foreground text-sm">
                            The Live Assistant uses Gemini's real-time audio API for live streaming co-hosting.
                            This feature requires additional server-side configuration.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Model: gemini-2.5-flash-native-audio-preview
                        </p>
                    </div>
                </Card>

                <Card>
                    <CardHeader><CardTitle>About Live Assistant</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-secondary/50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">✨ Features</h4>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li>• Real-time voice conversation with AI</li>
                                <li>• Live stream co-hosting support</li>
                                <li>• Audience Q&A handling</li>
                                <li>• Content suggestions in real-time</li>
                            </ul>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">🔧 Setup Required</h4>
                            <p className="text-sm text-muted-foreground">
                                This feature requires WebSocket server configuration and
                                Gemini Live API access. Contact support for enterprise setup.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
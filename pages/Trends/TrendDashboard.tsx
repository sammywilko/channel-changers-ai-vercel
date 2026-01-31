import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { getTrendingTopics, deepThinkTrends } from '../../services/geminiService';

export const TrendDashboard: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [trends, setTrends] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [oracleResult, setOracleResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'scan' | 'oracle'>('scan');

  const handleAction = async () => {
    if (!niche) return;
    setLoading(true);
    setOracleResult('');
    setTrends([]);
    
    try {
        if (mode === 'scan') {
            const { trends, sources } = await getTrendingTopics(niche);
            setTrends(trends);
            setSources(sources);
        } else {
            const result = await deepThinkTrends(niche);
            setOracleResult(result || '');
        }
    } catch (e) {
        console.error(e);
        alert("Operation failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Trend Intelligence</h2>
        <div className="flex gap-2">
            <Button 
                variant={mode === 'scan' ? 'primary' : 'outline'} 
                onClick={() => setMode('scan')}
                size="sm"
            >
                Search Grounding
            </Button>
            <Button 
                variant={mode === 'oracle' ? 'primary' : 'outline'} 
                onClick={() => setMode('oracle')}
                size="sm"
            >
                Deep Oracle (Thinking)
            </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader><CardTitle>{mode === 'scan' ? 'Real-time Scanner' : 'Strategic Oracle'}</CardTitle></CardHeader>
            <CardContent className="flex gap-4">
                <Input 
                    placeholder="Enter niche (e.g., 'AI Tools', 'Skincare', 'Crypto')" 
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    className="max-w-md"
                />
                <Button onClick={handleAction} isLoading={loading}>
                    {mode === 'scan' ? 'Scan Trends' : 'Consult Oracle'}
                </Button>
            </CardContent>
        </Card>

        {mode === 'scan' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trends.map((trend, i) => (
                    <Card key={i} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                 <CardTitle className="text-lg">{trend.topic}</CardTitle>
                                 <Badge variant="blue">Trending</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">{trend.summary}</p>
                            <div className="mt-auto">
                                <span className="text-xs font-bold text-foreground">Why Viral: </span>
                                <span className="text-xs text-primary">{trend.viral_reason}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        {mode === 'oracle' && oracleResult && (
            <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>🧠</span> Gemini 3.0 Strategic Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                        {oracleResult}
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
};
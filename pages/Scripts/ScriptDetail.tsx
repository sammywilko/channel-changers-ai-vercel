import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MockDb } from '../../services/mockDb';
import { checkScriptBanger } from '../../services/geminiService';
import { Script, ScriptStatus, BangerCheck } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ScriptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [script, setScript] = useState<Script | null>(null);
  const [bangerResult, setBangerResult] = useState<BangerCheck | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (id) {
      MockDb.getScriptById(id).then(s => s && setScript(s));
    }
  }, [id]);

  const handleBangerCheck = async () => {
    if (!script?.full_script) return;
    setChecking(true);
    const result = await checkScriptBanger(script.full_script);
    setBangerResult(result as BangerCheck);
    
    // Update script score locally
    const updated = await MockDb.updateScript(script.id, {
        banger_score: result.total_score,
        status: result.verdict === 'banger' ? ScriptStatus.Passed : ScriptStatus.PendingCheck
    });
    if (updated) setScript(updated);
    setChecking(false);
  };

  const handleSendToProduction = async () => {
      if(!script) return;
      await MockDb.createProduction(script.id);
      await MockDb.updateScript(script.id, { status: ScriptStatus.InProduction });
      navigate('/productions');
  };

  if (!script) return <div>Loading...</div>;

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-1">
           <h2 className="text-2xl font-bold tracking-tight">{script.title}</h2>
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <span>{script.brand_name}</span>
               <span>•</span>
               <Badge variant="outline">{script.track}</Badge>
               <span>•</span>
               <span>{script.platform}</span>
           </div>
        </div>
        <div className="flex gap-2">
            {script.status === 'passed' && (
                 <Button onClick={handleSendToProduction} variant="primary">🚀 Send to Production</Button>
            )}
            <Button onClick={handleBangerCheck} isLoading={checking} variant="secondary">
                🔥 Run Banger Check
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Main Script Editor */}
          <Card className="col-span-2 flex flex-col h-full">
              <CardHeader className="shrink-0 border-b border-border py-4">
                  <CardTitle className="text-base">Script Editor</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 relative">
                  <textarea 
                    className="w-full h-full bg-transparent p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                    value={script.full_script || ''}
                    onChange={(e) => setScript({...script, full_script: e.target.value})}
                  />
              </CardContent>
          </Card>

          {/* Sidebar Tools */}
          <div className="space-y-6 overflow-y-auto">
              {bangerResult ? (
                  <Card className="border-primary/50">
                      <CardHeader className="bg-primary/5">
                          <CardTitle className="text-primary flex justify-between items-center">
                              Banger Score
                              <span className="text-2xl font-bold">{bangerResult.total_score}/100</span>
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                          <div>
                              <div className="flex justify-between text-xs mb-1">
                                  <span>Hook Strength</span>
                                  <span>{bangerResult.hook_strength}/25</span>
                              </div>
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{width: `${(bangerResult.hook_strength/25)*100}%`}}></div>
                              </div>
                          </div>
                          
                          <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-muted-foreground">Strengths</h4>
                              <ul className="text-sm list-disc pl-4 space-y-1">
                                  {bangerResult.strengths.map((s,i) => <li key={i}>{s}</li>)}
                              </ul>
                          </div>

                          <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-muted-foreground">Improvements</h4>
                              <ul className="text-sm list-disc pl-4 space-y-1 text-amber-500">
                                  {bangerResult.weaknesses.map((s,i) => <li key={i}>{s}</li>)}
                              </ul>
                          </div>
                      </CardContent>
                  </Card>
              ) : (
                  <Card className="bg-secondary/20 border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                          <span className="text-2xl mb-2">⚖️</span>
                          <p className="text-sm">Run a Banger Check to analyze script viability.</p>
                      </CardContent>
                  </Card>
              )}

              <Card>
                  <CardHeader>
                      <CardTitle className="text-sm">Script Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                          <label className="text-xs text-muted-foreground">Hook</label>
                          <p className="text-sm italic">"{script.hook}"</p>
                      </div>
                      <div>
                          <label className="text-xs text-muted-foreground">Estimated Length</label>
                          <p className="text-sm">{script.length_seconds}s</p>
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
};
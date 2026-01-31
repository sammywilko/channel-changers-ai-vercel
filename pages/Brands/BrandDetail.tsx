import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MockDb } from '../../services/mockDb';
import { researchBrand } from '../../services/geminiService';
import { Brand } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const BrandDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  useEffect(() => {
    if (id) {
      MockDb.getBrandById(id).then(b => b && setBrand(b));
    }
  }, [id]);

  const handleRunResearch = async () => {
    if (!brand) return;
    setIsResearching(true);
    try {
      const result = await researchBrand(brand.name, brand.website_url);
      
      const updated = await MockDb.updateBrand(brand.id, {
        ...result,
        status: 'active' as any // Explicit cast for demo
      });
      if (updated) setBrand(updated);
    } catch (error) {
      alert("Research failed. Check console.");
    } finally {
      setIsResearching(false);
    }
  };

  if (!brand) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-3xl font-bold tracking-tight">{brand.name}</h2>
           <a href={brand.website_url} target="_blank" className="text-primary hover:underline text-sm">{brand.website_url}</a>
        </div>
        <div className="flex gap-2">
            {brand.status === 'draft' && (
                <Button onClick={handleRunResearch} isLoading={isResearching} variant="primary">
                  ✨ Run AI Research
                </Button>
            )}
            <Button variant="outline">Edit Brand</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* ICP Card */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Ideal Customer Profile (ICP)</CardTitle>
            </CardHeader>
            <CardContent>
                {brand.icp_summary ? (
                    <div className="space-y-4">
                        <p className="text-muted-foreground">{brand.icp_summary}</p>
                        
                        <div>
                            <h4 className="font-semibold text-sm mb-2 text-foreground">Pain Points</h4>
                            <div className="flex flex-wrap gap-2">
                                {brand.pain_points?.map((p, i) => (
                                    <Badge key={i} variant="destructive">{p}</Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm mb-2 text-foreground">Deep Desires</h4>
                            <div className="flex flex-wrap gap-2">
                                {brand.desires?.map((d, i) => (
                                    <Badge key={i} variant="success">{d}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="text-4xl mb-4">🔮</div>
                        <p className="text-muted-foreground mb-4">No research data yet.</p>
                        <Button onClick={handleRunResearch} isLoading={isResearching}>Start Analysis</Button>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Brand Specs */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Brand Archetype</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <span className="text-xs text-muted-foreground uppercase">Archetype</span>
                        <p className="font-medium text-lg text-primary">{brand.archetype_name || 'Not set'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground uppercase">Voice</span>
                        <p className="font-medium">{brand.voice_type || 'Not set'}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Nano Banana Brief</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-950 p-3 rounded-md border border-border text-xs font-mono text-muted-foreground">
                        {brand.nano_banana_character_brief || 'Waiting for generation...'}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};
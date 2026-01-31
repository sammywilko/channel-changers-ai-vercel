import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MockDb } from '../../services/mockDb';
import { Script, ScriptStatus, ScriptTrack } from '../../types';

export const ScriptList: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');

  useEffect(() => {
    MockDb.getScripts().then(setScripts);
  }, []);

  const filteredScripts = scripts.filter((script) => {
    const matchesSearch = 
      script.title.toLowerCase().includes(search.toLowerCase()) || 
      script.brand_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || script.status === statusFilter;
    const matchesTrack = trackFilter === 'all' || script.track === trackFilter;
    return matchesSearch && matchesStatus && matchesTrack;
  });

  const getStatusVariant = (status: ScriptStatus) => {
      switch(status) {
          case ScriptStatus.Passed: return 'success';
          case ScriptStatus.Failed: return 'destructive';
          case ScriptStatus.InProduction: return 'blue';
          case ScriptStatus.PendingCheck: return 'warning';
          default: return 'default';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Scripts</h2>
        <div className="space-x-2">
            <Link to="/scripts/new">
                <Button variant="primary">+ Generate Script</Button>
            </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Scripts</CardTitle>
            <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
              <div className="w-full md:w-64">
                <Input 
                  placeholder="Search title or brand..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full md:w-36">
                <Select 
                  value={trackFilter} 
                  onChange={(e) => setTrackFilter(e.target.value)}
                >
                  <option value="all">All Tracks</option>
                  <option value={ScriptTrack.Organic}>Organic</option>
                  <option value={ScriptTrack.Ads}>Ads</option>
                </Select>
              </div>
              <div className="w-full md:w-40">
                <Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value={ScriptStatus.Draft}>Draft</option>
                  <option value={ScriptStatus.PendingCheck}>Pending Check</option>
                  <option value={ScriptStatus.Passed}>Passed</option>
                  <option value={ScriptStatus.Failed}>Failed</option>
                  <option value={ScriptStatus.InProduction}>In Production</option>
                  <option value={ScriptStatus.Complete}>Complete</option>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Track</th>
                  <th className="px-4 py-3 font-medium">Banger Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredScripts.length > 0 ? (
                  filteredScripts.map((script) => (
                    <tr key={script.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{script.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{script.brand_name}</td>
                      <td className="px-4 py-3">
                          <Badge variant="outline">{script.track}</Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">
                          {script.banger_score ? script.banger_score : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(script.status)}>
                          {script.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/scripts/${script.id}`}>
                          <Button variant="ghost" size="sm">Open</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No scripts found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
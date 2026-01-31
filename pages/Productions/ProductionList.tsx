import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MockDb } from '../../services/mockDb';
import { Production, ProductionStatus } from '../../types';

export const ProductionList: React.FC = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    MockDb.getProductions().then(setProductions);
  }, []);

  const filteredProductions = productions.filter((prod) => {
    const matchesSearch = 
      prod.script_title?.toLowerCase().includes(search.toLowerCase()) || 
      prod.brand_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prod.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Productions</h2>
        <Link to="/productions/generate">
          <Button>✨ AI Video Generator</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Pipeline</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="w-full md:w-64">
                <Input 
                  placeholder="Search script or brand..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-40 shrink-0">
                <Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Stages</option>
                  <option value={ProductionStatus.Pending}>Pending</option>
                  <option value={ProductionStatus.GeneratingImages}>Generating Images</option>
                  <option value={ProductionStatus.GeneratingAnimations}>Generating Anim</option>
                  <option value={ProductionStatus.GeneratingVoice}>Generating Voice</option>
                  <option value={ProductionStatus.Assembling}>Assembling</option>
                  <option value={ProductionStatus.QAReview}>QA Review</option>
                  <option value={ProductionStatus.HumanReview}>Human Review</option>
                  <option value={ProductionStatus.Approved}>Approved</option>
                  <option value={ProductionStatus.Rejected}>Rejected</option>
                  <option value={ProductionStatus.Published}>Published</option>
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
                  <th className="px-4 py-3 font-medium">Script Title</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Current Stage</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProductions.length > 0 ? (
                  filteredProductions.map((prod) => (
                    <tr key={prod.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{prod.script_title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{prod.brand_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="blue">{prod.status.replace('_', ' ')}</Badge>
                          {/* Fake progress bar */}
                          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/productions/${prod.id}`}>
                          <Button variant="ghost" size="sm">View Assets</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No productions found matching your filters.
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
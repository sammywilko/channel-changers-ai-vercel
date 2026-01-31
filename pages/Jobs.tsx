import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MockDb } from '../services/mockDb';
import { Job, JobType, JobStatus } from '../types';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    MockDb.getJobs().then(setJobs);
    
    // Auto-refresh simulation
    const interval = setInterval(() => {
        MockDb.getJobs().then(setJobs);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.related_entity_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">System Jobs</h2>
        <Badge variant="outline" className="animate-pulse">● System Online</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Job Queue</CardTitle>
            <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
              <div className="w-full md:w-64">
                <Input 
                  placeholder="Search jobs..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full md:w-40">
                <Select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value={JobType.BrandResearch}>Brand Research</option>
                  <option value={JobType.ScriptGeneration}>Script Generation</option>
                  <option value={JobType.Production}>Production</option>
                </Select>
              </div>
              <div className="w-full md:w-36">
                <Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value={JobStatus.Pending}>Pending</option>
                  <option value={JobStatus.Processing}>Processing</option>
                  <option value={JobStatus.Complete}>Complete</option>
                  <option value={JobStatus.Failed}>Failed</option>
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
                  <th className="px-4 py-3 font-medium">Job Type</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Scheduled</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium uppercase text-xs tracking-wider">{job.job_type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-foreground font-medium">{job.related_entity_name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                            job.status === 'complete' ? 'success' :
                            job.status === 'processing' ? 'blue' :
                            job.status === 'failed' ? 'destructive' : 'warning'
                        }>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                          {new Date(job.scheduled_for).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{job.priority}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No jobs found matching your filters.
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
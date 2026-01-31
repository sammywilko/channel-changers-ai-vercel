import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { MockDb } from '../services/mockDb';
import { Job } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ scripts: 0, productions: 0, jobs: 0 });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [scripts, productions, jobs] = await Promise.all([
          MockDb.getScripts(),
          MockDb.getProductions(),
          MockDb.getJobs(),
        ]);

        setStats({
          scripts: scripts.length,
          productions: productions.length,
          jobs: jobs.filter(j => j.status === 'pending' || j.status === 'processing').length
        });
        setRecentJobs(jobs.slice(0, 5));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Last updated: Just now</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Scripts" value={stats.scripts} icon="📝" description="+2 from yesterday" />
        <StatsCard title="Active Productions" value={stats.productions} icon="🎥" description="4 in pipeline" />
        <StatsCard title="Jobs in Queue" value={stats.jobs} icon="⚡" description="Processing now" />
        <StatsCard title="Banger Score Avg" value="89" icon="🔥" description="Top 10% scripts" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Queue Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No recent jobs</p>
              ) : (
                recentJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{job.related_entity_name}</p>
                      <p className="text-xs text-muted-foreground">{job.job_type.replace('_', ' ')}</p>
                    </div>
                    <Badge variant={
                      job.status === 'complete' ? 'success' :
                        job.status === 'processing' ? 'blue' :
                          job.status === 'failed' ? 'destructive' : 'warning'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-md border border-border bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium flex items-center gap-2">
              <span>✨</span> New Brand Research
            </button>
            <button className="w-full text-left px-4 py-3 rounded-md border border-border bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium flex items-center gap-2">
              <span>✍️</span> Generate Script
            </button>
            <button className="w-full text-left px-4 py-3 rounded-md border border-border bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium flex items-center gap-2">
              <span>🚀</span> Deploy Morning Report
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatsCard: React.FC<{ title: string; value: string | number; icon: string; description: string }> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-2xl">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);
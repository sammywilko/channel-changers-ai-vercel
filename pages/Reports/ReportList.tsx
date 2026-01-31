import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { MockDb } from '../../services/mockDb';
import { CompetitorReport } from '../../types';

export const ReportList: React.FC = () => {
  const [reports, setReports] = useState<CompetitorReport[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    MockDb.getReports().then(setReports);
  }, []);

  const filteredReports = reports.filter((report) =>
    report.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Competitor Reports</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Daily Intelligence</CardTitle>
            <div className="w-full md:w-64">
              <Input
                placeholder="Search by brand name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Analyzed Items</th>
                  <th className="px-4 py-3 font-medium">Trends Spotted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{report.report_date}</td>
                      <td className="px-4 py-3 font-medium">{report.brand_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{report.analyzed_count} videos</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex gap-1 flex-wrap">
                          {report.trends_spotted.slice(0, 2).map((trend, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{trend}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={report.status === 'complete' ? 'success' : 'default'}>
                          {report.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-primary hover:underline text-xs font-medium">View Report</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No reports found for "{search}".
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
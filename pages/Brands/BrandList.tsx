import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MockDb } from '../../services/mockDb';
import { Brand, BrandStatus } from '../../types';

export const BrandList: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    MockDb.getBrands().then(setBrands);
  }, []);

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || brand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
        <Link to="/brands/new">
          <Button>+ New Brand</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Active Clients</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="w-full md:w-64">
                <Input 
                  placeholder="Search brands..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-32 shrink-0">
                <Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value={BrandStatus.Active}>Active</option>
                  <option value={BrandStatus.Draft}>Draft</option>
                  <option value={BrandStatus.Paused}>Paused</option>
                  <option value={BrandStatus.Archived}>Archived</option>
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
                  <th className="px-4 py-3 font-medium">Brand Name</th>
                  <th className="px-4 py-3 font-medium">Website</th>
                  <th className="px-4 py-3 font-medium">Archetype</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{brand.name}</td>
                      <td className="px-4 py-3 text-muted-foreground hover:underline">
                        <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                          {brand.website_url.replace('https://', '')}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{brand.archetype_name || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={brand.status === 'active' ? 'success' : 'default'}>
                          {brand.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/brands/${brand.id}`}>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No brands found matching your criteria.
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
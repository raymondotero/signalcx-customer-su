import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  TrendUp, 
  CurrencyDollar, 
  FunnelSimple, 
  SortAscending, 
  SortDescending,
  MagnifyingGlass,
  X
} from '@phosphor-icons/react';
import { Account } from '@/types';
import { AccountDetailsDialog } from '@/components/AccountDetailsDialog';

interface AccountsTableProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  selectedAccount?: Account;
}

type SortField = 'name' | 'industry' | 'arr' | 'healthScore' | 'contractEnd' | 'status';
type SortDirection = 'asc' | 'desc';

export function AccountsTable({ accounts, onSelectAccount, selectedAccount }: AccountsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [healthScoreFilter, setHealthScoreFilter] = useState<string>('all');
  const [arrFilter, setArrFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get unique industries for filter dropdown
  const uniqueIndustries = useMemo(() => {
    const industries = [...new Set(accounts.map(account => account.industry))];
    return industries.sort();
  }, [accounts]);

  // Filter and sort accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts.filter(account => {
      const matchesSearch = searchTerm === '' || 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.csam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.ae?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
      
      const matchesIndustry = industryFilter === 'all' || account.industry === industryFilter;
      
      const matchesHealthScore = healthScoreFilter === 'all' || 
        (healthScoreFilter === 'high' && account.healthScore >= 80) ||
        (healthScoreFilter === 'medium' && account.healthScore >= 60 && account.healthScore < 80) ||
        (healthScoreFilter === 'low' && account.healthScore < 60);

      const matchesARR = arrFilter === 'all' ||
        (arrFilter === 'high' && account.arr >= 5000000) ||
        (arrFilter === 'medium' && account.arr >= 1000000 && account.arr < 5000000) ||
        (arrFilter === 'low' && account.arr < 1000000);

      return matchesSearch && matchesStatus && matchesIndustry && matchesHealthScore && matchesARR;
    });

    // Sort accounts
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'industry':
          aValue = a.industry.toLowerCase();
          bValue = b.industry.toLowerCase();
          break;
        case 'arr':
          aValue = a.arr;
          bValue = b.arr;
          break;
        case 'healthScore':
          aValue = a.healthScore;
          bValue = b.healthScore;
          break;
        case 'contractEnd':
          aValue = new Date(a.contractEnd);
          bValue = new Date(b.contractEnd);
          break;
        case 'status':
          const statusOrder = { 'At Risk': 0, 'Watch': 1, 'Good': 2 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [accounts, searchTerm, statusFilter, industryFilter, healthScoreFilter, arrFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setIndustryFilter('all');
    setHealthScoreFilter('all');
    setArrFilter('all');
    setSortField('name');
    setSortDirection('asc');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || 
    industryFilter !== 'all' || healthScoreFilter !== 'all' || arrFilter !== 'all';
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <SortAscending className="w-4 h-4 ml-1" /> : 
      <SortDescending className="w-4 h-4 ml-1" />;
  };

  const getStatusColor = (status: Account['status']) => {
    switch (status) {
      case 'Good':
        return 'status-good';
      case 'Watch':
        return 'status-watch';
      case 'At Risk':
        return 'status-risk';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border-visible">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendUp className="w-5 h-5" />
          Customer Accounts
          <Badge variant="outline" className="ml-auto">
            {filteredAndSortedAccounts.length} of {accounts.length}
          </Badge>
        </CardTitle>
        
        {/* Filters and Search */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search accounts, CSAM, or AE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Watch">Watch</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {uniqueIndustries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={healthScoreFilter} onValueChange={setHealthScoreFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Health Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (80+)</SelectItem>
                <SelectItem value="medium">Medium (60-79)</SelectItem>
                <SelectItem value="low">Low (&lt;60)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={arrFilter} onValueChange={setArrFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="ARR Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ARR</SelectItem>
                <SelectItem value="high">High ($5M+)</SelectItem>
                <SelectItem value="medium">Medium ($1M-$5M)</SelectItem>
                <SelectItem value="low">Low (&lt;$1M)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 items-center">
              {hasActiveFilters && (
                <Button 
                  onClick={clearFilters}
                  size="sm"
                  className="text-xs px-3 py-1 h-8 border hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 h-8">
                <FunnelSimple className="w-3 h-3" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary rounded-full ml-1" />
                )}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center justify-between">
                  Account
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
                onClick={() => handleSort('industry')}
              >
                <div className="flex items-center justify-between">
                  Industry
                  {getSortIcon('industry')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
                onClick={() => handleSort('arr')}
              >
                <div className="flex items-center justify-between">
                  ARR
                  {getSortIcon('arr')}
                </div>
              </TableHead>
              <TableHead className="text-center">
                QoQ Growth
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
                onClick={() => handleSort('healthScore')}
              >
                <div className="flex items-center justify-between">
                  Health Score
                  {getSortIcon('healthScore')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center justify-between">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead>CSAM</TableHead>
              <TableHead>AE</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
                onClick={() => handleSort('contractEnd')}
              >
                <div className="flex items-center justify-between">
                  Contract End
                  {getSortIcon('contractEnd')}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {hasActiveFilters ? 'No accounts match your filters' : 'No accounts found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedAccounts.map((account) => (
                <TableRow 
                  key={account.id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    selectedAccount?.id === account.id ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                  onClick={() => onSelectAccount(account)}
                >
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.industry}</TableCell>
                  <TableCell className="font-mono">
                    ${(account.arr / 1000000).toFixed(1)}M
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {(() => {
                        // Generate stable growth based on account ID and status
                        const hash = account.id.split('').reduce((a, b) => {
                          a = ((a << 5) - a) + b.charCodeAt(0);
                          return a & a;
                        }, 0);
                        const seedRandom = Math.abs(hash) / 2147483647;
                        
                        const growth = account.status === 'Good' ? 
                          8 + seedRandom * 7 : // 8-15%
                          account.status === 'Watch' ? 
                          2 + seedRandom * 6 : // 2-8%
                          -2 + seedRandom * 4; // -2 to 2%
                        
                        const isPositive = growth > 0;
                        return (
                          <>
                            <span className={`text-xs font-medium ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isPositive ? '+' : ''}{growth.toFixed(1)}%
                            </span>
                            {isPositive ? 
                              <TrendUp className="w-3 h-3 text-green-600" /> :
                              <div className="w-3 h-3 text-red-600 rotate-180">
                                <TrendUp className="w-3 h-3" />
                              </div>
                            }
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            account.healthScore >= 80 ? 'bg-green-500' : 
                            account.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${account.healthScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{account.healthScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(account.status)}>
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.csam || 'N/A'}</TableCell>
                  <TableCell>{account.ae || 'N/A'}</TableCell>
                  <TableCell>{new Date(account.contractEnd).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        className="text-xs px-2 py-1 border hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAccount(account);
                        }}
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        Select
                      </Button>
                      <AccountDetailsDialog account={account} />
                      {account.expansionOpportunity && account.expansionOpportunity > 0 && (
                        <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CurrencyDollar className="w-3 h-3 mr-1" />
                          ${(account.expansionOpportunity / 1000).toFixed(0)}K
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
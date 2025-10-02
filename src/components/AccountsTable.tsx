import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  X,
  Calendar,
  Buildings
} from '@phosphor-icons/react';
import { Account } from '@/types';
import { AccountDetailsDialog } from '@/components/AccountDetailsDialog';
import { ExpansionOpportunitiesDialog } from '@/components/ExpansionOpportunitiesDialog';
import { QuickMeetingScheduler } from '@/components/QuickMeetingScheduler';
import { D365OpportunityDialog } from '@/components/D365OpportunityDialog';
import { scrollToNBASection } from '@/utils/scrollToSection';
import { toast } from 'sonner';

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
  const [d365DialogOpen, setD365DialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);

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
        (arrFilter === 'high' && account.arr >= 50000000) ||
        (arrFilter === 'medium' && account.arr >= 20000000 && account.arr < 50000000) ||
        (arrFilter === 'low' && account.arr < 20000000);

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

  // Synchronize scrollbars
  useEffect(() => {
    const tableWrapper = tableWrapperRef.current;
    const topScroll = topScrollRef.current;
    
    if (!tableWrapper || !topScroll) return;

    const handleTableScroll = () => {
      if (topScroll) {
        topScroll.scrollLeft = tableWrapper.scrollLeft;
      }
    };

    const handleTopScroll = () => {
      if (tableWrapper) {
        tableWrapper.scrollLeft = topScroll.scrollLeft;
      }
    };

    tableWrapper.addEventListener('scroll', handleTableScroll);
    topScroll.addEventListener('scroll', handleTopScroll);

    return () => {
      tableWrapper.removeEventListener('scroll', handleTableScroll);
      topScroll.removeEventListener('scroll', handleTopScroll);
    };
  }, []);

  // Update top scrollbar width to match table width
  useEffect(() => {
    const tableWrapper = tableWrapperRef.current;
    const topScroll = topScrollRef.current;
    
    if (tableWrapper && topScroll) {
      const updateScrollbarWidth = () => {
        const tableWidth = tableWrapper.scrollWidth;
        const containerWidth = tableWrapper.clientWidth;
        
        if (tableWidth > containerWidth) {
          topScroll.style.display = 'block';
          topScroll.innerHTML = `<div style="width: ${tableWidth}px; height: 1px;"></div>`;
        } else {
          topScroll.style.display = 'none';
        }
      };

      updateScrollbarWidth();
      
      const resizeObserver = new ResizeObserver(updateScrollbarWidth);
      resizeObserver.observe(tableWrapper);
      
      return () => resizeObserver.disconnect();
    }
  }, [filteredAndSortedAccounts]);

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

  const handleViewD365Opportunity = (account: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a simulated D365 opportunity for this account
    const simulatedOpportunity = {
      id: `opp-${account.id}`,
      accountId: account.id,
      accountName: account.name,
      title: `${account.name} - Strategic Expansion Initiative`,
      value: account.expansionOpportunity || Math.floor(account.arr * 0.3),
      stage: 'qualification' as const,
      probability: account.status === 'Good' ? 75 : account.status === 'Watch' ? 50 : 25,
      closeDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner: account.csam,
      source: 'signal_expansion' as const,
      d365RecordId: `D365-OPP-${account.id.toUpperCase()}`,
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastModified: new Date().toISOString(),
      notes: [
        `Account showing strong growth indicators`,
        `Health score: ${account.healthScore}`,
        `Current ARR: $${(account.arr / 1000000).toFixed(1)}M`
      ],
      signals: [
        `Health score: ${account.healthScore}/100`,
        `${account.status} status - proactive engagement opportunity`,
        `Industry: ${account.industry} sector trends positive`
      ],
      nextAction: `Schedule strategic review with ${account.csam} and ${account.ae}`,
      budgetConfirmed: account.status === 'Good',
      decisionMaker: 'Executive Leadership Team',
      timeline: account.status === 'At Risk' ? '30 days (urgent)' : '90 days'
    };
    
    setSelectedOpportunity(simulatedOpportunity);
    setD365DialogOpen(true);
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
                <SelectItem value="high">Enterprise ($50M+)</SelectItem>
                <SelectItem value="medium">Strategic ($20M-$50M)</SelectItem>
                <SelectItem value="low">Commercial (&lt;$20M)</SelectItem>
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
        <div className="table-container">
          <div 
            ref={topScrollRef}
            className="top-scrollbar overflow-x-auto overflow-y-hidden h-[17px] bg-background border-b border-border"
            style={{ display: 'none' }}
          >
            <div style={{ width: '1424px', height: '1px' }}></div>
          </div>
          <div ref={tableWrapperRef} className="table-wrapper">
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
                    className={`cursor-pointer hover:bg-muted/50 transition-all duration-200 ${
                      selectedAccount?.id === account.id ? 'selected-account-row' : ''
                    }`}
                    onClick={() => {
                      onSelectAccount(account);
                      toast.success(`Selected ${account.name} - viewing Next Best Actions`, {
                        duration: 2000,
                        position: 'bottom-right'
                      });
                      scrollToNBASection();
                    }}
                  >
                    <TableCell className="font-medium" title={account.name}>
                      <div className="truncate">{account.name}</div>
                    </TableCell>
                    <TableCell title={account.industry}>
                      <div className="truncate">{account.industry}</div>
                    </TableCell>
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
                      <div className="action-button-row">
                        <div className="action-button-group">
                          <Button 
                            className="text-xs px-2 py-1 border hover:bg-primary/10 min-w-fit"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAccount(account);
                              toast.success(`Selected ${account.name} - viewing Next Best Actions`, {
                                duration: 2000,
                                position: 'bottom-right'
                              });
                              scrollToNBASection();
                            }}
                          >
                            <Brain className="w-4 h-4 mr-1" />
                            Select
                          </Button>
                          <QuickMeetingScheduler account={account}>
                            <Button 
                              variant="outline" 
                              className="text-xs px-2 py-1 hover:bg-blue-50 min-w-fit"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Meet
                            </Button>
                          </QuickMeetingScheduler>
                        </div>
                        <div className="action-button-group">
                          <AccountDetailsDialog account={account} />
                          <Button 
                            variant="outline" 
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 min-w-fit"
                            onClick={(e) => handleViewD365Opportunity(account, e)}
                          >
                            <Buildings className="w-3 h-3 mr-1" />
                            D365
                          </Button>
                          {account.expansionOpportunity && account.expansionOpportunity > 0 && (
                            <ExpansionOpportunitiesDialog account={account}>
                              <Button 
                                variant="outline" 
                                className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 min-w-fit"
                              >
                                <CurrencyDollar className="w-3 h-3 mr-1" />
                                ${(account.expansionOpportunity / 1000000).toFixed(1)}M
                              </Button>
                            </ExpansionOpportunitiesDialog>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </CardContent>

      {/* D365 Opportunity Dialog */}
      <D365OpportunityDialog
        open={d365DialogOpen}
        onOpenChange={setD365DialogOpen}
        opportunity={selectedOpportunity}
        onSave={(updatedOpportunity) => {
          toast.success('Opportunity updated in Dynamics 365');
          setD365DialogOpen(false);
        }}
      />
    </Card>
  );
}
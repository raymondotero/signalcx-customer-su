import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendUp, CurrencyDollar } from '@phosphor-icons/react';
import { Account } from '@/types';
import { AccountDetailsDialog } from '@/components/AccountDetailsDialog';

interface AccountsTableProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  selectedAccount?: Account;
}

export function AccountsTable({ accounts, onSelectAccount, selectedAccount }: AccountsTableProps) {
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>ARR</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CSAM</TableHead>
              <TableHead>AE</TableHead>
              <TableHead>Contract End</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
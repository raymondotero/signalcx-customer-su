import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, TrendUp, CurrencyDollar } from '@phosphor-icons/react';
import { Account } from '@/types';

interface AccountsTableProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  selectedAccount?: Account;
}

export function AccountsTable({ accounts, onSelectAccount, selectedAccount }: AccountsTableProps) {
  const getStatusColor = (status: Account['status']) => {
    switch (status) {
      case 'Good': return 'status-good';
      case 'Watch': return 'status-watch';
      case 'At Risk': return 'status-risk';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendUp className="w-5 h-5 text-primary" />
          Customer Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>ARR</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CSM</TableHead>
              <TableHead>Contract End</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow 
                key={account.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedAccount?.id === account.id ? 'bg-primary/5 border-primary' : ''
                }`}
                onClick={() => onSelectAccount(account)}
              >
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{formatCurrency(account.arr)}</TableCell>
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
                <TableCell>{account.csm}</TableCell>
                <TableCell>{new Date(account.contractEnd).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAccount(account);
                    }}
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    Generate NBA
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
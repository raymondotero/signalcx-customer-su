import React from 'react';
import { Button } from '@/components/ui/button
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, TrendUp, CurrencyDollar } from '@phosphor-icons/react';
  accounts: Account[];

}
  accounts: Account[];
  const getStatusColor = (status: Account['sta
  selectedAccount?: Account;
 

export function AccountsTable({ accounts, onSelectAccount, selectedAccount }: AccountsTableProps) {
  const getStatusColor = (status: Account['status']) => {
    <Card className="
        <CardTitle className="flex items
          Customer Accounts
      </CardHeader>
     
    

              <TableHead>Status</TableHead>
              <TableHead>AE</TableHead>
              <TableHead
          </TableHeade
            {accounts.map((acc
                key={a
    

          
                <TableCell>
                  
                        className={`h-2 rounded-full ${
                          account.healthScore >= 60 ? 
                        sty
                    
                  <
                <Ta
               
                </Table
                <Table
                <TableCell>
                    <Button 
                      variant="outline"
                        e.stopPropagation()
                      }}
                    >
                      Select
                    {account.expansionOpport
                       
                      </
                  </d
              </TableRow>
          </TableBody>
      </CardContent>
  );






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
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAccount(account);
                      }}
                      className="hover:bg-primary/10"
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      Select
                    </Button>
                    {account.expansionOpportunity && account.expansionOpportunity > 0 && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
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
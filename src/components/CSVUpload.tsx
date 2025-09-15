import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CheckCircle, XCircle, Download } from '@phosphor-icons/react';
import { Account } from '@/types';
import { useAccounts, useAgentMemory } from '@/hooks/useData';
import { toast } from 'sonner';

export function CSVUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; count: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAccount } = useAccounts();
  const { addMemoryEntry } = useAgentMemory();

  const parseCSV = (csvText: string): Partial<Account>[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const account: any = {};
      
      headers.forEach((header, i) => {
        if (values[i]) {
          switch (header) {
            case 'name':
            case 'account_name':
            case 'accountname':
              account.name = values[i];
              break;
            case 'arr':
            case 'annual_recurring_revenue':
              account.arr = parseFloat(values[i].replace(/[$,]/g, '')) || 0;
              break;
            case 'health_score':
            case 'healthscore':
            case 'health':
              account.healthScore = parseInt(values[i]) || 0;
              break;
            case 'status':
            case 'health_status':
              const status = values[i].toLowerCase();
              if (status.includes('good')) account.status = 'Good';
              else if (status.includes('watch')) account.status = 'Watch';
              else if (status.includes('risk')) account.status = 'At Risk';
              else account.status = 'Good';
              break;
            case 'industry':
              account.industry = values[i];
              break;
            case 'csm':
            case 'customer_success_manager':
            case 'csam':
              account.csam = values[i];
              break;
            case 'ae':
            case 'account_executive':
              account.ae = values[i];
              break;
            case 'last_activity':
            case 'lastactivity':
              account.lastActivity = values[i];
              break;
            case 'contract_end':
            case 'contractend':
              account.contractEnd = values[i];
              break;
            case 'expansion_opportunity':
            case 'expansionopportunity':
              account.expansionOpportunity = parseFloat(values[i].replace(/[$,]/g, '')) || 0;
              break;
          }
        }
      });
      
      // Generate ID if not provided
      if (!account.id) {
        account.id = `acc-${Date.now()}-${index}`;
      }
      
      return account;
    });
  };

  const validateAccount = (account: Partial<Account>): string[] => {
    const errors: string[] = [];
    
    if (!account.name) errors.push('Account name is required');
    if (typeof account.arr !== 'number' || account.arr < 0) errors.push('Valid ARR is required');
    if (typeof account.healthScore !== 'number' || account.healthScore < 0 || account.healthScore > 100) {
      errors.push('Health score must be between 0-100');
    }
    if (!account.status || !['Good', 'Watch', 'At Risk'].includes(account.status)) {
      errors.push('Status must be Good, Watch, or At Risk');
    }
    
    return errors;
  };

  const downloadSampleCSV = () => {
    const sampleData = `name,arr,health_score,status,industry,csam,ae,last_activity,contract_end,expansion_opportunity
"TechCorp Solutions",250000,85,"Good","Technology","Sarah Chen","Michael Thompson","2024-01-15","2024-12-31",75000
"Global Manufacturing Inc",450000,65,"Watch","Manufacturing","Mike Rodriguez","Jennifer Davis","2024-01-10","2024-08-15",120000
"FinanceFirst Bank",800000,45,"At Risk","Financial Services","Lisa Wang","Robert Martinez","2024-01-05","2024-06-30",200000`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signalcx_sample_accounts.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Sample CSV downloaded');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const csvText = await file.text();
      const parsedAccounts = parseCSV(csvText);
      
      const results = {
        success: true,
        count: 0,
        errors: [] as string[]
      };

      for (const [index, accountData] of parsedAccounts.entries()) {
        const validationErrors = validateAccount(accountData);
        
        if (validationErrors.length > 0) {
          results.errors.push(`Row ${index + 2}: ${validationErrors.join(', ')}`);
          continue;
        }

        // Fill in defaults for missing fields
        const completeAccount: Account = {
          id: accountData.id || `acc-${Date.now()}-${index}`,
          name: accountData.name || '',
          arr: accountData.arr || 0,
          healthScore: accountData.healthScore || 50,
          status: accountData.status || 'Good',
          industry: accountData.industry || 'Unknown',
          csam: (accountData as any).csam || 'Unassigned',
          ae: (accountData as any).ae || 'Unassigned',
          lastActivity: accountData.lastActivity || new Date().toISOString().split('T')[0],
          contractEnd: accountData.contractEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expansionOpportunity: accountData.expansionOpportunity || 0
        };

        addAccount(completeAccount);
        results.count++;
      }

      setUploadResult(results);

      // Add to agent memory
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'nba_generated',
        description: `CSV import completed: ${results.count} accounts added, ${results.errors.length} errors`,
        metadata: { 
          filename: file.name,
          accountsAdded: results.count,
          errors: results.errors.length
        },
        outcome: results.errors.length === 0 ? 'success' : 'failure'
      });

      if (results.count > 0) {
        toast.success(`Successfully imported ${results.count} accounts`);
      }
      
      if (results.errors.length > 0) {
        toast.error(`${results.errors.length} rows had errors`);
      }

    } catch (error) {
      console.error('CSV upload failed:', error);
      setUploadResult({
        success: false,
        count: 0,
        errors: ['Failed to parse CSV file. Please check the format.']
      });
      toast.error('Failed to upload CSV file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Account Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file containing customer account data. The system will automatically map columns and validate the data.
            </p>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <Label htmlFor="csv-upload" className="text-lg font-medium cursor-pointer">
                  Choose CSV File
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select a CSV file with account data to import
                </p>
                <input
                  id="csv-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                >
                  {isUploading ? 'Processing...' : 'Select File'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Expected CSV Format</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadSampleCSV}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Sample CSV
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your CSV should include these columns (column names are flexible):
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">Required:</p>
                  <ul className="space-y-1">
                    <li>• name / account_name</li>
                    <li>• arr / annual_recurring_revenue</li>
                    <li>• health_score / health</li>
                    <li>• status / health_status</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Optional:</p>
                  <ul className="space-y-1">
                    <li>• industry</li>
                    <li>• csam / customer_success_manager</li>
                    <li>• ae / account_executive</li>
                    <li>• last_activity</li>
                    <li>• contract_end</li>
                    <li>• expansion_opportunity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {uploadResult && (
            <>
              <Separator />
              <div className={`p-4 rounded-lg ${
                uploadResult.success && uploadResult.errors.length === 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              } border`}>
                <div className="flex items-center gap-2 mb-2">
                  {uploadResult.success && uploadResult.errors.length === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {uploadResult.success ? 'Import Results' : 'Import Failed'}
                  </span>
                </div>
                
                {uploadResult.count > 0 && (
                  <p className="text-sm text-green-700 mb-2">
                    ✓ Successfully imported {uploadResult.count} accounts
                  </p>
                )}
                
                {uploadResult.errors.length > 0 && (
                  <div>
                    <p className="text-sm text-red-700 mb-2">
                      ✗ {uploadResult.errors.length} error(s) found:
                    </p>
                    <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
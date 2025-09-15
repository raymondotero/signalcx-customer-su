import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { Gear, Plus, Trash, Target } from '@phosphor-icons/react';

export interface SignalTarget {
  signalName: string;
  category: 'cost' | 'agility' | 'data' | 'risk' | 'culture';
  targetValue: number;
  unit: string;
  threshold: 'below' | 'above' | 'exactly';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

const DEFAULT_TARGETS: SignalTarget[] = [
  // Cost Optimization Targets
  {
    signalName: 'Cloud Spend Variance',
    category: 'cost',
    targetValue: 10,
    unit: '%',
    threshold: 'below',
    priority: 'high',
    description: 'Keep cloud spend variance under 10%'
  },
  {
    signalName: 'Idle Resource Ratio',
    category: 'cost',
    targetValue: 5,
    unit: '%',
    threshold: 'below',
    priority: 'medium',
    description: 'Minimize idle resource waste'
  },
  {
    signalName: 'Reserved Coverage',
    category: 'cost',
    targetValue: 80,
    unit: '%',
    threshold: 'above',
    priority: 'medium',
    description: 'Maintain optimal reserved instance coverage'
  },
  {
    signalName: 'Rightsizing Opportunity',
    category: 'cost',
    targetValue: 15,
    unit: '%',
    threshold: 'below',
    priority: 'high',
    description: 'Limit rightsizing opportunities to 15%'
  },
  {
    signalName: 'FinOps Score',
    category: 'cost',
    targetValue: 85,
    unit: 'score',
    threshold: 'above',
    priority: 'high',
    description: 'Maintain excellent FinOps practices'
  },

  // Agility & Performance Targets
  {
    signalName: 'Release Frequency',
    category: 'agility',
    targetValue: 2,
    unit: 'per week',
    threshold: 'above',
    priority: 'medium',
    description: 'Maintain frequent release cadence'
  },
  {
    signalName: 'Lead Time for Changes',
    category: 'agility',
    targetValue: 2,
    unit: 'days',
    threshold: 'below',
    priority: 'high',
    description: 'Keep lead time under 2 days'
  },
  {
    signalName: 'Change Failure Rate',
    category: 'agility',
    targetValue: 5,
    unit: '%',
    threshold: 'below',
    priority: 'critical',
    description: 'Maintain low change failure rate'
  },
  {
    signalName: 'MTTR Application',
    category: 'agility',
    targetValue: 30,
    unit: 'minutes',
    threshold: 'below',
    priority: 'high',
    description: 'Quick recovery from incidents'
  },
  {
    signalName: 'Test Automation Coverage',
    category: 'agility',
    targetValue: 80,
    unit: '%',
    threshold: 'above',
    priority: 'medium',
    description: 'Maintain high test automation coverage'
  },

  // Data Quality & Intelligence Targets
  {
    signalName: 'Data Freshness (Hours)',
    category: 'data',
    targetValue: 24,
    unit: 'hours',
    threshold: 'below',
    priority: 'high',
    description: 'Keep data fresh and current'
  },
  {
    signalName: 'Data Quality Score',
    category: 'data',
    targetValue: 95,
    unit: 'score',
    threshold: 'above',
    priority: 'high',
    description: 'Maintain excellent data quality'
  },
  {
    signalName: 'AI Agent Usage Rate',
    category: 'data',
    targetValue: 60,
    unit: '%',
    threshold: 'above',
    priority: 'medium',
    description: 'Drive AI agent adoption'
  },
  {
    signalName: 'MAU/WAU Ratio',
    category: 'data',
    targetValue: 25,
    unit: '%',
    threshold: 'above',
    priority: 'medium',
    description: 'Maintain healthy user engagement'
  },
  {
    signalName: 'Conversion Rate',
    category: 'data',
    targetValue: 3,
    unit: '%',
    threshold: 'above',
    priority: 'high',
    description: 'Optimize conversion funnel'
  },

  // Risk & Security Targets
  {
    signalName: 'Open Critical Vulns',
    category: 'risk',
    targetValue: 0,
    unit: 'count',
    threshold: 'exactly',
    priority: 'critical',
    description: 'Zero critical vulnerabilities'
  },
  {
    signalName: 'MFA Coverage',
    category: 'risk',
    targetValue: 100,
    unit: '%',
    threshold: 'exactly',
    priority: 'critical',
    description: 'Complete MFA coverage required'
  },
  {
    signalName: 'SLA Uptime 30d',
    category: 'risk',
    targetValue: 99.9,
    unit: '%',
    threshold: 'above',
    priority: 'critical',
    description: 'Maintain high availability SLA'
  },
  {
    signalName: 'Backup Success Rate',
    category: 'risk',
    targetValue: 99,
    unit: '%',
    threshold: 'above',
    priority: 'high',
    description: 'Ensure reliable backup operations'
  },
  {
    signalName: 'Certificate Expiry < 30d',
    category: 'risk',
    targetValue: 0,
    unit: 'count',
    threshold: 'exactly',
    priority: 'high',
    description: 'No certificates expiring within 30 days'
  },

  // Culture & Engagement Targets
  {
    signalName: 'Champion Count',
    category: 'culture',
    targetValue: 3,
    unit: 'count',
    threshold: 'above',
    priority: 'high',
    description: 'Maintain strong champion network'
  },
  {
    signalName: 'Training Hours Last 90d',
    category: 'culture',
    targetValue: 20,
    unit: 'hours',
    threshold: 'above',
    priority: 'medium',
    description: 'Ensure continuous learning and development'
  },
  {
    signalName: 'QBR Cadence',
    category: 'culture',
    targetValue: 90,
    unit: 'days',
    threshold: 'below',
    priority: 'high',
    description: 'Regular quarterly business reviews'
  },
  {
    signalName: 'CSM Touches Last 14d',
    category: 'culture',
    targetValue: 2,
    unit: 'count',
    threshold: 'above',
    priority: 'medium',
    description: 'Regular customer success engagement'
  },
  {
    signalName: 'Enablement NPS',
    category: 'culture',
    targetValue: 50,
    unit: 'score',
    threshold: 'above',
    priority: 'medium',
    description: 'High enablement satisfaction'
  }
];

interface TargetSettingsDialogProps {
  onTargetsUpdated?: (targets: SignalTarget[]) => void;
}

export function TargetSettingsDialog({ onTargetsUpdated }: TargetSettingsDialogProps) {
  const [targets, setTargets] = useKV<SignalTarget[]>('signal-targets', DEFAULT_TARGETS);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<SignalTarget>({
    signalName: '',
    category: 'cost',
    targetValue: 0,
    unit: '',
    threshold: 'below',
    priority: 'medium',
    description: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  // Ensure targets is always an array
  const currentTargets = targets || DEFAULT_TARGETS;

  const handleSaveTarget = () => {
    if (!editingTarget.signalName.trim()) {
      toast.error('Please enter a signal name');
      return;
    }

    const newTargets = [...currentTargets];
    const existingIndex = newTargets.findIndex(t => t.signalName === editingTarget.signalName);
    
    if (existingIndex >= 0) {
      newTargets[existingIndex] = editingTarget;
    } else {
      newTargets.push(editingTarget);
    }
    
    setTargets(newTargets);
    onTargetsUpdated?.(newTargets);
    setIsAdding(false);
    setEditingTarget({
      signalName: '',
      category: 'cost',
      targetValue: 0,
      unit: '',
      threshold: 'below',
      priority: 'medium',
      description: ''
    });
    
    toast.success('Target saved successfully');
  };

  const handleEditTarget = (target: SignalTarget) => {
    setEditingTarget(target);
    setIsAdding(true);
  };

  const handleDeleteTarget = (signalName: string) => {
    const newTargets = currentTargets.filter(t => t.signalName !== signalName);
    setTargets(newTargets);
    onTargetsUpdated?.(newTargets);
    toast.success('Target deleted successfully');
  };

  const handleBulkAddTargets = (category: SignalTarget['category']) => {
    const categoryTargets = DEFAULT_TARGETS.filter(t => t.category === category);
    const existingSignals = currentTargets.map(t => t.signalName);
    const newTargets = categoryTargets.filter(t => !existingSignals.includes(t.signalName));
    
    if (newTargets.length === 0) {
      toast.info(`All ${category} targets are already configured`);
      return;
    }
    
    const updatedTargets = [...currentTargets, ...newTargets];
    setTargets(updatedTargets);
    onTargetsUpdated?.(updatedTargets);
    
    toast.success(`Added ${newTargets.length} ${category} targets`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cost': return 'bg-blue-100 text-blue-800';
      case 'agility': return 'bg-green-100 text-green-800';
      case 'data': return 'bg-purple-100 text-purple-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'culture': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Gear className="w-4 h-4 mr-2" />
          Set Targets
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Business Value Signal Targets</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Target Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {isAdding ? 'Add New Target' : 'Signal Targets'}
                </CardTitle>
                {!isAdding && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAdding(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Target
                  </Button>
                )}
              </div>
            </CardHeader>
            
            {isAdding && (
              <CardContent className="space-y-4">
                {/* Quick Add from Presets */}
                <div className="space-y-2">
                  <Label>Quick Add from Common Targets</Label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const preset = DEFAULT_TARGETS.find(t => t.signalName === e.target.value);
                        if (preset) {
                          setEditingTarget(preset);
                        }
                      }
                    }}
                  >
                    <option value="">Select a common target to add...</option>
                    <optgroup label="Cost Optimization">
                      {DEFAULT_TARGETS.filter(t => t.category === 'cost').map(target => (
                        <option key={target.signalName} value={target.signalName}>
                          {target.signalName} (Target: {target.threshold} {target.targetValue}{target.unit})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Agility & Performance">
                      {DEFAULT_TARGETS.filter(t => t.category === 'agility').map(target => (
                        <option key={target.signalName} value={target.signalName}>
                          {target.signalName} (Target: {target.threshold} {target.targetValue}{target.unit})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Data Quality">
                      {DEFAULT_TARGETS.filter(t => t.category === 'data').map(target => (
                        <option key={target.signalName} value={target.signalName}>
                          {target.signalName} (Target: {target.threshold} {target.targetValue}{target.unit})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Risk & Security">
                      {DEFAULT_TARGETS.filter(t => t.category === 'risk').map(target => (
                        <option key={target.signalName} value={target.signalName}>
                          {target.signalName} (Target: {target.threshold} {target.targetValue}{target.unit})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Culture & Engagement">
                      {DEFAULT_TARGETS.filter(t => t.category === 'culture').map(target => (
                        <option key={target.signalName} value={target.signalName}>
                          {target.signalName} (Target: {target.threshold} {target.targetValue}{target.unit})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signal-name">Signal Name</Label>
                    <Input
                      id="signal-name"
                      value={editingTarget.signalName}
                      onChange={(e) => setEditingTarget(prev => ({ ...prev, signalName: e.target.value }))}
                      placeholder="e.g., Cloud Spend Variance"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={editingTarget.category}
                      onChange={(e) => setEditingTarget(prev => ({ ...prev, category: e.target.value as SignalTarget['category'] }))}
                    >
                      <option value="cost">Cost</option>
                      <option value="agility">Agility</option>
                      <option value="data">Data</option>
                      <option value="risk">Risk</option>
                      <option value="culture">Culture</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-value">Target Value</Label>
                    <Input
                      id="target-value"
                      type="number"
                      value={editingTarget.targetValue}
                      onChange={(e) => setEditingTarget(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                      placeholder="e.g., 10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={editingTarget.unit}
                      onChange={(e) => setEditingTarget(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., %, count, minutes"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold</Label>
                    <select
                      id="threshold"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={editingTarget.threshold}
                      onChange={(e) => setEditingTarget(prev => ({ ...prev, threshold: e.target.value as SignalTarget['threshold'] }))}
                    >
                      <option value="below">Below target (good)</option>
                      <option value="above">Above target (good)</option>
                      <option value="exactly">Exactly target</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={editingTarget.priority}
                      onChange={(e) => setEditingTarget(prev => ({ ...prev, priority: e.target.value as SignalTarget['priority'] }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={editingTarget.description}
                      onChange={(e) => setEditingTarget(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the target"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveTarget}>
                    Save Target
                  </Button>
                  {isAdding && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAdding(false);
                        setEditingTarget({
                          signalName: '',
                          category: 'cost',
                          targetValue: 0,
                          unit: '',
                          threshold: 'below',
                          priority: 'medium',
                          description: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Existing Targets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Targets ({currentTargets.length})</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAddTargets('cost')}
                  >
                    Add Cost Targets
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAddTargets('agility')}
                  >
                    Add Agility Targets
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAddTargets('data')}
                  >
                    Add Data Targets
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAddTargets('risk')}
                  >
                    Add Risk Targets
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAddTargets('culture')}
                  >
                    Add Culture Targets
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentTargets.map((target, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{target.signalName}</span>
                        <Badge className={getCategoryColor(target.category)}>
                          {target.category}
                        </Badge>
                        <Badge className={getPriorityColor(target.priority)}>
                          {target.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: {target.threshold} {target.targetValue}{target.unit}
                        {target.description && ` • ${target.description}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTarget(target)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTarget(target.signalName)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {currentTargets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No signal targets configured yet.</p>
                    <p className="text-sm">Add targets to improve AI recommendations.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
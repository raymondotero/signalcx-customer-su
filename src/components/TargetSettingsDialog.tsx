import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gear, Target, Plus, Trash, FloppyDisk } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

export interface SignalTarget {
  signalName: string;
  category: 'cost' | 'agility' | 'data' | 'risk' | 'culture';
  targetValue: number;
  unit: string;
  threshold: 'above' | 'below' | 'exactly';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

const DEFAULT_TARGETS: SignalTarget[] = [
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
    signalName: 'CPU Utilization',
    category: 'cost',
    targetValue: 80,
    unit: '%',
    threshold: 'below',
    priority: 'medium',
    description: 'Maintain CPU utilization efficiency'
  },
  {
    signalName: 'Release Frequency',
    category: 'agility',
    targetValue: 4,
    unit: 'releases/month',
    threshold: 'above',
    priority: 'high',
    description: 'Maintain high deployment velocity'
  },
  {
    signalName: 'MTTR Application',
    category: 'agility',
    targetValue: 30,
    unit: 'minutes',
    threshold: 'below',
    priority: 'critical',
    description: 'Fast incident recovery'
  },
  {
    signalName: 'Data Freshness (Hours)',
    category: 'data',
    targetValue: 2,
    unit: 'hours',
    threshold: 'below',
    priority: 'medium',
    description: 'Keep data fresh and current'
  },
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
    signalName: 'Champion Count',
    category: 'culture',
    targetValue: 3,
    unit: 'count',
    threshold: 'above',
    priority: 'high',
    description: 'Maintain strong champion network'
  }
];

interface TargetSettingsDialogProps {
  onTargetsUpdated?: (targets: SignalTarget[]) => void;
}

export function TargetSettingsDialog({ onTargetsUpdated }: TargetSettingsDialogProps) {
  const [targets, setTargets] = useKV<SignalTarget[]>('signal-targets', DEFAULT_TARGETS);
  const safeTargets = targets || [];
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

  const handleSaveTarget = () => {
    if (!editingTarget.signalName.trim()) {
      toast.error('Please enter a signal name');
      return;
    }

    const newTargets = [...safeTargets];
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

  const handleDeleteTarget = (signalName: string) => {
    const newTargets = safeTargets.filter(t => t.signalName !== signalName);
    setTargets(newTargets);
    onTargetsUpdated?.(newTargets);
    toast.success('Target deleted');
  };

  const handleEditTarget = (target: SignalTarget) => {
    setEditingTarget({ ...target });
    setIsAdding(true);
  };

  const getCategoryColor = (category: SignalTarget['category']) => {
    switch (category) {
      case 'cost': return 'bg-emerald-100 text-emerald-800';
      case 'agility': return 'bg-blue-100 text-blue-800';
      case 'data': return 'bg-purple-100 text-purple-800';
      case 'risk': return 'bg-orange-100 text-orange-800';
      case 'culture': return 'bg-pink-100 text-pink-800';
    }
  };

  const getPriorityColor = (priority: SignalTarget['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Gear className="w-4 h-4 mr-2" />
          Signal Targets
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Signal Target Configuration
          </DialogTitle>
          <DialogDescription>
            Set custom targets for business value signals to improve AI recommendations and prioritization.
            The AI will use these targets to determine signal severity and generate better next best actions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Target */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {isAdding ? 'Edit Target' : 'Add New Target'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signalName">Signal Name</Label>
                  <Input
                    id="signalName"
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
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={editingTarget.targetValue}
                    onChange={(e) => setEditingTarget(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={editingTarget.unit}
                    onChange={(e) => setEditingTarget(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="%, count, minutes"
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
                  <FloppyDisk className="w-4 h-4 mr-2" />
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
          </Card>

          {/* Existing Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Current Targets ({safeTargets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeTargets.map((target, index) => (
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTarget(target.signalName)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {safeTargets.length === 0 && (
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
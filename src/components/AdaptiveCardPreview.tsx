import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, User, Calendar, Target } from '@phosphor-icons/react';
import { NextBestAction, AdaptiveCard } from '@/types';
import { useAgentMemory } from '@/hooks/useData';

interface AdaptiveCardPreviewProps {
  nba: NextBestAction;
  accountName: string;
  onApprovalDecision: (approved: boolean) => void;
}

export function AdaptiveCardPreview({ nba, accountName, onApprovalDecision }: AdaptiveCardPreviewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [decision, setDecision] = useState<boolean | null>(null);
  const { addMemoryEntry } = useAgentMemory();

  const handleDecision = async (approved: boolean) => {
    setIsProcessing(true);
    setDecision(approved);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to agent memory
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'approval_decided',
        accountId: nba.accountId,
        accountName: accountName,
        description: `Workflow ${approved ? 'approved' : 'rejected'}: ${nba.title}`,
        metadata: { 
          nbaId: nba.id,
          decision: approved ? 'approved' : 'rejected',
          approver: 'Current User'
        },
        outcome: 'success'
      });

      onApprovalDecision(approved);
    } catch (error) {
      console.error('Failed to process approval:', error);
      addMemoryEntry({
        id: `memory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'approval_decided',
        accountId: nba.accountId,
        accountName: accountName,
        description: `Failed to process approval for: ${nba.title}`,
        outcome: 'failure'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const adaptiveCard: AdaptiveCard = {
    type: 'approval',
    accountId: nba.accountId,
    accountName: accountName,
    action: nba.title,
    reasoning: nba.reasoning,
    estimatedImpact: nba.estimatedImpact,
    requestedBy: 'SignalCX AI Agent',
    requestedAt: nba.createdAt
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          Review Approval
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Microsoft Teams - Approval Request
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Adaptive Card Header */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">SignalCX AI Agent</p>
                  <p className="text-xs text-muted-foreground">Agentic AI Platform</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Approval Required
              </Badge>
            </div>
            
            <h3 className="font-semibold text-lg mb-2">Customer Success Action Required</h3>
            <p className="text-sm text-muted-foreground">
              AI has identified a recommended action for customer account that requires your approval.
            </p>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account</p>
                <p className="font-medium">{adaptiveCard.accountName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                <p className="text-sm">{adaptiveCard.requestedBy}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <Badge className={
                  nba.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  nba.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  nba.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {nba.priority}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requested At</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{new Date(adaptiveCard.requestedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recommended Action</h4>
              <p className="text-lg font-semibold">{adaptiveCard.action}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{nba.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">AI Reasoning</h4>
              <p className="text-sm text-muted-foreground">{adaptiveCard.reasoning}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-accent" />
                  <h4 className="font-medium">Estimated Impact</h4>
                </div>
                <p className="text-sm text-muted-foreground">{adaptiveCard.estimatedImpact}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-accent" />
                  <h4 className="font-medium">Time to Complete</h4>
                </div>
                <p className="text-sm text-muted-foreground">{nba.timeToComplete}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Decision Section */}
          {decision === null ? (
            <div className="flex gap-3">
              <Button
                onClick={() => handleDecision(true)}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isProcessing ? (
                  <div className="animate-pulse flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleDecision(false)}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                {isProcessing ? (
                  <div className="animate-pulse flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className={`text-center p-4 rounded-lg ${
              decision ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {decision ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <span className="font-medium">
                  {decision ? 'Action Approved' : 'Action Rejected'}
                </span>
              </div>
              <p className="text-sm">
                {decision 
                  ? 'The workflow will now be executed by the AI agent.'
                  : 'The recommended action has been rejected and will not be executed.'
                }
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
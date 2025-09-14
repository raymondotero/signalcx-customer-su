import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Brain, CheckCircle, Clock, Warning, ChatCircle, Sparkle } from '@phosphor-icons/react';
import { useSignals, useAgentMemory, useAccounts, useNBAs } from '@/hooks/useData';
import { Signal, MemoryEntry, Account } from '@/types';
import { azureOpenAI, SmartRecommendation, RecommendationContext } from '@/services/azureOpenAI';
import { toast } from 'sonner';

interface AIInsight {
  id: string;
  type: 'recommendation' | 'risk_alert' | 'insight' | 'chat_response';
  content: string;
  confidence?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  accountId?: string;
  accountName?: string;
  timestamp: string;
  autoApproved?: boolean;
  metadata?: Record<string, any>;
}

export function AIRecommendationEngine() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingSignals, setIsAnalyzingSignals] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [chatQuery, setChatQuery] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  const { signals } = useSignals();
  const { accounts } = useAccounts();
  const { nbas } = useNBAs();
  const { addMemoryEntry, memory } = useAgentMemory();

  // Generate smart recommendations for selected account
  const generateSmartRecommendations = async (account: Account) => {
    if (!account) return;
    
    setIsProcessing(true);
    try {
      const context: RecommendationContext = {
        account,
        recentSignals: signals.filter(s => s.accountId === account.id).slice(0, 10),
        historicalNBAs: nbas.filter(n => n.accountId === account.id).slice(0, 5),
        agentMemory: memory.filter(m => m.accountId === account.id).slice(0, 10)
      };

      const recommendations = await azureOpenAI.generateSmartRecommendations(context);
      setSmartRecommendations(recommendations);

      // Convert to insights
      const newInsights: AIInsight[] = recommendations.map(rec => ({
        id: `smart-rec-${Date.now()}-${Math.random()}`,
        type: 'recommendation',
        content: `${rec.nba.title}: ${rec.nba.description}`,
        confidence: rec.confidence,
        priority: rec.nba.priority,
        accountId: account.id,
        accountName: account.name,
        timestamp: new Date().toISOString(),
        autoApproved: rec.confidence > 0.8 && rec.nba.priority !== 'critical',
        metadata: {
          nbaId: rec.nba.id,
          confidence: rec.confidence,
          rationale: rec.rationale,
          successProbability: rec.successProbability,
          riskFactors: rec.riskFactors
        }
      }));

      setInsights(prev => [...newInsights, ...prev].slice(0, 50));
      
      // Log to memory
      newInsights.forEach(insight => {
        addMemoryEntry({
          id: `ai-insight-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          type: insight.autoApproved ? 'workflow_executed' : 'approval_requested',
          accountId: insight.accountId,
          accountName: insight.accountName,
          description: `AI Smart Recommendation: ${insight.content}`,
          metadata: insight.metadata,
          outcome: insight.autoApproved ? 'success' : 'pending'
        });
      });

      toast.success(`Generated ${recommendations.length} AI recommendations for ${account.name}`);
    } catch (error) {
      console.error('Error generating smart recommendations:', error);
      toast.error('Failed to generate smart recommendations');
    } finally {
      setIsProcessing(false);
    }
  };

  // Analyze signals in real-time
  const analyzeSignalsRealTime = async () => {
    setIsAnalyzingSignals(true);
    try {
      const recentSignals = signals.slice(0, 20);
      const analysis = await azureOpenAI.analyzeSignalsRealTime(recentSignals, accounts);

      // Convert insights to AI insights
      const insightItems: AIInsight[] = analysis.insights.map((insight, index) => ({
        id: `insight-${Date.now()}-${index}`,
        type: 'insight',
        content: insight,
        priority: 'medium',
        timestamp: new Date().toISOString(),
        autoApproved: true,
        metadata: { source: 'real_time_analysis' }
      }));

      // Convert risk alerts to insights
      const riskItems: AIInsight[] = analysis.riskAlerts.map((alert, index) => ({
        id: `risk-${Date.now()}-${index}`,
        type: 'risk_alert',
        content: alert.risk,
        priority: alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'high' : 'medium',
        accountId: alert.accountId,
        accountName: accounts.find(a => a.id === alert.accountId)?.name,
        timestamp: new Date().toISOString(),
        autoApproved: false,
        metadata: { severity: alert.severity, source: 'risk_analysis' }
      }));

      // Convert urgent actions to insights
      const actionItems: AIInsight[] = analysis.urgentActions.map(action => ({
        id: `urgent-${Date.now()}-${Math.random()}`,
        type: 'recommendation',
        content: `URGENT: ${action.title} - ${action.description}`,
        priority: 'critical',
        accountId: action.accountId,
        accountName: accounts.find(a => a.id === action.accountId)?.name,
        timestamp: new Date().toISOString(),
        autoApproved: false,
        metadata: { 
          nbaId: action.id,
          effort: action.effort,
          estimatedImpact: action.estimatedImpact,
          source: 'urgent_analysis'
        }
      }));

      const allNewInsights = [...insightItems, ...riskItems, ...actionItems];
      setInsights(prev => [...allNewInsights, ...prev].slice(0, 50));

      toast.success(`Analyzed ${recentSignals.length} signals - found ${allNewInsights.length} insights`);
    } catch (error) {
      console.error('Error analyzing signals:', error);
      toast.error('Failed to analyze signals');
    } finally {
      setIsAnalyzingSignals(false);
    }
  };

  // Handle AI chat
  const handleChatQuery = async () => {
    if (!chatQuery.trim() || !selectedAccount) return;
    
    setIsLoadingChat(true);
    try {
      const context: RecommendationContext = {
        account: selectedAccount,
        recentSignals: signals.filter(s => s.accountId === selectedAccount.id).slice(0, 10),
        historicalNBAs: nbas.filter(n => n.accountId === selectedAccount.id).slice(0, 5),
        agentMemory: memory.filter(m => m.accountId === selectedAccount.id).slice(0, 10)
      };

      const response = await azureOpenAI.getAIAssistance(chatQuery, context);
      
      const chatInsight: AIInsight = {
        id: `chat-${Date.now()}`,
        type: 'chat_response',
        content: `Q: ${chatQuery}\n\nA: ${response}`,
        priority: 'medium',
        accountId: selectedAccount.id,
        accountName: selectedAccount.name,
        timestamp: new Date().toISOString(),
        autoApproved: true,
        metadata: { query: chatQuery, response, source: 'ai_chat' }
      };

      setInsights(prev => [chatInsight, ...prev].slice(0, 50));
      setChatQuery('');
      
      toast.success('AI assistant responded to your query');
    } catch (error) {
      console.error('Error with AI chat:', error);
      toast.error('AI assistant is temporarily unavailable');
    } finally {
      setIsLoadingChat(false);
    }
  };

  const approveInsight = (insight: AIInsight, approved: boolean) => {
    setInsights(prev => 
      prev.map(i => 
        i.id === insight.id 
          ? { ...i, autoApproved: approved }
          : i
      )
    );

    addMemoryEntry({
      id: `approval-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'approval_decided',
      accountId: insight.accountId,
      accountName: insight.accountName,
      description: `AI Insight ${approved ? 'approved' : 'rejected'}: ${insight.content.slice(0, 100)}...`,
      metadata: {
        insightId: insight.id,
        originalPriority: insight.priority,
        decision: approved ? 'approved' : 'rejected'
      },
      outcome: approved ? 'success' : 'rejected'
    });

    toast.success(`Insight ${approved ? 'approved' : 'rejected'}`);
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'critical': return <Warning className="w-4 h-4 text-red-500" />;
      case 'high': return <Warning className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'recommendation': return <Sparkle className="w-4 h-4 text-purple-500" />;
      case 'risk_alert': return <Warning className="w-4 h-4 text-red-500" />;
      case 'insight': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'chat_response': return <ChatCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className={`w-5 h-5 text-accent ${(isProcessing || isAnalyzingSignals) ? 'animate-pulse-ai' : ''}`} />
          AI Engine
          {(isProcessing || isAnalyzingSignals) && (
            <Badge variant="outline" className="animate-pulse">
              {isProcessing ? 'Generating' : 'Analyzing'}
            </Badge>
          )}
        </CardTitle>
        
        {/* AI Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedAccount?.id || ''}
              onChange={(e) => setSelectedAccount(accounts.find(a => a.id === e.target.value) || null)}
            >
              <option value="">Select account for smart recommendations</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.status})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => selectedAccount && generateSmartRecommendations(selectedAccount)}
              disabled={!selectedAccount || isProcessing}
              className="flex-1"
            >
              <Sparkle className="w-4 h-4 mr-1" />
              Smart Recommendations
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={analyzeSignalsRealTime}
              disabled={isAnalyzingSignals}
              className="flex-1"
            >
              <Brain className="w-4 h-4 mr-1" />
              Analyze Signals
            </Button>
          </div>
          
          {/* AI Chat */}
          {selectedAccount && (
            <div className="flex gap-2">
              <Input
                placeholder="Ask AI about this account..."
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatQuery()}
                className="flex-1"
              />
              <Button 
                size="sm"
                onClick={handleChatQuery}
                disabled={!chatQuery.trim() || isLoadingChat}
              >
                <ChatCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>AI Engine ready. Generate recommendations or analyze signals to begin.</p>
              </div>
            ) : (
              insights.map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(insight.type)}
                      {getPriorityIcon(insight.priority)}
                      <span className="font-medium text-sm">
                        {insight.accountName || 'System-wide'}
                      </span>
                      {insight.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      {insight.autoApproved ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {insight.type === 'chat_response' ? 'Responded' : 'Auto-approved'}
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Needs approval
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{insight.content}</p>
                    {insight.metadata?.riskFactors && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <strong>Risk factors:</strong> {insight.metadata.riskFactors.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  {!insight.autoApproved && insight.type !== 'chat_response' && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => approveInsight(insight, true)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => approveInsight(insight, false)}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    {new Date(insight.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
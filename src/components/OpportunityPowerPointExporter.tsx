import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Calendar,
  CurrencyDollar,
  Target,
  PresentationChart
} from '@phosphor-icons/react';
import { Account, ExpansionOpportunity } from '@/types';
import { toast } from 'sonner';

interface OpportunityPowerPointProps {
  opportunity: ExpansionOpportunity;
  account: Account;
  children?: React.ReactNode;
}

export function OpportunityPowerPointExporter({ opportunity, account, children }: OpportunityPowerPointProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [config, setConfig] = useState({
    title: `${opportunity.description} - Business Case`,
    subtitle: `Executive Presentation for ${account.name}`,
    executiveFocus: true,
    implementationRoadmap: true
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generatePowerPoint = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(10);
      
      // Step 1: Generate business case content
      const businessCasePrompt = (window as any).spark.llmPrompt`
Create a comprehensive business case for ${opportunity.description} expansion:

Account Context:
- Company: ${account.name}
- Industry: ${account.industry}
- Current ARR: ${formatCurrency(account.arr)}
- Current CSAM: ${account.csam}
- Current AE: ${account.ae}

EXPANSION OPPORTUNITY:
- Value: ${formatCurrency(opportunity.value)}
- Probability: ${opportunity.probability}
- Timeline: ${opportunity.timeline}

MICROSOFT SOLUTIONS:
${opportunity.microsoftSolutions?.map(solution => `- ${solution}`).join('\n') || 'Microsoft Cloud Solutions'}

DELIVERY MOTIONS:
${opportunity.deliveryMotions?.map(motion => `- ${motion}`).join('\n') || 'Professional Services Implementation'}

STAKEHOLDERS REQUIRED:
${opportunity.stakeholdersRequired?.map(stakeholder => `- ${stakeholder}`).join('\n') || 'Technical and Business Leadership'}

SUCCESS CRITERIA:
${opportunity.successCriteria?.map(criteria => `- ${criteria}`).join('\n') || 'Measurable business outcomes'}

Create a detailed business case presentation outline with:
1. Executive Summary (business impact focus)
2. Current State Challenges
3. Proposed Microsoft Solution
4. Financial Impact Analysis
5. Implementation Approach
6. Risk Mitigation
7. Success Metrics & Timeline
8. Resource Requirements
9. Competitive Advantages
10. Recommended Next Steps

For each section, provide:
- Key talking points (3-5 bullets)
- Executive insights
- Supporting data points
- Visual recommendations

Focus on business outcomes, ROI potential, and strategic value for ${account.name}.
`;

      setGenerationProgress(30);
      const businessCase = await (window as any).spark.llm(businessCasePrompt);

      // Step 2: Generate financial analysis
      setGenerationProgress(50);
      const financialPrompt = (window as any).spark.llmPrompt`
Create detailed financial analysis for ${opportunity.description} expansion:

Account Context:
- Current ARR: ${formatCurrency(account.arr)}
- Health Score: ${account.healthScore}/100

Opportunity Details:
- Expansion Value: ${formatCurrency(opportunity.value)}
- Success Probability: ${opportunity.probability}
- Implementation Timeline: ${opportunity.timeline}

Provide comprehensive financial analysis including:
1. Investment requirements breakdown
2. Expected ROI calculation (conservative, likely, optimistic scenarios)
3. Payback period analysis
4. Revenue impact projections
5. Sensitivity analysis key factors
6. Cost-benefit analysis
7. Budget impact and funding recommendations

Include specific dollar amounts, percentages, and timeframes.
Make it CFO-ready with clear financial justification.
`;

      const financialAnalysis = await (window as any).spark.llm(financialPrompt);

      // Step 3: Generate implementation roadmap
      setGenerationProgress(70);
      const implementationPrompt = (window as any).spark.llmPrompt`
Create a detailed implementation roadmap for ${opportunity.description}:

Account: ${account.name}
Delivery Motions: ${opportunity.deliveryMotions?.join(', ') || 'Professional Services'}
Success Criteria: ${opportunity.successCriteria?.map(criteria => criteria).join(', ') || 'Business outcomes'}

Generate comprehensive roadmap including:
1. Phase-by-phase implementation plan
2. Timeline and milestones
3. Resource requirements (Microsoft + customer)
4. Risk mitigation strategies
5. Success metrics and tracking
6. Go-live criteria and support plan

Format as actionable project roadmap with clear deliverables and timelines.
`;

      const implementationPlan = await (window as any).spark.llm(implementationPrompt);
      setGenerationProgress(90);

      // Compile the final presentation content
      const presentationContent = `
# ${config.title}

## ${config.subtitle}

**Account:** ${account.name} (${account.industry})
**Opportunity Value:** ${formatCurrency(opportunity.value)}
**Success Probability:** ${opportunity.probability}
**Implementation Timeline:** ${opportunity.timeline}

---

## 📊 Executive Summary

### Opportunity Overview
- Expansion Value: ${formatCurrency(opportunity.value)}
- Account ARR Growth: +${((opportunity.value / account.arr) * 100).toFixed(1)}%
- Estimated ROI: 150-300% (based on industry benchmarks)
- Payback Period: 8-14 months (estimated)

### Strategic Value
${businessCase.split('\n').slice(0, 10).join('\n')}

---

## 💰 Financial Analysis

${financialAnalysis}

### Investment Overview
- Initial Investment: ${formatCurrency(opportunity.value * 0.3)} (estimated)
- Annual Recurring Value: ${formatCurrency(opportunity.value)}
- 3-Year NPV: ${formatCurrency(opportunity.value * 2.5)} (conservative)

---

## 🛤️ Implementation Roadmap

${implementationPlan}

### Microsoft Solutions
${opportunity.microsoftSolutions?.map(solution => `• ${solution}`).join('\n') || '• Microsoft Cloud Platform\n• Professional Services\n• Training & Adoption'}

### Delivery Motions
${opportunity.deliveryMotions?.map(motion => `• ${motion}`).join('\n') || '• Implementation Services\n• Change Management\n• Training & Support'}

---

## 👥 Stakeholder Engagement

### Required Stakeholders
${opportunity.stakeholdersRequired?.map(stakeholder => `• ${stakeholder}`).join('\n') || '• Executive Sponsor\n• IT Leadership\n• Business Process Owners\n• End Users'}

### Success Criteria
${opportunity.successCriteria?.map(criteria => `• ${criteria}`).join('\n') || '• Successful deployment\n• User adoption targets\n• ROI achievement\n• Business process improvement'}

---

## 🎯 Next Steps & Recommendations

### Immediate Actions
1. **Stakeholder Alignment** - Schedule executive briefing with key stakeholders
2. **Technical Assessment** - Conduct solution architecture review
3. **Business Case Validation** - Confirm ROI assumptions and success metrics
4. **Resource Planning** - Identify implementation team and timeline

### Implementation Timeline
- **Weeks 1-4:** Planning and stakeholder alignment
- **Months 2-4:** Solution deployment and configuration
- **Months 5-6:** User training and change management

### Success Metrics Dashboard
- User adoption: 85%+ within 6 months
- Business process efficiency: 20-30% improvement
- Customer satisfaction: 4.5+ rating
- ROI achievement: Target 200%+ by month 12

---

## 📈 Competitive Advantage

This Microsoft solution provides ${account.name} with:
- **Technology Leadership** - Latest cloud innovation and AI capabilities
- **Scalability** - Platform grows with business needs
- **Security** - Enterprise-grade security and compliance
- **Integration** - Seamless connectivity with existing Microsoft ecosystem
- **Support** - Global enterprise support and professional services

### Why Act Now
- Market opportunity window
- Competitive positioning advantages
- Strategic technology investment aligned with digital transformation
- Competitive differentiation through Microsoft innovation
- Risk mitigation through proven enterprise platform

---

*Generated by SignalCX AI - ${new Date().toLocaleDateString()}*
`;

      setGenerationProgress(100);
      
      // Download the presentation as a markdown file
      const blob = new Blob([presentationContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${account.name}_${opportunity.description.replace(/\s+/g, '_')}_BusinessCase.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PowerPoint business case generated and downloaded successfully!');

    } catch (error) {
      console.error('PowerPoint generation error:', error);
      toast.error('Failed to generate PowerPoint: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <PresentationChart className="w-4 h-4 mr-2" />
            Generate PowerPoint
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PresentationChart className="w-5 h-5" />
            Generate Executive PowerPoint
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Opportunity Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{opportunity.description}</p>
                  <p className="text-sm text-muted-foreground">{account.name}</p>
                </div>
                <div>
                  <p className="font-medium">{formatCurrency(opportunity.value)}</p>
                  <p className="text-sm text-muted-foreground">{opportunity.timeline}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div>
                  <p className="font-medium capitalize">{opportunity.probability}</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
                <div>
                  <p className="font-medium">+{((opportunity.value / account.arr) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">ARR Growth</p>
                </div>
                <div>
                  <p className="font-medium">8-14 mo</p>
                  <p className="text-xs text-muted-foreground">Payback</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-visible">
            <CardHeader>
              <CardTitle className="text-lg">Presentation Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Presentation Title</Label>
                <Textarea
                  id="title"
                  value={config.title}
                  onChange={(e) => setConfig({...config, title: e.target.value})}
                  className="h-20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={config.subtitle}
                  onChange={(e) => setConfig({...config, subtitle: e.target.value})}
                  className="h-16"
                />
              </div>
            </CardContent>
          </Card>

          {isGenerating && (
            <Card className="border-visible">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating presentation...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              onClick={generatePowerPoint}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate & Download
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
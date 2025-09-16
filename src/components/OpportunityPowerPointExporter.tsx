import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  PresentationChart, 
  Download, 
  Sparkle,
  Target,
  Users,
  Clock,
  CheckCircle,
  CurrencyDollar
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
    subtitle: `Strategic Expansion Opportunity for ${account.name}`,
    audience: 'executive',
    customMessage: ''
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const generateOpportunityPresentation = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Analyze opportunity
      setGenerationProgress(20);
      
      const businessCasePrompt = (window as any).spark.llmPrompt`
Create a compelling business case presentation for this Microsoft expansion opportunity:

OPPORTUNITY DETAILS:
- Description: ${opportunity.description}
- Category: ${opportunity.category}
- Value: ${formatCurrency(opportunity.value)}
- Probability: ${opportunity.probability}
- Timeline: ${opportunity.timeline}

ACCOUNT CONTEXT:
- Company: ${account.name}
- Industry: ${account.industry}
- Current ARR: ${formatCurrency(account.arr)}
- Health Score: ${account.healthScore}
- Current CSAM: ${account.csam}
- Current AE: ${account.ae}

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
6. Risk Mitigation Strategy
7. Success Metrics & Timeline
8. Investment Justification
9. Competitive Advantages
10. Recommended Next Steps

For each section, provide:
- Key talking points (3-5 bullets)
- Executive insights
- Supporting data points
- Visual recommendations

Focus on business outcomes, ROI potential, and strategic value for ${account.name}.
`;

      const businessCase = await (window as any).spark.llm(businessCasePrompt);
      setGenerationProgress(50);

      // Step 2: Generate financial analysis
      const financialPrompt = (window as any).spark.llmPrompt`
Create detailed financial analysis for ${opportunity.description} expansion:

Current Account Profile:
- ARR: ${formatCurrency(account.arr)}
- Industry: ${account.industry}
- Health: ${account.healthScore}/100

Opportunity Details:
- Expansion Value: ${formatCurrency(opportunity.value)}
- Success Probability: ${opportunity.probability}
- Implementation Timeline: ${opportunity.timeline}

Generate:
1. Investment requirements breakdown
2. Expected ROI calculation (conservative, likely, optimistic scenarios)
3. Payback period analysis
4. Risk-adjusted NPV calculation
5. Sensitivity analysis key factors
6. Cost-benefit comparison
7. Budget impact and funding recommendations

Include specific dollar amounts, percentages, and timeframes.
Make it CFO-ready with clear financial justification.
`;

      const financialAnalysis = await (window as any).spark.llm(financialPrompt);
      setGenerationProgress(75);

      // Step 3: Generate implementation roadmap
      const implementationPrompt = (window as any).spark.llmPrompt`
Create a detailed implementation roadmap for ${opportunity.description}:

Microsoft Solutions: ${opportunity.microsoftSolutions?.join(', ') || 'Microsoft Cloud Platform'}
Delivery Motions: ${opportunity.deliveryMotions?.join(', ') || 'Professional Services'}
Timeline: ${opportunity.timeline}

Create:
1. Phase-by-phase implementation plan
2. Key milestones and deliverables
3. Resource requirements (Microsoft + customer)
4. Change management approach
5. Risk mitigation strategies
6. Success metrics and tracking
7. Go-live criteria and support plan

Format as actionable project roadmap with clear ownership and timelines.
`;

      const implementationPlan = await (window as any).spark.llm(implementationPrompt);
      setGenerationProgress(90);

      // Step 4: Compile presentation
      const presentationContent = `
# ${config.title}
## ${config.subtitle}

**Generated:** ${new Date().toLocaleDateString()}
**Account:** ${account.name} (${account.industry})
**Opportunity Value:** ${formatCurrency(opportunity.value)}
**Success Probability:** ${opportunity.probability}
**Implementation Timeline:** ${opportunity.timeline}

---

## 📊 Executive Summary

${businessCase.split('\n').slice(0, 10).join('\n')}

### Key Financial Metrics
- Expansion Value: ${formatCurrency(opportunity.value)}
- Account ARR Growth: +${((opportunity.value / account.arr) * 100).toFixed(1)}%
- Estimated ROI: 150-300% (based on industry benchmarks)
- Payback Period: 8-14 months (estimated)

---

## 💰 Financial Analysis

${financialAnalysis}

### Investment Summary
- Initial Investment: ${formatCurrency(opportunity.value * 0.3)} (estimated)
- Annual Recurring Value: ${formatCurrency(opportunity.value)}
- 3-Year NPV: ${formatCurrency(opportunity.value * 2.5)} (conservative)

---

## 🛤️ Implementation Roadmap

${implementationPlan}

### Microsoft Solutions Included
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

### Immediate Actions (Next 30 Days)
1. **Stakeholder Alignment** - Schedule executive briefing with key stakeholders
2. **Technical Assessment** - Conduct solution architecture review
3. **Business Case Validation** - Confirm ROI assumptions and success metrics
4. **Resource Planning** - Identify implementation team and timeline

### Implementation Timeline
- **Weeks 1-4:** Planning and stakeholder alignment
- **Months 2-4:** Solution deployment and configuration
- **Months 5-6:** User training and change management
- **Month 7+:** Go-live and optimization

### Success Metrics Dashboard
- User adoption rate: Target 85%+ within 90 days
- Business process efficiency: 20-30% improvement
- ROI achievement: Break-even within 12 months
- Customer satisfaction: 4.5+ rating

---

## 📈 Competitive Advantage

This Microsoft solution provides ${account.name} with:
- **Technology Leadership** - Latest cloud innovation and AI capabilities
- **Scalability** - Platform grows with business needs
- **Security** - Enterprise-grade compliance and governance
- **Integration** - Seamless connectivity with existing Microsoft ecosystem
- **Support** - Global enterprise support and professional services

---

## 💡 Executive Talking Points

### For CEO/Board:
- Strategic technology investment aligned with digital transformation
- Competitive differentiation through Microsoft innovation
- Measurable ROI and business impact
- Risk mitigation through proven enterprise platform

### For CFO:
- Clear financial justification with ${formatCurrency(opportunity.value)} annual value
- Predictable cloud costs and scalable pricing model
- Reduced operational expenses through automation
- Improved budget visibility and cost optimization

### For CTO:
- Modern architecture reducing technical debt
- Enhanced security and compliance capabilities
- Improved developer productivity and innovation speed
- Simplified operations and maintenance

---

## 📋 Appendix: Technical Details

${config.customMessage ? `### Custom Notes\n${config.customMessage}\n` : ''}

### Microsoft Account Team
- **CSAM:** ${account.csam}
- **Account Executive:** ${account.ae}
- **Opportunity Owner:** Customer Success Team

### Reference Materials
- Microsoft Solution Brief
- Industry case studies and benchmarks
- Technical architecture documentation
- Implementation methodology and best practices

---

*This presentation was generated by SignalCX AI for strategic planning purposes. All financial projections are estimates based on industry benchmarks and should be validated through detailed business case analysis.*
`;

      setGenerationProgress(100);

      // Download presentation
      const blob = new Blob([presentationContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${account.name}_${opportunity.description.replace(/\s+/g, '_')}_BusinessCase.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Business case presentation generated for ${opportunity.description}!`);

    } catch (error) {
      console.error('Error generating presentation:', error);
      toast.error('Failed to generate presentation. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <PresentationChart className="w-4 h-4" />
            Export Business Case
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PresentationChart className="w-5 h-5" />
            Generate Business Case Presentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opportunity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Opportunity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Account</p>
                    <p className="font-medium">{account.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Opportunity</p>
                    <p className="font-medium">{opportunity.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{opportunity.category}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-medium text-green-600">{formatCurrency(opportunity.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Probability</p>
                    <p className="font-medium capitalize">{opportunity.probability}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">{opportunity.timeline}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Presentation Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Presentation Title</Label>
                  <Input
                    id="title"
                    value={config.title}
                    onChange={(e) => setConfig({...config, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={config.subtitle}
                    onChange={(e) => setConfig({...config, subtitle: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-message">Custom Message/Notes</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Add specific business context, strategic priorities, or custom talking points..."
                  value={config.customMessage}
                  onChange={(e) => setConfig({...config, customMessage: e.target.value})}
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle className="w-5 h-5 animate-spin" />
                  Generating Business Case Presentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className={`flex items-center gap-2 ${generationProgress >= 20 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 20 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Business Case
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 50 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Financial Analysis
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 75 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 75 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Implementation Plan
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 90 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 90 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Final Assembly
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expected Output */}
          <Card>
            <CardHeader>
              <CardTitle>Presentation Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium">Generated Presentation Will Include:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'Executive Summary with key business impact',
                    'Current state challenges and opportunities',
                    'Microsoft solution overview and capabilities',
                    'Detailed financial analysis and ROI projection',
                    'Implementation roadmap and timeline',
                    'Risk mitigation strategies',
                    'Success metrics and measurement plan',
                    'Stakeholder roles and responsibilities',
                    'Competitive advantages and market positioning',
                    'Clear next steps and recommendations'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateOpportunityPresentation}
              disabled={isGenerating}
              size="lg"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkle className="w-5 h-5 animate-spin" />
                  Generating Business Case...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate Business Case Presentation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
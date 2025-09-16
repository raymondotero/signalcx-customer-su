import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/text
import { Label } from '@/components/ui/label';
  PresentationChart, 
import { Progress } from '@/components/ui/progress';
  Currenc
import { Account, Exp

  opportun
  childre

  const 
  const [confi
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
- Industry: ${account.industry}
- Health Score: ${account.
- Current AE: ${accou
MICRO

${opportunity.deliveryMotions?.map(motion => `
STAKEHOLDERS REQUIRED:

${opp
Create a detailed business case presentation 
2. C

6. Risk Mitigation Strategy
8. Investment Justificatio
10. Recommended Next Steps

- Executi
- Visual recommendations
Focus on business outcomes, ROI 

      setGenerationProgress(50);
      // Step 2: Generate financial analysis

Current Account Prof
- Industry: ${account.industry}

- Expansion Value: ${formatCurrency(opportuni
- Implementation Timeline: ${opportunity.
Generate:

4. Risk-adjusted
6. Cost-benefit comparison
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
${opportunity.successCriteria?.ma

Create:
1. Phase-by-phase implementation plan
2. Key milestones and deliverables
3. Resource requirements (Microsoft + customer)
3. **Business Case Validation
5. Risk mitigation strategies
6. Success metrics and tracking
7. Go-live criteria and support plan

Format as actionable project roadmap with clear ownership and timelines.
##

      const implementationPlan = await (window as any).spark.llm(implementationPrompt);
      setGenerationProgress(90);

      // Step 4: Compile presentation

# ${config.title}
## ${config.subtitle}

- **Support** - Global enterprise support and pro
**Account:** ${account.name} (${account.industry})
**Opportunity Value:** ${formatCurrency(opportunity.value)}
**Success Probability:** ${opportunity.probability}
**Implementation Timeline:** ${opportunity.timeline}

- M

### For CFO:

${businessCase.split('\n').slice(0, 10).join('\n')}

### For CTO:
- Expansion Value: ${formatCurrency(opportunity.value)}
- Account ARR Growth: +${((opportunity.value / account.arr) * 100).toFixed(1)}%
- Estimated ROI: 150-300% (based on industry benchmarks)
- Payback Period: 8-14 months (estimated)



### Microsoft Account Te

${financialAnalysis}

- Microsoft Solution B
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

      <DialogTrigger
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
                    <p className="font-medium">{
- Business process efficiency: 20-30% improvement
                    <p className="text-sm text
- Customer satisfaction: 4.5+ rating

---

## 📈 Competitive Advantage

This Microsoft solution provides ${account.name} with:
- **Technology Leadership** - Latest cloud innovation and AI capabilities
- **Scalability** - Platform grows with business needs
                    <p className="font-medium capitalize">{
- **Integration** - Seamless connectivity with existing Microsoft ecosystem
- **Support** - Global enterprise support and professional services

   

          </Card>

          <Card>
- Strategic technology investment aligned with digital transformation
- Competitive differentiation through Microsoft innovation
- Measurable ROI and business impact
- Risk mitigation through proven enterprise platform


























































































































































































































































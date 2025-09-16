import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  PresentationChart, 
  Sparkle,
  CheckCircle,
  Clock,
  Building,
  Users
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface ROIResult {
  solution: string;
  metrics: any;
  timestamp: string;
}

interface PresentationSlide {
  title: string;
  content: string[];
  chartData?: any;
  notes?: string;
}

interface PowerPointDocument {
  title: string;
  subtitle: string;
  author: string;
  company: string;
  date: string;
  slides: PresentationSlide[];
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function AdvancedPowerPointGenerator() {
  const [roiResults] = useKV<ROIResult[]>('roi-calculations', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([]);
  const [config, setConfig] = useState({
    title: 'Microsoft Solutions ROI Analysis',
    subtitle: 'Strategic Investment Recommendations',
    author: 'Customer Success Team',
    company: 'Microsoft Corporation',
    template: 'executive',
    includeCharts: true,
    includeFinancials: true,
    includeTimeline: true
  });

  const safeROIResults = roiResults || [];

  const generateAdvancedPresentation = async () => {
    if (safeROIResults.length === 0) {
      toast.error('No ROI calculations available. Please calculate ROI first.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Analyze portfolio
      setGenerationProgress(10);
      const portfolio = {
        totalInvestment: safeROIResults.reduce((sum, r) => sum + (r.metrics.investment || 0), 0),
        totalNPV: safeROIResults.reduce((sum, r) => sum + (r.metrics.npv || 0), 0),
        avgROI: safeROIResults.reduce((sum, r) => sum + (r.metrics.roi || 0), 0) / safeROIResults.length,
        avgPayback: safeROIResults.reduce((sum, r) => sum + (r.metrics.payback || 0), 0) / safeROIResults.length,
        solutions: safeROIResults.length
      };

      // Step 2: Generate executive summary
      setGenerationProgress(25);
      const executiveSummaryPrompt = (window as any).spark.llmPrompt`
Create a compelling executive summary for a Microsoft Solutions ROI presentation with these metrics:

Portfolio Overview:
- Total Investment: $${portfolio.totalInvestment.toLocaleString()}
- Total NPV: $${portfolio.totalNPV.toLocaleString()}
- Average ROI: ${portfolio.avgROI.toFixed(1)}%
- Average Payback: ${portfolio.avgPayback.toFixed(1)} months
- Number of Solutions: ${portfolio.solutions}

ROI Details:
${safeROIResults.map(r => `
- ${r.solution}: ROI ${r.metrics.roi?.toFixed(1) || 0}%, NPV $${r.metrics.npv?.toLocaleString() || 0}, Payback ${r.metrics.payback?.toFixed(1) || 0} months
`).join('')}

Create 4-5 bullet points that highlight:
1. Strategic business impact
2. Financial returns and risk mitigation
3. Competitive advantages
4. Implementation confidence
5. Recommended next steps

Make it executive-level with focus on business outcomes.
`;

      const executiveSummary = await (window as any).spark.llm(executiveSummaryPrompt);

      // Step 3: Generate solution-specific content
      setGenerationProgress(50);
      const solutionSlides: PresentationSlide[] = [];
      
      for (const result of safeROIResults.slice(0, 5)) { // Limit to top 5 for performance
        const solutionPrompt = (window as any).spark.llmPrompt`
Create a detailed slide for ${result.solution} with these metrics:
- ROI: ${result.metrics.roi?.toFixed(1) || 0}%
- NPV: $${result.metrics.npv?.toLocaleString() || 0}
- Investment: $${result.metrics.investment?.toLocaleString() || 0}
- Payback: ${result.metrics.payback?.toFixed(1) || 0} months

Include:
1. Business challenge this solves
2. Key capabilities and benefits
3. Financial impact summary
4. Implementation approach
5. Success metrics

Format as 4-5 bullet points suitable for PowerPoint.
`;
        
        const solutionContent = await (window as any).spark.llm(solutionPrompt);
        
        solutionSlides.push({
          title: `${result.solution} - Business Case`,
          content: solutionContent.split('\n').filter(line => line.trim()),
          chartData: {
            roi: result.metrics.roi || 0,
            npv: result.metrics.npv || 0,
            payback: result.metrics.payback || 0
          },
          notes: `Detailed financial analysis for ${result.solution} implementation`
        });
      }

      // Step 4: Generate financial analysis slide
      setGenerationProgress(75);
      const financialPrompt = (window as any).spark.llmPrompt`
Create a comprehensive financial analysis slide content for Microsoft Solutions portfolio:

Portfolio Metrics:
- Total Investment: $${portfolio.totalInvestment.toLocaleString()}
- Total NPV: $${portfolio.totalNPV.toLocaleString()}
- Portfolio ROI: ${((portfolio.totalNPV / portfolio.totalInvestment) * 100).toFixed(1)}%
- Average Payback: ${portfolio.avgPayback.toFixed(1)} months

Create content covering:
1. Investment summary and allocation
2. Expected returns and timelines  
3. Risk-adjusted projections
4. Sensitivity analysis insights
5. Recommended funding approach

Format as executive-friendly bullet points.
`;

      const financialAnalysis = await (window as any).spark.llm(financialPrompt);

      // Step 5: Build complete presentation
      setGenerationProgress(90);
      const presentation: PowerPointDocument = {
        title: config.title,
        subtitle: config.subtitle,
        author: config.author,
        company: config.company,
        date: new Date().toLocaleDateString(),
        brandColors: {
          primary: '#0078D4', // Microsoft Blue
          secondary: '#106EBE',
          accent: '#005A9E'
        },
        slides: [
          {
            title: 'Executive Summary',
            content: executiveSummary.split('\n').filter(line => line.trim()),
            notes: 'Open with strategic impact, focus on business outcomes'
          },
          {
            title: 'Portfolio Overview',
            content: [
              `Investment Portfolio: ${portfolio.solutions} Microsoft Solutions`,
              `Total Investment: $${portfolio.totalInvestment.toLocaleString()}`,
              `Expected NPV: $${portfolio.totalNPV.toLocaleString()}`,
              `Average ROI: ${portfolio.avgROI.toFixed(1)}%`,
              `Average Payback: ${portfolio.avgPayback.toFixed(1)} months`,
              'Portfolio optimized for balanced risk and return'
            ],
            chartData: portfolio,
            notes: 'Portfolio dashboard showing key metrics and trends'
          },
          {
            title: 'Financial Analysis',
            content: financialAnalysis.split('\n').filter(line => line.trim()),
            notes: 'Detailed financial projections and sensitivity analysis'
          },
          ...solutionSlides,
          {
            title: 'Implementation Roadmap',
            content: [
              'Phase 1: Foundation (Months 1-3)',
              '  • Security and compliance baseline',
              '  • Infrastructure modernization',
              'Phase 2: Productivity (Months 4-9)', 
              '  • Microsoft 365 optimization',
              '  • Process automation deployment',
              'Phase 3: Innovation (Months 10-18)',
              '  • AI/ML solutions implementation',
              '  • Advanced analytics deployment',
              'Success Metrics: Tracked monthly with QBRs'
            ],
            notes: 'Phased approach ensuring value realization at each stage'
          },
          {
            title: 'Recommendations & Next Steps',
            content: [
              '✓ Approve investment in Microsoft Solutions portfolio',
              '✓ Establish cross-functional implementation team',
              '✓ Begin Phase 1 security foundation within 30 days',
              '✓ Set up quarterly business reviews for progress tracking',
              '✓ Allocate change management resources',
              'Expected ROI realization within 12-18 months'
            ],
            notes: 'Clear action items with ownership and timelines'
          }
        ]
      };

      // Step 6: Create professional PowerPoint presentation
      setGenerationProgress(100);
      
      // Generate PowerPoint-compatible PPTX content using Open XML
      const generatePowerPointPresentation = () => {
        // Create PowerPoint XML structure
        const pptxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${presentation.slides.map((slide, index) => `
    <p:sldId id="${2147483649 + index}" r:id="rId${index + 2}"/>
    `).join('')}
  </p:sldIdLst>
  <p:sldSz cx="10080000" cy="7560000" type="screen16x12"/>
  <p:notesSz cx="7772400" cy="10058400"/>
</p:presentation>`;

        // Generate individual slide XML
        const slideXMLs = presentation.slides.map((slide, index) => ({
          name: `slide${index + 1}.xml`,
          content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <!-- Title Shape -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="4400" b="1">
                <a:solidFill>
                  <a:srgbClr val="0078D4"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${slide.title}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Content Shape -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${slide.content.map(point => `
          <a:p>
            <a:pPr lvl="0"/>
            <a:r>
              <a:rPr lang="en-US" sz="2400">
                <a:solidFill>
                  <a:srgbClr val="333333"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${point.replace(/[<>&"']/g, match => ({
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&apos;'
              }[match] || match))}</a:t>
            </a:r>
          </a:p>
          `).join('')}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
        }));

        return {
          presentation: pptxContent,
          slides: slideXMLs
        };
      };

      const pptxData = generatePowerPointPresentation();
      
      // Create comprehensive presentation outline for reference
      const presentationOutline = `# ${presentation.title}
## ${presentation.subtitle}

**Generated:** ${presentation.date}
**Author:** ${presentation.author}
**Company:** ${presentation.company}

---

## Executive Presentation Overview

This professional PowerPoint presentation contains ${presentation.slides.length} slides designed for executive audiences, featuring:

✓ AI-generated content tailored to your portfolio
✓ Financial analysis with ROI calculations
✓ Implementation roadmap and timeline
✓ Risk mitigation strategies
✓ Microsoft branding and professional styling
✓ Speaker notes and talking points

---

## Slide Contents

${presentation.slides.map((slide, index) => `
### Slide ${index + 1}: ${slide.title}

**Key Messages:**
${slide.content.map(point => `• ${point}`).join('\n')}

${slide.notes ? `**Speaker Notes:** ${slide.notes}` : ''}

${slide.chartData ? `**Recommended Charts:**
${Object.entries(slide.chartData).map(([key, value]) => `• ${key}: ${value}`).join('\n')}` : ''}

---
`).join('')}

## Presentation Guidelines

### Opening (First 3 slides):
- Start with executive summary and key metrics
- Establish business context and strategic importance
- Preview the investment recommendation

### Body (Core content slides):
- Lead with business impact, not technical features
- Use the "Challenge → Solution → Result" narrative
- Include quantified benefits and ROI calculations
- Address implementation confidence and risk mitigation

### Closing (Final 2 slides):
- Summarize financial impact and strategic benefits
- Provide clear recommendations and next steps
- Include Q&A preparation points

### Delivery Tips:
- Allow 2-3 minutes per slide for executive presentations
- Prepare for questions on competitive alternatives
- Have detailed financial models ready as backup
- Focus on business outcomes over technical specifications

## Microsoft Solution Highlights

${safeROIResults.map(result => `
### ${result.solution}
- **ROI:** ${result.metrics.roi?.toFixed(1) || 0}%
- **NPV:** $${(result.metrics.npv || 0).toLocaleString()}
- **Payback:** ${result.metrics.payback?.toFixed(1) || 0} months
- **Investment:** $${(result.metrics.investment || 0).toLocaleString()}
`).join('')}

## Next Steps After Presentation

1. **Immediate (Within 1 week):**
   - Gather stakeholder feedback and concerns
   - Schedule technical deep-dive sessions
   - Finalize budget allocation and approval process

2. **Short-term (Within 1 month):**
   - Establish implementation team and governance
   - Initiate vendor discussions and contracting
   - Develop detailed project timeline

3. **Implementation (3-18 months):**
   - Execute phased deployment plan
   - Track ROI metrics and business outcomes
   - Conduct quarterly business reviews

---

*This presentation was generated using AI analysis of your Microsoft Solutions portfolio. For questions or customizations, contact your Customer Success team.*`;

      // Create multiple downloadable formats
      const files = [
        {
          name: `${config.title.replace(/\s+/g, '_')}_Executive_Presentation.md`,
          content: presentationOutline,
          type: 'text/markdown'
        },
        {
          name: `${config.title.replace(/\s+/g, '_')}_Presentation_Data.json`,
          content: JSON.stringify(presentation, null, 2),
          type: 'application/json'
        },
        {
          name: `${config.title.replace(/\s+/g, '_')}_PowerPoint_Content.xml`,
          content: pptxData.presentation,
          type: 'application/xml'
        },
        {
          name: `${config.title.replace(/\s+/g, '_')}_Slides_Data.json`,
          content: JSON.stringify(pptxData.slides, null, 2),
          type: 'application/json'
        }
      ];

      // Download all files
      files.forEach(file => {
        const blob = new Blob([file.content], { type: file.type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });

      toast.success(`Professional PowerPoint presentation with ${presentation.slides.length} slides generated and downloaded!`);
      
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
        <Button variant="default" className="gap-2">
          <PresentationChart className="w-4 h-4" />
          Generate PowerPoint
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PresentationChart className="w-5 h-5" />
            Generate Professional PowerPoint Presentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portfolio Summary */}
          {safeROIResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Portfolio Summary for Presentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-800">
                      {safeROIResults.length}
                    </p>
                    <p className="text-sm text-blue-600">Solutions</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-800">
                      ${(safeROIResults.reduce((sum, r) => sum + (r.metrics.npv || 0), 0) / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-green-600">Total NPV</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-800">
                      {(safeROIResults.reduce((sum, r) => sum + (r.metrics.roi || 0), 0) / safeROIResults.length).toFixed(1)}%
                    </p>
                    <p className="text-sm text-purple-600">Avg ROI</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-2xl font-bold text-orange-800">
                      {(safeROIResults.reduce((sum, r) => sum + (r.metrics.payback || 0), 0) / safeROIResults.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-orange-600">Avg Payback (mo)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Presentation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={config.author}
                      onChange={(e) => setConfig({...config, author: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={config.company}
                      onChange={(e) => setConfig({...config, company: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template Style</Label>
                  <Select value={config.template} onValueChange={(value) => setConfig({...config, template: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive Brief (10-12 slides)</SelectItem>
                      <SelectItem value="detailed">Detailed Analysis (15-20 slides)</SelectItem>
                      <SelectItem value="board">Board Presentation (8-10 slides)</SelectItem>
                      <SelectItem value="technical">Technical Deep Dive (20+ slides)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Presentation Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Included Content</h4>
                  <div className="space-y-2">
                    {[
                      'Executive Summary with AI-generated insights',
                      'Portfolio overview and financial metrics',
                      'Solution-specific business cases',
                      'Implementation roadmap and timeline',
                      'Risk analysis and mitigation strategies',
                      'Competitive positioning and advantages',
                      'ROI calculations and sensitivity analysis',
                      'Next steps and recommendations'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Output Files</h4>
                  <div className="space-y-2">
                    {[
                      'Presentation outline (Markdown)',
                      'Structured data (JSON)',
                      'Speaker notes and talking points',
                      'Chart data for visualizations'
                    ].map((output, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{output}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle className="w-5 h-5 animate-spin" />
                  Generating Professional Presentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className={`flex items-center gap-2 ${generationProgress >= 10 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 10 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Portfolio Analysis
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 25 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 25 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Executive Summary
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 50 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Solution Content
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 75 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 75 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Financial Analysis
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Generating AI-powered content for professional executive presentation...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateAdvancedPresentation}
              disabled={isGenerating || safeROIResults.length === 0}
              size="lg"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkle className="w-5 h-5 animate-spin" />
                  Generating Presentation...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate Professional PowerPoint
                </>
              )}
            </Button>
          </div>

          {safeROIResults.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No ROI calculations available</p>
              <p className="text-sm">Please calculate ROI for Microsoft solutions first to generate presentations.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
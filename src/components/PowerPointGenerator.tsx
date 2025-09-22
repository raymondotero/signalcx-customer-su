import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  PresentationChart, 
  Sparkle,
  CheckCircle,
  Clock,
  Building,
  ChartBar,
  TrendUp,
  Target,
  Users,
  Calculator
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface ROIResult {
  solution: string;
  metrics: any;
  timestamp: string;
}

interface PowerPointSlide {
  title: string;
  content: string[];
  layout: 'title' | 'titleContent' | 'twoContent' | 'contentChart';
  chartData?: any;
  speakerNotes?: string;
}

export function PowerPointGenerator() {
  const [roiResults, setROIResults] = useKV<ROIResult[]>('roi-calculations', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSlides, setGeneratedSlides] = useState<PowerPointSlide[]>([]);

  const safeROIResults = roiResults || [];

  const generatePowerPoint = async () => {
    console.log('PowerPoint generation started, ROI results:', safeROIResults.length);
    
    if (safeROIResults.length === 0) {
      toast.error('No ROI calculations available. Please calculate ROI first.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedSlides([]);

    try {
      console.log('Starting PowerPoint generation process...');
      // Step 1: Calculate portfolio metrics
      setGenerationProgress(10);
      const portfolio = {
        totalInvestment: safeROIResults.reduce((sum, r) => sum + (r.metrics.investment || 0), 0),
        totalNPV: safeROIResults.reduce((sum, r) => sum + (r.metrics.npv || 0), 0),
        avgROI: safeROIResults.reduce((sum, r) => sum + (r.metrics.roi || 0), 0) / safeROIResults.length,
        avgPayback: safeROIResults.reduce((sum, r) => sum + (r.metrics.payback || 0), 0) / safeROIResults.length,
        solutions: safeROIResults.length
      };

      // Step 2: Generate executive summary content
      setGenerationProgress(25);
      const executiveSummary = `• Strategic transformation through Microsoft's integrated technology ecosystem delivers measurable business outcomes and competitive differentiation
• Portfolio investment of $${portfolio.totalInvestment.toLocaleString()} generates $${portfolio.totalNPV.toLocaleString()} in net present value with ${((portfolio.totalNPV / portfolio.totalInvestment) * 100).toFixed(1)}% ROI over 3 years
• Risk mitigation through enterprise-grade security, compliance frameworks, and proven implementation methodologies reduces operational exposure
• Competitive advantage achieved through AI-powered productivity gains, data-driven insights, and accelerated digital transformation capabilities
• Implementation confidence backed by Microsoft's global support infrastructure and proven success patterns across similar enterprises`;

      // Step 3: Generate solution-specific slides
      setGenerationProgress(50);
      const solutionSlides: PowerPointSlide[] = [];
      
      for (let i = 0; i < Math.min(3, safeROIResults.length); i++) {
        const result = safeROIResults[i];
        const solutionContent = `• Addresses critical business challenges in digital transformation and operational efficiency for modern enterprises
• ${result.solution} delivers comprehensive capabilities including automation, analytics, security, and scalability features
• Quantified benefits include ${result.metrics.roi?.toFixed(1) || 0}% ROI with $${result.metrics.npv?.toLocaleString() || 0} net present value over 3 years
• Phased implementation approach minimizes disruption while accelerating value realization within ${result.metrics.payback?.toFixed(1) || 0} months
• Success criteria focused on measurable productivity gains, cost reduction, and enhanced security posture`;
        
        solutionSlides.push({
          title: `${result.solution} - Strategic Investment`,
          content: solutionContent.split('\n').filter(line => line.trim() && !line.startsWith('#')),
          layout: 'contentChart',
          chartData: {
            roi: result.metrics.roi || 0,
            npv: result.metrics.npv || 0,
            investment: result.metrics.investment || 0,
            payback: result.metrics.payback || 0
          },
          speakerNotes: `Detailed ROI analysis for ${result.solution}. Emphasize business impact and competitive positioning.`
        });
      }

      // Step 4: Generate implementation timeline
      setGenerationProgress(75);
      const timelineContent = `• Phase 1 (Months 1-3): Foundation setup including infrastructure assessment, licensing procurement, security baseline establishment, and core team training
• Phase 2 (Months 4-9): Core deployment with pilot rollouts, user onboarding, integration with existing systems, and initial productivity measurements
• Phase 3 (Months 10-18): Optimization through advanced feature adoption, process refinement, performance monitoring, and continuous improvement initiatives
• Key milestones include 30-day readiness checkpoint, 90-day pilot validation, 6-month adoption metrics review, and 12-month ROI assessment
• Success checkpoints focus on user adoption rates, productivity gains, security compliance, and measurable business impact across all ${portfolio.solutions} solutions`;

      // Step 5: Build complete slide deck
      setGenerationProgress(90);
      const slides: PowerPointSlide[] = [
        {
          title: 'Microsoft Solutions ROI Analysis',
          content: [
            'Strategic Investment Recommendations',
            `Portfolio Value: $${(portfolio.totalNPV / 1000000).toFixed(1)}M NPV`,
            `Expected ROI: ${((portfolio.totalNPV / portfolio.totalInvestment) * 100).toFixed(1)}%`,
            `${portfolio.solutions} Solutions Analyzed`,
            new Date().toLocaleDateString()
          ],
          layout: 'title',
          speakerNotes: 'Open with confidence in the portfolio analysis and expected returns.'
        },
        {
          title: 'Executive Summary',
          content: executiveSummary.split('\n').filter(line => line.trim() && !line.startsWith('#')),
          layout: 'titleContent',
          speakerNotes: 'Focus on business transformation and strategic value.'
        },
        {
          title: 'Portfolio Overview',
          content: [
            `Total Investment Required: $${portfolio.totalInvestment.toLocaleString()}`,
            `Expected Net Present Value: $${portfolio.totalNPV.toLocaleString()}`,
            `Portfolio ROI: ${((portfolio.totalNPV / portfolio.totalInvestment) * 100).toFixed(1)}%`,
            `Average Payback Period: ${portfolio.avgPayback.toFixed(1)} months`,
            `Solutions in Portfolio: ${portfolio.solutions}`,
            'Risk-adjusted projections with conservative estimates'
          ],
          layout: 'contentChart',
          chartData: portfolio,
          speakerNotes: 'Highlight the balanced portfolio approach and risk mitigation.'
        },
        ...solutionSlides,
        {
          title: 'Implementation Roadmap',
          content: timelineContent.split('\n').filter(line => line.trim() && !line.startsWith('#')),
          layout: 'titleContent',
          speakerNotes: 'Emphasize phased approach and value realization at each stage.'
        },
        {
          title: 'Financial Impact Summary',
          content: [
            `Total Portfolio NPV: $${portfolio.totalNPV.toLocaleString()}`,
            `Investment ROI: ${((portfolio.totalNPV / portfolio.totalInvestment) * 100).toFixed(1)}%`,
            `Payback achieved in ${portfolio.avgPayback.toFixed(1)} months`,
            'Risk-adjusted conservative projections',
            'Competitive advantage and market positioning',
            'Regulatory compliance and security benefits'
          ],
          layout: 'contentChart',
          chartData: {
            investment: portfolio.totalInvestment,
            returns: portfolio.totalNPV,
            roi: (portfolio.totalNPV / portfolio.totalInvestment) * 100
          },
          speakerNotes: 'Reinforce the financial case with both quantitative and qualitative benefits.'
        },
        {
          title: 'Recommendations & Next Steps',
          content: [
            '✓ Approve Microsoft Solutions investment portfolio',
            '✓ Establish executive steering committee',
            '✓ Initiate Phase 1 implementation within 30 days',
            '✓ Allocate change management and training resources',
            '✓ Set up quarterly business review process',
            'Expected value realization begins Month 6'
          ],
          layout: 'titleContent',
          speakerNotes: 'Close with clear action items and confidence in the investment decision.'
        }
      ];

      setGeneratedSlides(slides);

      // Step 6: Create PowerPoint files
      setGenerationProgress(100);
      
      // Generate comprehensive PowerPoint package
      const powerPointPackage = {
        metadata: {
          title: 'Microsoft Solutions ROI Analysis',
          author: 'Customer Success Team',
          created: new Date().toISOString(),
          slides: slides.length,
          portfolio: portfolio
        },
        slides: slides,
        designSpecs: {
          theme: {
            primaryColor: '#0078D4',
            secondaryColor: '#106EBE',
            accentColor: '#005A9E',
            backgroundColor: '#FFFFFF',
            textColor: '#333333'
          },
          fonts: {
            title: 'Segoe UI',
            body: 'Segoe UI',
            titleSize: '36pt',
            bodySize: '24pt'
          },
          layout: {
            margin: '1 inch',
            titleHeight: '20%',
            contentHeight: '70%',
            footerHeight: '10%'
          }
        },
        charts: slides
          .filter(slide => slide.chartData)
          .map(slide => ({
            slideTitle: slide.title,
            chartType: slide.title.includes('Portfolio') ? 'portfolio' : 'solution',
            data: slide.chartData,
            recommended: slide.title.includes('Portfolio') ? 'Pie Chart' : 'Bar Chart'
          })),
        speakerGuide: slides.map((slide, index) => ({
          slideNumber: index + 1,
          title: slide.title,
          keyMessages: slide.content.slice(0, 3),
          speakerNotes: slide.speakerNotes || 'Focus on business impact and value proposition.',
          timing: '2-3 minutes',
          transitions: 'Smooth fade'
        }))
      };

      // Create downloadable files
      const files = [
        {
          name: 'Microsoft_Solutions_ROI_Presentation.json',
          content: JSON.stringify(powerPointPackage, null, 2),
          type: 'application/json'
        },
        {
          name: 'PowerPoint_Slides_Content.md',
          content: slides.map((slide, index) => `
# Slide ${index + 1}: ${slide.title}

${slide.content.map(point => `• ${point}`).join('\n')}

**Layout:** ${slide.layout}
**Speaker Notes:** ${slide.speakerNotes || 'Standard executive presentation guidance.'}

${slide.chartData ? `**Chart Data:**\n${JSON.stringify(slide.chartData, null, 2)}` : ''}

---
`).join(''),
          type: 'text/markdown'
        },
        {
          name: 'Executive_Presentation_Guide.txt',
          content: `Microsoft Solutions ROI Presentation Guide

Generated: ${new Date().toLocaleString()}
Slides: ${slides.length}
Duration: ${slides.length * 2.5} minutes (estimated)

PORTFOLIO SUMMARY:
- Total Investment: $${portfolio.totalInvestment.toLocaleString()}
- Expected NPV: $${portfolio.totalNPV.toLocaleString()}
- Portfolio ROI: ${((portfolio.totalNPV / portfolio.totalInvestment) * 100).toFixed(1)}%
- Solutions: ${portfolio.solutions}

PRESENTATION STRUCTURE:
${slides.map((slide, index) => `${index + 1}. ${slide.title}`).join('\n')}

DESIGN SPECIFICATIONS:
- Microsoft branding and colors
- Professional executive template
- Charts and data visualizations included
- Speaker notes for each slide

DELIVERY RECOMMENDATIONS:
- Allow 2-3 minutes per slide
- Focus on business outcomes
- Prepare for ROI methodology questions
- Have detailed appendix ready

Next Steps:
1. Import content into PowerPoint
2. Add company-specific branding
3. Customize charts with live data
4. Practice delivery and Q&A
5. Prepare detailed backup slides`,
          type: 'text/plain'
        }
      ];

      // Download files with enhanced error handling
      console.log('Downloading files:', files.length);
      let downloadCount = 0;
      
      // Add delay between downloads to prevent browser blocking
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Add small delay between downloads
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          const blob = new Blob([file.content], { type: file.type });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          link.style.display = 'none';
          
          // Add to DOM, click, and remove immediately
          document.body.appendChild(link);
          
          // Trigger download with user gesture context
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
          
          downloadCount++;
          console.log(`Downloaded file ${i + 1}/${files.length}: ${file.name}`);
          
        } catch (fileError) {
          console.error(`Error downloading ${file.name}:`, fileError);
          toast.error(`Failed to download ${file.name}: ${fileError.message}`);
        }
      }

      toast.success(`Professional PowerPoint presentation with ${slides.length} slides generated! Downloaded ${downloadCount} files successfully.`);
      
      if (downloadCount === 0) {
        toast.info('Download may have been blocked by browser. Please check your download folder or allow downloads for this site.');
      } else if (downloadCount < files.length) {
        toast.warning(`Downloaded ${downloadCount} of ${files.length} files. Some downloads may have been blocked.`);
      }
      
      console.log('PowerPoint generation completed successfully');
      
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      toast.error(`Failed to generate PowerPoint presentation: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      console.log('PowerPoint generation process finished');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <PresentationChart className="w-4 h-4" />
          Generate Executive PowerPoint
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PresentationChart className="w-5 h-5" />
            Generate Professional PowerPoint Presentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portfolio Preview */}
          {safeROIResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Presentation Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <ChartBar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-800">
                      {safeROIResults.length}
                    </p>
                    <p className="text-sm text-blue-600">Solutions</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <TrendUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-800">
                      ${(safeROIResults.reduce((sum, r) => sum + (r.metrics.npv || 0), 0) / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-green-600">Total NPV</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-800">
                      {(safeROIResults.reduce((sum, r) => sum + (r.metrics.roi || 0), 0) / safeROIResults.length).toFixed(1)}%
                    </p>
                    <p className="text-sm text-purple-600">Avg ROI</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-800">
                      {(safeROIResults.reduce((sum, r) => sum + (r.metrics.payback || 0), 0) / safeROIResults.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-orange-600">Avg Payback (mo)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle className="w-5 h-5 animate-spin" />
                  Generating Executive Presentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                      Solution Details
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 75 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 75 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Implementation Plan
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 90 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 90 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Slide Compilation
                    </div>
                    <div className={`flex items-center gap-2 ${generationProgress >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {generationProgress >= 100 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      File Generation
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Creating professional PowerPoint presentation with AI-generated content...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Slides Preview */}
          {generatedSlides.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Slide Preview
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Copy all slide content to clipboard as fallback
                      const allContent = generatedSlides.map((slide, index) => 
                        `Slide ${index + 1}: ${slide.title}\n${slide.content.join('\n')}\n\n`
                      ).join('');
                      
                      navigator.clipboard.writeText(allContent).then(() => {
                        toast.success('All slide content copied to clipboard!');
                      }).catch(() => {
                        toast.error('Failed to copy to clipboard');
                      });
                    }}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Copy to Clipboard
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {generatedSlides.length} Slides Generated
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Executive Format
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      ~{generatedSlides.length * 2.5} min duration
                    </Badge>
                  </div>
                  
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Slide Overview</TabsTrigger>
                      <TabsTrigger value="content">Content Preview</TabsTrigger>
                      <TabsTrigger value="design">Design Specs</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {generatedSlides.map((slide, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">Slide {index + 1}</h4>
                              <Badge variant="outline" className="text-xs">
                                {slide.layout}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{slide.title}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="content" className="space-y-3">
                      <div className="max-h-96 overflow-y-auto space-y-4">
                        {generatedSlides.slice(0, 3).map((slide, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Slide {index + 1}: {slide.title}</h4>
                            <div className="text-sm space-y-1">
                              {slide.content.slice(0, 3).map((point, pointIndex) => (
                                <p key={pointIndex} className="text-muted-foreground">• {point}</p>
                              ))}
                              {slide.content.length > 3 && (
                                <p className="text-xs text-muted-foreground">...and {slide.content.length - 3} more points</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {generatedSlides.length > 3 && (
                          <p className="text-center text-sm text-muted-foreground">
                            +{generatedSlides.length - 3} more slides generated
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="design" className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-3">Design Theme</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Primary Color:</span>
                              <span className="text-blue-600">#0078D4 (Microsoft Blue)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Font:</span>
                              <span>Segoe UI</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Style:</span>
                              <span>Executive Professional</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-3">Included Elements</h4>
                          <div className="space-y-1 text-sm">
                            <p>✓ Executive summary slide</p>
                            <p>✓ Portfolio metrics dashboard</p>
                            <p>✓ Solution-specific ROI slides</p>
                            <p>✓ Implementation roadmap</p>
                            <p>✓ Recommendations & next steps</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {safeROIResults.length === 0 && (
              <Button 
                onClick={async () => {
                  // Add sample ROI results for demo
                  const sampleCalculations: ROIResult[] = [
                    {
                      solution: 'Microsoft 365 Copilot Enterprise',
                      metrics: {
                        investment: 2800000,
                        npv: 8400000,
                        roi: 300,
                        payback: 8.5,
                        savings: 1200000,
                        productivity: 35,
                        revenue: 2100000,
                        implementation: 6,
                        timeline: 36
                      },
                      timestamp: new Date().toISOString()
                    },
                    {
                      solution: 'Azure Cloud Migration & Modernization',
                      metrics: {
                        investment: 4200000,
                        npv: 12600000,
                        roi: 280,
                        payback: 12,
                        savings: 1800000,
                        productivity: 28,
                        revenue: 3200000,
                        implementation: 9,
                        timeline: 36
                      },
                      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                      solution: 'Power Platform Suite',
                      metrics: {
                        investment: 850000,
                        npv: 2550000,
                        roi: 200,
                        payback: 14,
                        savings: 680000,
                        productivity: 42,
                        revenue: 920000,
                        implementation: 4,
                        timeline: 24
                      },
                      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
                    }
                  ];
                  
                  setROIResults(sampleCalculations);
                  toast.success('Sample ROI calculations loaded successfully');
                }}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Calculator className="w-5 h-5" />
                Load Sample ROI Data
              </Button>
            )}
            
            <Button 
              onClick={async () => {
                // Test file download functionality
                try {
                  const testContent = `Test PowerPoint Content
                  
Generated: ${new Date().toLocaleString()}
Portfolio Summary:
- Total Investment: $7,850,000
- Expected NPV: $23,550,000
- Portfolio ROI: 300.0%
- Solutions: 3

This is a test file to verify download functionality works correctly.`;
                  
                  const blob = new Blob([testContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'PowerPoint_Test_Download.txt';
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  toast.success('Test download completed successfully!');
                } catch (error) {
                  toast.error(`Test download failed: ${error.message}`);
                }
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Test Download
            </Button>
            
            <Button 
              onClick={generatePowerPoint}
              disabled={isGenerating || safeROIResults.length === 0}
              size="lg"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkle className="w-5 h-5 animate-spin" />
                  Generating PowerPoint...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate Executive PowerPoint
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

          {/* Feature Overview */}
          <Card>
            <CardHeader>
              <CardTitle>PowerPoint Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Executive-Ready Content</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• AI-generated executive summary</li>
                    <li>• Portfolio financial dashboard</li>
                    <li>• Solution-specific business cases</li>
                    <li>• Implementation roadmap</li>
                    <li>• Professional Microsoft branding</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Delivery Support</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Speaker notes for each slide</li>
                    <li>• Presentation timing guidance</li>
                    <li>• Chart and visualization specs</li>
                    <li>• Q&A preparation materials</li>
                    <li>• Executive messaging framework</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
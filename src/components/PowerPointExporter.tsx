import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  PresentationChart, 
  Sparkle,
  Users,
  Target,
  ChartLine,
  Calendar,
  Building,
  Lightbulb,
  CheckCircle,
  Eye,
  Share
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface ROIResult {
  solution: string;
  metrics: any;
  timestamp: string;
}

interface PresentationConfig {
  title: string;
  audience: string;
  duration: string;
  focusArea: string;
  includeAppendix: boolean;
  customMessage: string;
  executiveSummary: boolean;
  financialDetails: boolean;
  implementationTimeline: boolean;
  riskMitigation: boolean;
  competitiveAnalysis: boolean;
  nextSteps: boolean;
}

const presentationTemplates = [
  {
    id: 'executive-brief',
    name: 'Executive Brief',
    description: 'Concise 10-slide overview for C-level executives',
    duration: '15 mins',
    slides: [
      'Executive Summary',
      'Business Challenge',
      'Proposed Solution',
      'Financial Impact',
      'Risk Mitigation',
      'Implementation Overview',
      'Competitive Advantage',
      'Next Steps',
      'Investment Summary',
      'Recommendation'
    ]
  },
  {
    id: 'board-presentation',
    name: 'Board Presentation',
    description: 'Comprehensive presentation for board meetings',
    duration: '30 mins',
    slides: [
      'Executive Summary',
      'Market Context',
      'Strategic Alignment',
      'Business Case',
      'Financial Analysis',
      'Risk Assessment',
      'Implementation Strategy',
      'Resource Requirements',
      'Timeline & Milestones',
      'Success Metrics',
      'Competitive Position',
      'Recommendation & Vote'
    ]
  },
  {
    id: 'technical-deep-dive',
    name: 'Technical Deep Dive',
    description: 'Detailed technical and financial analysis',
    duration: '45 mins',
    slides: [
      'Executive Summary',
      'Current State Analysis',
      'Technical Requirements',
      'Solution Architecture',
      'Cost-Benefit Analysis',
      'ROI Calculations',
      'Implementation Plan',
      'Risk Register',
      'Success Metrics',
      'Vendor Comparison',
      'Resource Planning',
      'Timeline',
      'Appendix: Technical Details'
    ]
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Review',
    description: 'Portfolio review for regular business reviews',
    duration: '20 mins',
    slides: [
      'Portfolio Overview',
      'Key Achievements',
      'Financial Performance',
      'ROI Dashboard',
      'Market Trends',
      'Upcoming Initiatives',
      'Budget Allocation',
      'Risk Update',
      'Q&A'
    ]
  }
];

const audienceProfiles = [
  { id: 'ceo', name: 'CEO & C-Suite', focus: 'Strategic impact and competitive advantage' },
  { id: 'cfo', name: 'CFO & Finance', focus: 'Financial returns and budget optimization' },
  { id: 'cto', name: 'CTO & Technology', focus: 'Technical benefits and implementation' },
  { id: 'board', name: 'Board of Directors', focus: 'Governance and strategic oversight' },
  { id: 'vp', name: 'VP & Directors', focus: 'Operational excellence and team impact' }
];

export function PowerPointExporter() {
  const [roiResults] = useKV<ROIResult[]>('roi-calculations', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('executive-brief');
  const [config, setConfig] = useState<PresentationConfig>({
    title: 'Microsoft Solutions ROI Analysis',
    audience: 'ceo',
    duration: '15',
    focusArea: 'financial-impact',
    includeAppendix: false,
    customMessage: '',
    executiveSummary: true,
    financialDetails: true,
    implementationTimeline: true,
    riskMitigation: true,
    competitiveAnalysis: false,
    nextSteps: true
  });

  const safeROIResults = roiResults || [];

  const generatePresentation = async () => {
    if (safeROIResults.length === 0) {
      toast.error('No ROI calculations available. Please calculate ROI first.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Calculate portfolio metrics
      const portfolio = {
        totalInvestment: safeROIResults.reduce((sum, r) => sum + (r.metrics.investment || 0), 0),
        totalNPV: safeROIResults.reduce((sum, r) => sum + (r.metrics.npv || 0), 0),
        avgROI: safeROIResults.reduce((sum, r) => sum + (r.metrics.roi || 0), 0) / safeROIResults.length,
        avgPayback: safeROIResults.reduce((sum, r) => sum + (r.metrics.payback || 0), 0) / safeROIResults.length
      };

      const selectedAudience = audienceProfiles.find(a => a.id === config.audience);
      const template = presentationTemplates.find(t => t.id === selectedTemplate);

      // Generate presentation content using AI
      const prompt = (window as any).spark.llmPrompt`
Create a professional PowerPoint presentation outline for Microsoft Solutions ROI analysis with the following specifications:

PRESENTATION DETAILS:
- Title: ${config.title}
- Audience: ${selectedAudience?.name} (${selectedAudience?.focus})
- Template: ${template?.name}
- Duration: ${config.duration} minutes
- Focus Area: ${config.focusArea}

PORTFOLIO METRICS:
- Total Investment: $${portfolio.totalInvestment.toLocaleString()}
- Total NPV: $${portfolio.totalNPV.toLocaleString()}
- Average ROI: ${portfolio.avgROI.toFixed(1)}%
- Average Payback: ${portfolio.avgPayback.toFixed(1)} months
- Number of Solutions: ${safeROIResults.length}

ROI CALCULATIONS:
${safeROIResults.map(r => `
- ${r.solution}: ROI ${r.metrics.roi.toFixed(1)}%, NPV $${r.metrics.npv.toLocaleString()}, Payback ${r.metrics.payback.toFixed(1)}mo
`).join('')}

SECTIONS TO INCLUDE:
${config.executiveSummary ? '- Executive Summary' : ''}
${config.financialDetails ? '- Financial Analysis' : ''}
${config.implementationTimeline ? '- Implementation Timeline' : ''}
${config.riskMitigation ? '- Risk Mitigation' : ''}
${config.competitiveAnalysis ? '- Competitive Analysis' : ''}
${config.nextSteps ? '- Next Steps & Recommendations' : ''}

CUSTOM MESSAGE: ${config.customMessage || 'None'}

Please provide a detailed slide-by-slide outline with:
1. Slide title
2. Key talking points (3-5 bullets per slide)
3. Visual elements to include
4. Executive insights for each slide
5. Recommended charts/graphs

Format as a comprehensive executive presentation that demonstrates the business value and ROI of Microsoft solutions.
`;

      const presentationOutline = await (window as any).spark.llm(prompt);

      // Generate PowerPoint-specific content
      const powerPointGuide = (window as any).spark.llmPrompt`
Create a comprehensive PowerPoint implementation guide for the ROI presentation including:

1. Slide-by-slide design recommendations
2. Microsoft branding guidelines
3. Chart and visualization specifications
4. Animation and transition suggestions
5. Speaker notes for each slide
6. Executive Q&A preparation
7. Handout materials recommendations

Focus on creating a presentation that executives can use directly in PowerPoint with specific formatting instructions.
`;

      const implementationGuide = await (window as any).spark.llm(powerPointGuide);

      // Create the downloadable presentation content
      const presentationData = {
        title: config.title,
        audience: selectedAudience?.name,
        template: template?.name,
        generatedDate: new Date().toISOString(),
        portfolio,
        roiResults: safeROIResults,
        outline: presentationOutline,
        implementationGuide,
        config,
        powerPointInstructions: {
          masterSlide: {
            background: "White with subtle Microsoft blue accent",
            titleFont: "Segoe UI, 36pt, Bold, #0078D4",
            bodyFont: "Segoe UI, 24pt, Regular, #333333",
            logoPlacement: "Top right corner"
          },
          slideTemplates: template?.slides.map((slideTitle, index) => ({
            slideNumber: index + 1,
            title: slideTitle,
            layout: index === 0 ? "Title Slide" : index < 3 ? "Title and Content" : "Content with Chart",
            animations: "Subtle fade-in for bullet points",
            transitions: "Smooth fade, 0.5 seconds"
          })),
          chartSpecifications: {
            colors: ["#0078D4", "#106EBE", "#005A9E", "#40E0D0", "#32CD32"],
            style: "Corporate clean with data labels",
            roiChart: "Horizontal bar chart showing ROI by solution",
            timelineChart: "Gantt chart for implementation phases",
            portfolioChart: "Pie chart for investment allocation"
          }
        }
      };

      // Create professional PowerPoint XML template
      const pptxTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<Presentation xmlns="http://schemas.openxmlformats.org/presentationml/2006/main">
  <Properties>
    <Title>${config.title}</Title>
    <Author>${selectedAudience?.name} Presentation</Author>
    <Company>Microsoft Corporation</Company>
    <Created>${new Date().toISOString()}</Created>
  </Properties>
  <MasterSlides>
    <MasterSlide>
      <Background color="#FFFFFF"/>
      <TitleStyle font="Segoe UI" size="36" color="#0078D4" bold="true"/>
      <BodyStyle font="Segoe UI" size="24" color="#333333"/>
      <AccentColor>#0078D4</AccentColor>
    </MasterSlide>
  </MasterSlides>
  <Slides>
    ${template?.slides.map((slideTitle, index) => `
    <Slide number="${index + 1}">
      <Title>${slideTitle}</Title>
      <Layout>${index === 0 ? 'Title' : index < 3 ? 'TitleAndContent' : 'ContentWithChart'}</Layout>
      <Transition>Fade</Transition>
      <Animation>FadeInOnClick</Animation>
    </Slide>`).join('')}
  </Slides>
</Presentation>`;

      // Create multiple file formats
      const files = [
        {
          name: `${config.title.replace(/\s+/g, '_')}_PowerPoint_Template.xml`,
          content: pptxTemplate,
          type: 'application/xml'
        },
        {
          name: `${config.title.replace(/\s+/g, '_')}_Presentation_Guide.md`,
          content: `# ${config.title}\n## PowerPoint Implementation Guide\n\n${implementationGuide}\n\n## Presentation Outline\n\n${presentationOutline}`,
          type: 'text/markdown'
        },
        {
          name: `${config.title.replace(/\s+/g, '_')}_Complete_Package.json`,
          content: JSON.stringify(presentationData, null, 2),
          type: 'application/json'
        },
        {
          name: `${config.title.replace(/\s+/g, '_')}_Executive_Summary.txt`,
          content: `${config.title}\n\nGenerated: ${new Date().toLocaleDateString()}\nAudience: ${selectedAudience?.name}\nDuration: ${config.duration} minutes\n\nPortfolio Summary:\n- Total Investment: $${portfolio.totalInvestment.toLocaleString()}\n- Total NPV: $${portfolio.totalNPV.toLocaleString()}\n- Average ROI: ${portfolio.avgROI.toFixed(1)}%\n- Solutions: ${safeROIResults.length}\n\nReady for PowerPoint import and customization.`,
          type: 'text/plain'
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

      toast.success(`PowerPoint presentation package with ${files.length} files generated and downloaded!`);
      
    } catch (error) {
      console.error('Error generating presentation:', error);
      toast.error('Failed to generate presentation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPresentation = () => {
    const template = presentationTemplates.find(t => t.id === selectedTemplate);
    toast.info(`Preview: ${template?.name} with ${template?.slides.length} slides`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PresentationChart className="w-4 h-4" />
          Export PowerPoint
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PresentationChart className="w-5 h-5" />
            Export ROI Analysis to PowerPoint
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portfolio Summary */}
          {safeROIResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-800">
                      {safeROIResults.length}
                    </p>
                    <p className="text-sm text-blue-600">Solutions</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-800">
                      ${(safeROIResults.reduce((sum, r) => sum + (r.metrics.npv || 0), 0) / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-green-600">Total NPV</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-800">
                      {(safeROIResults.reduce((sum, r) => sum + (r.metrics.roi || 0), 0) / safeROIResults.length).toFixed(1)}%
                    </p>
                    <p className="text-sm text-purple-600">Avg ROI</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-800">
                      {(safeROIResults.reduce((sum, r) => sum + (r.metrics.payback || 0), 0) / safeROIResults.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-orange-600">Avg Payback (mo)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="template">Template & Format</TabsTrigger>
              <TabsTrigger value="content">Content & Messaging</TabsTrigger>
              <TabsTrigger value="preview">Preview & Export</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Template Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Presentation Template</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {presentationTemplates.map((template) => (
                      <div key={template.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={template.id}
                            checked={selectedTemplate === template.id}
                            onCheckedChange={() => setSelectedTemplate(template.id)}
                          />
                          <Label htmlFor={template.id} className="font-medium">
                            {template.name}
                          </Label>
                          <Badge variant="outline">{template.duration}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {template.description}
                        </p>
                        <div className="ml-6">
                          <p className="text-xs font-medium mb-1">Includes {template.slides.length} slides:</p>
                          <div className="text-xs text-muted-foreground">
                            {template.slides.slice(0, 3).join(', ')}
                            {template.slides.length > 3 && `, +${template.slides.length - 3} more`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Audience & Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Audience & Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="audience">Target Audience</Label>
                      <Select value={config.audience} onValueChange={(value) => setConfig({...config, audience: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {audienceProfiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              <div>
                                <div className="font-medium">{profile.name}</div>
                                <div className="text-xs text-muted-foreground">{profile.focus}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Presentation Title</Label>
                        <Input
                          id="title"
                          value={config.title}
                          onChange={(e) => setConfig({...config, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          value={config.duration}
                          onChange={(e) => setConfig({...config, duration: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="focus">Primary Focus Area</Label>
                      <Select value={config.focusArea} onValueChange={(value) => setConfig({...config, focusArea: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial-impact">Financial Impact & ROI</SelectItem>
                          <SelectItem value="competitive-advantage">Competitive Advantage</SelectItem>
                          <SelectItem value="risk-mitigation">Risk Mitigation</SelectItem>
                          <SelectItem value="operational-efficiency">Operational Efficiency</SelectItem>
                          <SelectItem value="innovation-growth">Innovation & Growth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content Sections */}
                <Card>
                  <CardHeader>
                    <CardTitle>Include Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'executiveSummary', label: 'Executive Summary', icon: Users },
                      { key: 'financialDetails', label: 'Financial Analysis', icon: ChartLine },
                      { key: 'implementationTimeline', label: 'Implementation Timeline', icon: Calendar },
                      { key: 'riskMitigation', label: 'Risk Mitigation', icon: CheckCircle },
                      { key: 'competitiveAnalysis', label: 'Competitive Analysis', icon: Target },
                      { key: 'nextSteps', label: 'Next Steps & Recommendations', icon: Lightbulb }
                    ].map((section) => {
                      const Icon = section.icon;
                      return (
                        <div key={section.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={section.key}
                            checked={config[section.key as keyof PresentationConfig] as boolean}
                            onCheckedChange={(checked) => 
                              setConfig({...config, [section.key]: checked})
                            }
                          />
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor={section.key}>{section.label}</Label>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Custom Messaging */}
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Messaging</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-message">Executive Message</Label>
                      <Textarea
                        id="custom-message"
                        placeholder="Add custom talking points, strategic context, or specific messages for your audience..."
                        value={config.customMessage}
                        onChange={(e) => setConfig({...config, customMessage: e.target.value})}
                        className="min-h-32"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="appendix"
                        checked={config.includeAppendix}
                        onCheckedChange={(checked) => 
                          setConfig({...config, includeAppendix: checked as boolean})
                        }
                      />
                      <Label htmlFor="appendix">Include Technical Appendix</Label>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium">Presentation Tips</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Focus on business outcomes over technical features</li>
                        <li>• Use data-driven insights and industry benchmarks</li>
                        <li>• Include clear call-to-action and next steps</li>
                        <li>• Prepare for Q&A with detailed appendix</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-6">
                {/* Preview Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Presentation Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Presentation Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Title:</span>
                            <span>{config.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Audience:</span>
                            <span>{audienceProfiles.find(a => a.id === config.audience)?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Template:</span>
                            <span>{presentationTemplates.find(t => t.id === selectedTemplate)?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span>{config.duration} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Slides:</span>
                            <span>{presentationTemplates.find(t => t.id === selectedTemplate)?.slides.length}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Content Sections</h4>
                        <div className="space-y-1">
                          {[
                            { key: 'executiveSummary', label: 'Executive Summary' },
                            { key: 'financialDetails', label: 'Financial Analysis' },
                            { key: 'implementationTimeline', label: 'Implementation Timeline' },
                            { key: 'riskMitigation', label: 'Risk Mitigation' },
                            { key: 'competitiveAnalysis', label: 'Competitive Analysis' },
                            { key: 'nextSteps', label: 'Next Steps' }
                          ].map((section) => (
                            <div key={section.key} className="flex items-center gap-2 text-sm">
                              {config[section.key as keyof PresentationConfig] ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-muted-foreground" />
                              )}
                              <span className={
                                config[section.key as keyof PresentationConfig] 
                                  ? 'text-foreground' 
                                  : 'text-muted-foreground line-through'
                              }>
                                {section.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={previewPresentation}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Outline
                  </Button>
                  
                  <Button 
                    onClick={generatePresentation}
                    disabled={isGenerating || safeROIResults.length === 0}
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkle className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Generate PowerPoint
                      </>
                    )}
                  </Button>
                </div>

                {safeROIResults.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No ROI calculations available.</p>
                    <p className="text-sm">Please calculate ROI for Microsoft solutions first.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
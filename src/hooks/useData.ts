import { useKV } from '@github/spark/hooks';
import { Account, NextBestAction, Signal, MemoryEntry } from '@/types';
import { generateBusinessValueSignal, generateIndustrySpecificSignal } from '@/services/signalCatalog';
import React, { useEffect } from 'react';

// Sample seed data - exported for reset functionality with realistic health score patterns
export const sampleAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    arr: 28500000,
    healthScore: 85,
    status: 'Good',
    csam: 'Sarah Chen',
    ae: 'Michael Thompson',
    contractEnd: '2024-12-31',
    lastActivity: '2024-01-15',
    expansionOpportunity: 8500000,
    expansionOpportunities: [
      {
        value: 4500000,
        category: 'user-expansion',
        description: 'Scale Azure AI services to 15,000 additional developers across global offices',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Executive sponsor alignment meeting with CTO and VP Engineering',
          'Technical deep-dive session with development teams',
          'Business case presentation to procurement and finance',
          'Pilot program rollout to 2 development teams (300 users)'
        ],
        microsoftSolutions: ['Azure OpenAI Service', 'GitHub Copilot Enterprise', 'Azure Machine Learning'],
        deliveryMotions: ['FastTrack Onboarding', 'Customer Success Manager-led adoption', 'Technical Advisory Services'],
        stakeholdersRequired: ['CTO', 'VP Engineering', 'Lead Architects', 'Procurement Director'],
        successCriteria: ['95% user adoption rate', '40% reduction in development time', 'Monthly active usage >80%']
      },
      {
        value: 4000000,
        category: 'cross-sell',
        description: 'Implement Microsoft Security stack including Defender, Sentinel, and Compliance solutions',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Security assessment and gap analysis with CISO',
          'Joint threat modeling workshop',
          'Security ROI business case development',
          'Integration planning with existing security tools'
        ],
        microsoftSolutions: ['Microsoft Defender XDR', 'Microsoft Sentinel', 'Microsoft Purview'],
        deliveryMotions: ['Microsoft Security Partner integration', 'Proof of Concept deployment', 'Phased rollout strategy'],
        stakeholdersRequired: ['CISO', 'Security Architects', 'Compliance Officer', 'IT Operations Manager'],
        successCriteria: ['30% reduction in security incidents', 'Unified security dashboard deployment', 'Compliance audit readiness']
      }
    ]
  },
  {
    id: 'acc-2', 
    name: 'Global Manufacturing Inc',
    industry: 'Manufacturing',
    arr: 47500000,
    healthScore: 68,
    status: 'Watch',
    csam: 'Mike Rodriguez',
    ae: 'Jennifer Davis',
    contractEnd: '2024-08-15',
    lastActivity: '2024-01-10',
    expansionOpportunity: 12000000,
    expansionOpportunities: [
      {
        value: 7500000,
        category: 'feature-upgrade',
        description: 'Upgrade to Azure IoT Central Premium with advanced analytics for 50 manufacturing plants',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'IoT ROI analysis and business case presentation',
          'Plant manager stakeholder alignment across regions',
          'Technical architecture review with IT and OT teams',
          'Pilot deployment at 3 key manufacturing facilities'
        ],
        microsoftSolutions: ['Azure IoT Central Premium', 'Azure Digital Twins', 'Power BI Premium'],
        deliveryMotions: ['IoT Center of Excellence setup', 'Manufacturing partner engagement', 'Change management program'],
        stakeholdersRequired: ['COO', 'Plant Managers', 'IT Director', 'Operations Technology Manager'],
        successCriteria: ['15% increase in equipment efficiency', 'Predictive maintenance deployment', '90% data connectivity across plants']
      },
      {
        value: 4500000,
        category: 'geographic-expansion',
        description: 'Extend Azure Stack Edge and hybrid cloud to 25 additional global manufacturing sites',
        timeline: '6+ months',
        probability: 'high',
        requiredActivities: [
          'Global infrastructure assessment and planning',
          'Regional compliance and data residency review',
          'Local IT team training and certification',
          'Phased rollout coordination with global operations'
        ],
        microsoftSolutions: ['Azure Stack Edge', 'Azure Arc', 'Azure Migrate'],
        deliveryMotions: ['Global deployment program', 'Regional partner enablement', 'Local support establishment'],
        stakeholdersRequired: ['Global IT Director', 'Regional Operations Managers', 'Compliance Team', 'Local IT Teams'],
        successCriteria: ['Consistent hybrid cloud across all sites', 'Regional data compliance achieved', 'Standardized IT operations']
      }
    ]
  },
  {
    id: 'acc-3',
    name: 'FinanceFirst Bank',
    industry: 'Financial Services',
    arr: 89000000,
    healthScore: 45,
    status: 'At Risk',
    csam: 'Lisa Wang',
    ae: 'Robert Martinez',
    contractEnd: '2024-06-30',
    lastActivity: '2024-01-05',
    expansionOpportunity: 21000000,
    expansionOpportunities: [
      {
        value: 12000000,
        category: 'upsell',
        description: 'Upgrade to Azure Confidential Computing and Premium Support for regulated workloads',
        timeline: '60-90 days',
        probability: 'low',
        requiredActivities: [
          'Executive stakeholder re-engagement and relationship repair',
          'Comprehensive service review and performance improvement plan',
          'Regulatory compliance assessment with legal and risk teams',
          'Dedicated support team assignment and escalation protocols'
        ],
        microsoftSolutions: ['Azure Confidential Computing', 'Microsoft Premier Support', 'Azure Policy Compliance'],
        deliveryMotions: ['Account rescue program', 'Executive relationship management', 'Dedicated customer success team'],
        stakeholdersRequired: ['CEO', 'CRO (Chief Risk Officer)', 'Head of Technology', 'Chief Compliance Officer'],
        successCriteria: ['Contract renewal secured', 'Service performance SLAs met', 'Regulatory audit compliance']
      },
      {
        value: 9000000,
        category: 'cross-sell',
        description: 'Implement comprehensive data governance with Microsoft Purview across all business units',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Data governance maturity assessment',
          'Cross-functional stakeholder workshops',
          'Regulatory mapping and compliance framework development',
          'Executive sponsor champion identification and enablement'
        ],
        microsoftSolutions: ['Microsoft Purview', 'Microsoft Compliance Manager', 'Azure Data Factory'],
        deliveryMotions: ['Data governance consultation', 'Compliance workshop series', 'Phased implementation approach'],
        stakeholdersRequired: ['Chief Data Officer', 'Legal Counsel', 'Business Unit Leaders', 'Data Architects'],
        successCriteria: ['Data classification completion', 'Automated compliance reporting', 'Reduced regulatory risk exposure']
      }
    ]
  },
  {
    id: 'acc-4',
    name: 'HealthTech Innovations',
    industry: 'Healthcare',
    arr: 36500000,
    healthScore: 78,
    status: 'Good',
    csam: 'David Kim',
    ae: 'Amanda Foster',
    contractEnd: '2024-11-20',
    lastActivity: '2024-01-14',
    expansionOpportunity: 9800000,
    expansionOpportunities: [
      {
        value: 5800000,
        category: 'feature-upgrade',
        description: 'Implement Azure Health Data Services with FHIR and advanced analytics for patient care optimization',
        timeline: '30-60 days',
        probability: 'high',
        requiredActivities: [
          'Clinical workflow integration planning',
          'HIPAA compliance validation and certification',
          'Clinical staff training and adoption program',
          'Integration testing with existing EHR systems'
        ],
        microsoftSolutions: ['Azure Health Data Services', 'Azure Cognitive Services for Health', 'Power BI Healthcare'],
        deliveryMotions: ['Healthcare FastTrack program', 'Clinical workflow optimization', 'Compliance certification support'],
        stakeholdersRequired: ['Chief Medical Officer', 'IT Director', 'Compliance Manager', 'Clinical Department Heads'],
        successCriteria: ['FHIR data interoperability achieved', '25% improvement in care coordination', 'Real-time clinical insights dashboard']
      },
      {
        value: 4000000,
        category: 'user-expansion',
        description: 'Scale Microsoft Teams and collaboration tools to 15,000 healthcare workers across hospital network',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Healthcare communication workflow analysis',
          'Clinical mobility and device compatibility testing',
          'Staff training program development and delivery',
          'Integration with nurse call systems and patient monitoring'
        ],
        microsoftSolutions: ['Microsoft Teams for Healthcare', 'Microsoft Viva Connections', 'Power Platform'],
        deliveryMotions: ['Healthcare adoption program', 'Clinical workflow integration', 'Mobile-first deployment'],
        stakeholdersRequired: ['Chief Nursing Officer', 'Department Managers', 'IT Support Team', 'Training Coordinators'],
        successCriteria: ['90% staff adoption rate', 'Improved care team coordination', 'Reduced communication delays']
      }
    ]
  },
  {
    id: 'acc-5',
    name: 'RetailMax Corp',
    industry: 'Retail',
    arr: 18500000,
    healthScore: 52,
    status: 'At Risk',
    csam: 'Emily Johnson',
    ae: 'Carlos Ruiz',
    contractEnd: '2024-05-15',
    lastActivity: '2024-01-08',
    expansionOpportunity: 4500000,
    expansionOpportunities: [
      {
        value: 2800000,
        category: 'cross-sell',
        description: 'Implement Microsoft Dynamics 365 Commerce and customer insights platform',
        timeline: '90-180 days',
        probability: 'low',
        requiredActivities: [
          'Relationship recovery and trust rebuilding initiative',
          'Retail digital transformation strategy session',
          'Customer experience improvement roadmap development',
          'Store operations and e-commerce integration planning'
        ],
        microsoftSolutions: ['Dynamics 365 Commerce', 'Customer Insights', 'Azure Cognitive Search'],
        deliveryMotions: ['Retail transformation consultation', 'Customer experience workshop', 'Phased rollout to pilot stores'],
        stakeholdersRequired: ['Chief Digital Officer', 'VP Retail Operations', 'Marketing Director', 'Store Operations Manager'],
        successCriteria: ['Unified customer experience across channels', '20% increase in customer engagement', 'Improved inventory turnover']
      },
      {
        value: 1700000,
        category: 'feature-upgrade',
        description: 'Upgrade to advanced analytics and AI-powered demand forecasting for inventory optimization',
        timeline: '60-90 days',
        probability: 'medium',
        requiredActivities: [
          'Inventory analytics assessment and baseline establishment',
          'Supply chain data integration and cleansing',
          'Merchandising team training on AI insights',
          'Seasonal demand pattern analysis and model validation'
        ],
        microsoftSolutions: ['Azure Machine Learning', 'Power BI Premium', 'Azure Synapse Analytics'],
        deliveryMotions: ['AI adoption workshop', 'Analytics center of excellence setup', 'Data science team augmentation'],
        stakeholdersRequired: ['VP Merchandising', 'Supply Chain Director', 'Data Analytics Manager', 'Category Managers'],
        successCriteria: ['15% reduction in stockouts', 'Improved demand forecast accuracy', 'Optimized inventory investment']
      }
    ]
  },
  {
    id: 'acc-6',
    name: 'EduLearn Systems',
    industry: 'Education',
    arr: 21000000,
    healthScore: 72,
    status: 'Watch',
    csam: 'Rachel Green',
    ae: 'Kevin Park',
    contractEnd: '2024-09-30',
    lastActivity: '2024-01-12',
    expansionOpportunity: 5800000,
    expansionOpportunities: [
      {
        value: 3500000,
        category: 'user-expansion',
        description: 'Expand Microsoft 365 Education and Teams to 50,000 additional students and faculty',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Academic stakeholder alignment across multiple universities',
          'Student and faculty digital adoption program design',
          'Integration with existing learning management systems',
          'Campus-wide WiFi and device readiness assessment'
        ],
        microsoftSolutions: ['Microsoft 365 Education A5', 'Microsoft Teams for Education', 'Power Platform for Education'],
        deliveryMotions: ['Education transformation program', 'Faculty enablement workshops', 'Student success initiatives'],
        stakeholdersRequired: ['Provost', 'CIO', 'Deans', 'Faculty Senate Representatives'],
        successCriteria: ['95% student and faculty engagement', 'Improved learning outcomes metrics', 'Streamlined administrative processes']
      },
      {
        value: 2300000,
        category: 'feature-upgrade',
        description: 'Implement advanced learning analytics and AI-powered student success platforms',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Academic analytics strategy development',
          'Student privacy and data governance framework establishment',
          'Learning outcome measurement and KPI definition',
          'Faculty training on data-driven instruction methods'
        ],
        microsoftSolutions: ['Viva Insights for Education', 'Azure Cognitive Services', 'Power BI Education Analytics'],
        deliveryMotions: ['Learning analytics consultation', 'Academic success workshop series', 'AI for education training'],
        stakeholdersRequired: ['Academic Affairs VP', 'Institutional Research Director', 'Faculty Development Team', 'Student Success Coordinators'],
        successCriteria: ['Predictive student success models deployed', 'Early intervention programs established', 'Improved graduation rates']
      }
    ]
  },
  {
    id: 'acc-7',
    name: 'Energy Solutions Ltd',
    industry: 'Energy',
    arr: 72500000,
    healthScore: 88,
    status: 'Good',
    csam: 'Tom Wilson',
    ae: 'Lisa Anderson',
    contractEnd: '2025-02-28',
    lastActivity: '2024-01-16',
    expansionOpportunity: 18000000,
    expansionOpportunities: [
      {
        value: 10500000,
        category: 'geographic-expansion',
        description: 'Deploy Azure IoT and sustainability tracking across 200 renewable energy sites globally',
        timeline: '6+ months',
        probability: 'high',
        requiredActivities: [
          'Global renewable energy portfolio assessment',
          'Sustainability metrics framework development',
          'Regional regulatory compliance validation',
          'Multi-phase deployment planning across continents'
        ],
        microsoftSolutions: ['Azure IoT Central', 'Microsoft Sustainability Manager', 'Power BI Environmental Impact'],
        deliveryMotions: ['Sustainability transformation program', 'Global IoT deployment expertise', 'Carbon tracking implementation'],
        stakeholdersRequired: ['Chief Sustainability Officer', 'VP Operations', 'Regional Site Managers', 'Environmental Compliance Team'],
        successCriteria: ['Real-time carbon footprint tracking', 'Automated sustainability reporting', 'Optimized renewable energy output']
      },
      {
        value: 7500000,
        category: 'feature-upgrade',
        description: 'Implement advanced AI-powered grid optimization and predictive maintenance systems',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Grid operations and maintenance workflow analysis',
          'AI model development for predictive maintenance',
          'Integration with existing SCADA and OT systems',
          'Operations team training on AI-driven insights'
        ],
        microsoftSolutions: ['Azure Machine Learning', 'Azure Digital Twins', 'Azure Stream Analytics'],
        deliveryMotions: ['AI for energy consultation', 'Predictive maintenance workshop', 'Digital twin implementation'],
        stakeholdersRequired: ['Chief Technology Officer', 'Grid Operations Manager', 'Maintenance Director', 'Data Science Team'],
        successCriteria: ['25% reduction in unplanned downtime', 'Improved energy distribution efficiency', 'Proactive maintenance scheduling']
      }
    ]
  },
  {
    id: 'acc-8',
    name: 'CloudFirst Technologies',
    industry: 'Technology',
    arr: 48500000,
    healthScore: 41,
    status: 'At Risk',
    csam: 'Anna Lee',
    ae: 'Mark Johnson',
    contractEnd: '2024-07-10',
    lastActivity: '2024-01-06',
    expansionOpportunity: 9200000,
    expansionOpportunities: [
      {
        value: 5500000,
        category: 'upsell',
        description: 'Upgrade to Azure Premium Support and dedicated technical account management',
        timeline: '30-60 days',
        probability: 'medium',
        requiredActivities: [
          'Executive escalation and relationship repair strategy',
          'Technical support performance review and improvement plan',
          'Service level agreement renegotiation',
          'Dedicated technical account manager assignment'
        ],
        microsoftSolutions: ['Azure Expert MSP', 'Microsoft Premier Support', 'Azure Advisor'],
        deliveryMotions: ['Account recovery program', 'Technical relationship management', 'Service excellence initiative'],
        stakeholdersRequired: ['CTO', 'VP Infrastructure', 'Technical Architects', 'Operations Manager'],
        successCriteria: ['Improved support response times', 'Proactive technical guidance', 'Infrastructure optimization achieved']
      },
      {
        value: 3700000,
        category: 'cross-sell',
        description: 'Implement comprehensive DevOps transformation with GitHub Enterprise and Azure DevOps',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'DevOps maturity assessment and gap analysis',
          'Development team workflow optimization',
          'CI/CD pipeline modernization planning',
          'Developer productivity and collaboration improvement program'
        ],
        microsoftSolutions: ['GitHub Enterprise', 'Azure DevOps Services', 'GitHub Advanced Security'],
        deliveryMotions: ['DevOps transformation consultation', 'Developer productivity workshop', 'Secure development practices training'],
        stakeholdersRequired: ['VP Engineering', 'Development Team Leads', 'DevOps Engineers', 'Security Architect'],
        successCriteria: ['50% faster deployment cycles', 'Improved code quality metrics', 'Enhanced security scanning coverage']
      }
    ]
  },
  {
    id: 'acc-9',
    name: 'AgriTech Farms',
    industry: 'Agriculture',
    arr: 31500000,
    healthScore: 76,
    status: 'Good',
    csam: 'Steve Miller',
    ae: 'Diana Ross',
    contractEnd: '2024-10-15',
    lastActivity: '2024-01-13',
    expansionOpportunity: 7500000,
    expansionOpportunities: [
      {
        value: 4200000,
        category: 'feature-upgrade',
        description: 'Implement precision agriculture platform with Azure FarmBeats and satellite imagery analytics',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Farm operations and data collection assessment',
          'Precision agriculture technology integration planning',
          'Farmer and agronomist training program development',
          'Crop yield optimization model development and validation'
        ],
        microsoftSolutions: ['Azure FarmBeats', 'Azure Cognitive Services', 'Power BI Agriculture Analytics'],
        deliveryMotions: ['Precision agriculture consultation', 'Smart farming workshop series', 'Agricultural AI implementation'],
        stakeholdersRequired: ['Chief Agricultural Officer', 'Farm Operations Manager', 'Agronomists', 'IT Operations Team'],
        successCriteria: ['20% improvement in crop yields', 'Optimized resource utilization', 'Data-driven farming decisions']
      },
      {
        value: 3300000,
        category: 'geographic-expansion',
        description: 'Scale IoT and analytics platform to 150 additional farm locations across multiple regions',
        timeline: '6+ months',
        probability: 'high',
        requiredActivities: [
          'Multi-region farm network assessment and planning',
          'Rural connectivity and infrastructure evaluation',
          'Regional agricultural practice adaptation',
          'Scalable IoT deployment and support model establishment'
        ],
        microsoftSolutions: ['Azure IoT Central', 'Azure Edge Devices', 'Azure Maps'],
        deliveryMotions: ['Agricultural IoT expansion program', 'Rural deployment expertise', 'Regional partner enablement'],
        stakeholdersRequired: ['Regional Farm Managers', 'Agricultural Technology Team', 'Operations Coordinators', 'Local Support Teams'],
        successCriteria: ['Consistent data collection across all farms', 'Standardized agricultural practices', 'Centralized farm management dashboard']
      }
    ]
  },
  {
    id: 'acc-10',
    name: 'TransportCorp',
    industry: 'Transportation',
    arr: 42000000,
    healthScore: 63,
    status: 'Watch',
    csam: 'Julia Roberts',
    ae: 'Chris Evans',
    contractEnd: '2024-08-30',
    lastActivity: '2024-01-11',
    expansionOpportunity: 9800000,
    expansionOpportunities: [
      {
        value: 5800000,
        category: 'feature-upgrade',
        description: 'Implement advanced fleet management and route optimization with AI-powered logistics platform',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Fleet operations and logistics workflow analysis',
          'Driver and dispatcher training on new systems',
          'Integration with existing transportation management systems',
          'Route optimization algorithm testing and validation'
        ],
        microsoftSolutions: ['Azure Maps', 'Azure Machine Learning', 'Dynamics 365 Field Service'],
        deliveryMotions: ['Transportation digital transformation', 'Logistics optimization workshop', 'Fleet management consultation'],
        stakeholdersRequired: ['VP Operations', 'Fleet Managers', 'Dispatch Coordinators', 'Driver Representatives'],
        successCriteria: ['15% reduction in fuel costs', 'Improved on-time delivery rates', 'Enhanced driver satisfaction scores']
      },
      {
        value: 4000000,
        category: 'cross-sell',
        description: 'Deploy comprehensive safety and compliance platform with real-time monitoring and reporting',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Safety compliance requirement analysis and gap assessment',
          'Real-time monitoring system integration planning',
          'Safety officer and management training program',
          'Regulatory reporting automation setup and validation'
        ],
        microsoftSolutions: ['Power Platform', 'Microsoft Compliance Manager', 'Azure IoT Edge'],
        deliveryMotions: ['Transportation safety program', 'Compliance automation workshop', 'Real-time monitoring implementation'],
        stakeholdersRequired: ['Chief Safety Officer', 'Compliance Manager', 'Operations Directors', 'Safety Training Coordinators'],
        successCriteria: ['Automated compliance reporting', 'Real-time safety incident tracking', 'Improved safety performance metrics']
      }
    ]
  }
];

export function useAccounts() {
  const [accounts, setAccounts] = useKV<Account[]>('accounts', sampleAccounts);

  const updateAccount = (accountId: string, updates: Partial<Account>) => {
    setAccounts((prev) => 
      (prev || []).map(acc => acc.id === accountId ? { ...acc, ...updates } : acc)
    );
  };

  const addAccount = (account: Account) => {
    setAccounts((prev) => [...(prev || []), account]);
  };

  const resetAccounts = () => {
    setAccounts(sampleAccounts);
  };

  return {
    accounts: accounts || [],
    setAccounts,
    updateAccount,
    addAccount,
    resetAccounts
  };
}

export function useNBAs() {
  const [nbas, setNBAs] = useKV<NextBestAction[]>('nbas', []);

  const addNBA = (nba: NextBestAction) => {
    setNBAs((prev) => [...(prev || []), nba]);
  };

  const removeNBA = (nbaId: string) => {
    setNBAs((prev) => (prev || []).filter(nba => nba.id !== nbaId));
  };

  return {
    nbas: nbas || [],
    setNBAs,
    addNBA,
    removeNBA
  };
}

export function useSignals() {
  const [signals, setSignals] = useKV<Signal[]>('signals', []);

  const addSignal = (signal: Signal) => {
    setSignals((prev) => [...(prev || []), signal]);
  };

  const removeSignal = (signalId: string) => {
    setSignals((prev) => (prev || []).filter(signal => signal.id !== signalId));
  };

  return {
    signals: signals || [],
    setSignals,
    addSignal,
    removeSignal
  };
}

export function useAgentMemory() {
  const [memory, setMemory] = useKV<MemoryEntry[]>('agent-memory', []);

  const addMemoryEntry = (entry: MemoryEntry) => {
    setMemory((prev) => [...(prev || []), entry]);
  };

  const clearMemory = () => {
    setMemory([]);
  };

  return {
    memory: memory || [],
    setMemory,
    addMemoryEntry,
    clearMemory
  };
}

// Helper function to generate enhanced signals based on accounts
export function generateEnhancedSignals(accounts: Account[]): Signal[] {
  const signals: Signal[] = [];
  
  accounts.forEach(account => {
    // Generate 5-8 signals per account for demo purposes
    const signalCount = Math.floor(Math.random() * 4) + 5;
    
    for (let i = 0; i < signalCount; i++) {
      const signal = generateBusinessValueSignal(account.id, account.name);
      signals.push(signal);
    }
    
    // Add industry-specific signals
    const industrySignal = generateIndustrySpecificSignal(account.id, account.name, account.industry);
    signals.push(industrySignal);
  });
  
  return signals;
}
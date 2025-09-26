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
  },
  {
    id: 'acc-11',
    name: 'MediaStreams Inc',
    industry: 'Media & Entertainment',
    arr: 25000000,
    healthScore: 81,
    status: 'Good',
    csam: 'Ashley Martinez',
    ae: 'Brandon Taylor',
    contractEnd: '2024-12-15',
    lastActivity: '2024-01-15',
    expansionOpportunity: 6200000,
    expansionOpportunities: [
      {
        value: 3800000,
        category: 'feature-upgrade',
        description: 'Implement Azure Media Services Premium with AI-powered content analysis and automated workflows',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Content workflow analysis and optimization planning',
          'AI-powered content moderation and analysis setup',
          'Integration with existing content management systems',
          'Content creator and editor training on new AI tools'
        ],
        microsoftSolutions: ['Azure Media Services', 'Azure Cognitive Services', 'Azure Video Analyzer'],
        deliveryMotions: ['Media AI transformation workshop', 'Content automation consultation', 'Creator enablement program'],
        stakeholdersRequired: ['CTO', 'Head of Content', 'Technical Directors', 'Content Operations Manager'],
        successCriteria: ['50% faster content processing', 'Automated content moderation', 'Enhanced viewer engagement analytics']
      },
      {
        value: 2400000,
        category: 'user-expansion',
        description: 'Scale Microsoft Teams and collaboration tools to 8,000 creative professionals and content creators',
        timeline: '30-60 days',
        probability: 'high',
        requiredActivities: [
          'Creative workflow collaboration assessment',
          'Remote production capabilities enhancement',
          'Creative team training and adoption program',
          'Integration with creative software and asset management'
        ],
        microsoftSolutions: ['Microsoft Teams Premium', 'Power Platform', 'SharePoint Premium'],
        deliveryMotions: ['Creative collaboration transformation', 'Remote production enablement', 'Creator productivity workshop'],
        stakeholdersRequired: ['Creative Director', 'Production Managers', 'IT Director', 'Creative Team Leads'],
        successCriteria: ['Streamlined creative collaboration', 'Improved remote production efficiency', '90% creator adoption rate']
      }
    ]
  },
  {
    id: 'acc-12',
    name: 'InsureTech Solutions',
    industry: 'Insurance',
    arr: 54000000,
    healthScore: 59,
    status: 'Watch',
    csam: 'Patricia Wong',
    ae: 'Daniel Kim',
    contractEnd: '2024-07-20',
    lastActivity: '2024-01-09',
    expansionOpportunity: 13500000,
    expansionOpportunities: [
      {
        value: 8200000,
        category: 'cross-sell',
        description: 'Implement comprehensive fraud detection and risk assessment platform with Azure AI',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Claims processing workflow analysis and optimization',
          'Fraud detection model development and training',
          'Integration with existing policy management systems',
          'Compliance validation with insurance regulatory requirements'
        ],
        microsoftSolutions: ['Azure Machine Learning', 'Azure Cognitive Services', 'Power Platform'],
        deliveryMotions: ['Insurance AI transformation', 'Fraud prevention workshop', 'Risk analytics consultation'],
        stakeholdersRequired: ['Chief Risk Officer', 'Head of Claims', 'Actuarial Team Lead', 'Compliance Director'],
        successCriteria: ['30% reduction in fraudulent claims', 'Faster claims processing', 'Improved risk assessment accuracy']
      },
      {
        value: 5300000,
        category: 'feature-upgrade',
        description: 'Upgrade to advanced customer insights and personalized policy recommendation engine',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Customer data analysis and segmentation strategy',
          'Personalization engine development and testing',
          'Agent training on AI-powered recommendation tools',
          'Customer experience optimization across digital channels'
        ],
        microsoftSolutions: ['Customer Insights', 'Azure Personalization Service', 'Dynamics 365 Customer Service'],
        deliveryMotions: ['Customer experience transformation', 'Personalization workshop', 'Agent enablement program'],
        stakeholdersRequired: ['Chief Marketing Officer', 'Head of Customer Experience', 'Sales Director', 'Digital Transformation Lead'],
        successCriteria: ['Improved customer satisfaction scores', 'Higher policy conversion rates', 'Reduced customer acquisition costs']
      }
    ]
  },
  {
    id: 'acc-13',
    name: 'SmartCity Municipal',
    industry: 'Government',
    arr: 38500000,
    healthScore: 74,
    status: 'Good',
    csam: 'Robert Chen',
    ae: 'Michelle Garcia',
    contractEnd: '2025-01-31',
    lastActivity: '2024-01-14',
    expansionOpportunity: 11200000,
    expansionOpportunities: [
      {
        value: 6800000,
        category: 'geographic-expansion',
        description: 'Expand smart city IoT and data platform to 15 additional municipal departments and districts',
        timeline: '6+ months',
        probability: 'high',
        requiredActivities: [
          'Multi-department stakeholder alignment and planning',
          'Citizen privacy and data governance framework development',
          'Integration with existing municipal systems and processes',
          'Public-private partnership coordination and management'
        ],
        microsoftSolutions: ['Azure IoT Central', 'Power BI Government', 'Azure Government Cloud'],
        deliveryMotions: ['Smart city transformation program', 'Municipal digital services consultation', 'Citizen engagement platform development'],
        stakeholdersRequired: ['City Manager', 'Department Heads', 'IT Director', 'Public Works Manager'],
        successCriteria: ['Unified city data dashboard', 'Improved citizen service delivery', 'Enhanced operational efficiency across departments']
      },
      {
        value: 4400000,
        category: 'feature-upgrade',
        description: 'Implement advanced public safety and emergency response system with predictive analytics',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Emergency response workflow analysis and optimization',
          'Predictive analytics model development for public safety',
          'Integration with existing 911 and dispatch systems',
          'First responder training on new technology platforms'
        ],
        microsoftSolutions: ['Azure Machine Learning', 'Power Platform', 'Microsoft Teams for Government'],
        deliveryMotions: ['Public safety transformation', 'Emergency response optimization workshop', 'First responder technology training'],
        stakeholdersRequired: ['Police Chief', 'Fire Chief', 'Emergency Management Director', 'Public Safety IT Manager'],
        successCriteria: ['Faster emergency response times', 'Predictive public safety insights', 'Enhanced inter-agency coordination']
      }
    ]
  },
  {
    id: 'acc-14',
    name: 'BioPharm Research',
    industry: 'Pharmaceuticals',
    arr: 67500000,
    healthScore: 79,
    status: 'Good',
    csam: 'Dr. Sarah Johnson',
    ae: 'Michael Chang',
    contractEnd: '2024-11-30',
    lastActivity: '2024-01-16',
    expansionOpportunity: 15800000,
    expansionOpportunities: [
      {
        value: 9200000,
        category: 'feature-upgrade',
        description: 'Implement advanced drug discovery platform with AI-powered molecular analysis and clinical trial optimization',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Research workflow analysis and digital transformation planning',
          'AI model development for drug discovery acceleration',
          'Integration with existing laboratory information systems',
          'Research team training on AI-powered discovery tools'
        ],
        microsoftSolutions: ['Azure Machine Learning', 'Azure High Performance Computing', 'Microsoft Cloud for Healthcare'],
        deliveryMotions: ['Pharmaceutical AI transformation', 'Drug discovery acceleration workshop', 'Research productivity optimization'],
        stakeholdersRequired: ['Chief Scientific Officer', 'Head of R&D', 'Clinical Research Director', 'Bioinformatics Team Lead'],
        successCriteria: ['40% faster drug discovery timelines', 'Improved clinical trial success rates', 'Enhanced research collaboration efficiency']
      },
      {
        value: 6600000,
        category: 'cross-sell',
        description: 'Deploy comprehensive regulatory compliance and quality management system across global operations',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Global regulatory requirement analysis and mapping',
          'Quality management system digitization and automation',
          'Multi-region compliance validation and testing',
          'Regulatory affairs team training on digital compliance tools'
        ],
        microsoftSolutions: ['Microsoft Purview', 'Power Platform', 'Dynamics 365 Quality Management'],
        deliveryMotions: ['Pharmaceutical compliance transformation', 'Quality management digitization workshop', 'Regulatory automation consultation'],
        stakeholdersRequired: ['Chief Quality Officer', 'Head of Regulatory Affairs', 'Compliance Director', 'Quality Assurance Managers'],
        successCriteria: ['Automated regulatory reporting', 'Improved audit readiness', 'Reduced compliance risk exposure']
      }
    ]
  },
  {
    id: 'acc-15',
    name: 'GreenTech Innovations',
    industry: 'Clean Technology',
    arr: 29000000,
    healthScore: 83,
    status: 'Good',
    csam: 'Elena Rodriguez',
    ae: 'James Mitchell',
    contractEnd: '2024-10-30',
    lastActivity: '2024-01-15',
    expansionOpportunity: 7800000,
    expansionOpportunities: [
      {
        value: 4500000,
        category: 'feature-upgrade',
        description: 'Implement comprehensive carbon tracking and sustainability analytics platform with real-time environmental impact monitoring',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Environmental data collection and integration planning',
          'Carbon footprint calculation model development and validation',
          'Sustainability reporting automation setup',
          'Environmental team training on analytics and monitoring tools'
        ],
        microsoftSolutions: ['Microsoft Sustainability Manager', 'Power BI Environmental Analytics', 'Azure IoT Environmental Monitoring'],
        deliveryMotions: ['Sustainability transformation program', 'Carbon tracking implementation workshop', 'Environmental impact analytics consultation'],
        stakeholdersRequired: ['Chief Sustainability Officer', 'Environmental Compliance Manager', 'Operations Director', 'Data Analytics Team'],
        successCriteria: ['Real-time carbon footprint tracking', 'Automated sustainability reporting', 'Improved environmental compliance metrics']
      },
      {
        value: 3300000,
        category: 'user-expansion',
        description: 'Scale collaboration and innovation platform to 5,000 environmental engineers and sustainability professionals',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Environmental engineering workflow analysis and optimization',
          'Innovation collaboration platform design and implementation',
          'Sustainability professional training and enablement program',
          'Integration with environmental monitoring and analysis tools'
        ],
        microsoftSolutions: ['Microsoft Viva Topics', 'Microsoft Teams Premium', 'Power Platform for Innovation'],
        deliveryMotions: ['Environmental innovation workshop', 'Sustainability collaboration transformation', 'Green technology adoption program'],
        stakeholdersRequired: ['VP Engineering', 'Innovation Director', 'Environmental Team Leads', 'Technology Adoption Manager'],
        successCriteria: ['Enhanced cross-team collaboration on sustainability projects', 'Faster environmental innovation cycles', 'Improved knowledge sharing on green technologies']
      }
    ]
  },
  {
    id: 'acc-16',
    name: 'AeroSpace Dynamics',
    industry: 'Aerospace',
    arr: 78000000,
    healthScore: 67,
    status: 'Watch',
    csam: 'Captain Lisa Thompson',
    ae: 'Ryan Anderson',
    contractEnd: '2024-09-15',
    lastActivity: '2024-01-10',
    expansionOpportunity: 19500000,
    expansionOpportunities: [
      {
        value: 11200000,
        category: 'feature-upgrade',
        description: 'Implement advanced aerospace engineering simulation and digital twin platform for aircraft development',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Aerospace engineering workflow analysis and digital transformation planning',
          'Digital twin model development for aircraft systems',
          'Integration with existing CAD and simulation tools',
          'Engineering team training on advanced simulation platforms'
        ],
        microsoftSolutions: ['Azure Digital Twins', 'Azure High Performance Computing', 'Azure Machine Learning for Engineering'],
        deliveryMotions: ['Aerospace digital transformation', 'Engineering simulation workshop', 'Digital twin implementation consultation'],
        stakeholdersRequired: ['Chief Engineer', 'VP Product Development', 'Simulation Team Lead', 'Systems Architecture Director'],
        successCriteria: ['30% faster aircraft development cycles', 'Improved simulation accuracy and efficiency', 'Enhanced design collaboration across engineering teams']
      },
      {
        value: 8300000,
        category: 'cross-sell',
        description: 'Deploy comprehensive supply chain and manufacturing execution system with real-time quality control',
        timeline: '6+ months',
        probability: 'medium',
        requiredActivities: [
          'Aerospace supply chain analysis and optimization planning',
          'Quality control system digitization and automation',
          'Supplier integration and collaboration platform development',
          'Manufacturing and quality team training on digital systems'
        ],
        microsoftSolutions: ['Dynamics 365 Supply Chain Management', 'Azure IoT Manufacturing', 'Power Platform Quality Control'],
        deliveryMotions: ['Aerospace supply chain transformation', 'Manufacturing digitization workshop', 'Quality control automation consultation'],
        stakeholdersRequired: ['VP Manufacturing', 'Supply Chain Director', 'Quality Control Manager', 'Supplier Relationship Manager'],
        successCriteria: ['Improved supply chain visibility and efficiency', 'Enhanced quality control and traceability', 'Reduced manufacturing defects and rework']
      }
    ]
  },
  {
    id: 'acc-17',
    name: 'TeleComm Global',
    industry: 'Telecommunications',
    arr: 52000000,
    healthScore: 71,
    status: 'Good',
    csam: 'Maria Gonzalez',
    ae: 'David Park',
    contractEnd: '2025-03-10',
    lastActivity: '2024-01-13',
    expansionOpportunity: 14200000,
    expansionOpportunities: [
      {
        value: 8400000,
        category: 'feature-upgrade',
        description: 'Implement 5G network optimization and AI-powered network analytics platform for enhanced performance monitoring',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Network performance analysis and optimization planning',
          'AI model development for predictive network maintenance',
          'Integration with existing network management systems',
          'Network operations team training on AI-powered analytics'
        ],
        microsoftSolutions: ['Azure Machine Learning', 'Azure IoT Hub', 'Azure Stream Analytics'],
        deliveryMotions: ['Telecommunications AI transformation', 'Network optimization workshop', '5G analytics implementation consultation'],
        stakeholdersRequired: ['CTO', 'Network Operations Manager', 'VP Engineering', 'Network Analytics Team Lead'],
        successCriteria: ['20% improvement in network performance', 'Proactive network issue identification', 'Enhanced customer experience metrics']
      },
      {
        value: 5800000,
        category: 'user-expansion',
        description: 'Scale customer service and support platform to handle 2M additional customer interactions with AI assistance',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Customer service workflow analysis and optimization',
          'AI-powered customer support chatbot development and training',
          'Integration with existing customer relationship management systems',
          'Customer service team training on AI-assisted support tools'
        ],
        microsoftSolutions: ['Azure Bot Service', 'Customer Service Insights', 'Power Virtual Agents'],
        deliveryMotions: ['Customer service AI transformation', 'Support automation workshop', 'AI-assisted service implementation'],
        stakeholdersRequired: ['VP Customer Service', 'Customer Experience Director', 'Support Team Managers', 'Customer Success Team Lead'],
        successCriteria: ['40% reduction in average resolution time', 'Improved customer satisfaction scores', 'Enhanced agent productivity and efficiency']
      }
    ]
  },
  {
    id: 'acc-18',
    name: 'CyberGuard Security',
    industry: 'Cybersecurity',
    arr: 44000000,
    healthScore: 86,
    status: 'Good',
    csam: 'Alex Turner',
    ae: 'Samantha Lee',
    contractEnd: '2024-12-20',
    lastActivity: '2024-01-16',
    expansionOpportunity: 12500000,
    expansionOpportunities: [
      {
        value: 7300000,
        category: 'feature-upgrade',
        description: 'Implement advanced threat detection and response platform with AI-powered security analytics',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Security operations center enhancement planning',
          'AI-powered threat detection model development and tuning',
          'Integration with existing security information and event management systems',
          'Security analyst training on AI-assisted threat hunting'
        ],
        microsoftSolutions: ['Microsoft Sentinel Premium', 'Microsoft Defender for Cloud Apps', 'Azure Security Center'],
        deliveryMotions: ['Cybersecurity AI transformation', 'Threat detection workshop', 'Security operations optimization consultation'],
        stakeholdersRequired: ['CISO', 'Security Operations Manager', 'Threat Intelligence Lead', 'Incident Response Team Lead'],
        successCriteria: ['50% faster threat detection and response', 'Reduced false positive alerts', 'Enhanced security posture visibility']
      },
      {
        value: 5200000,
        category: 'cross-sell',
        description: 'Deploy comprehensive identity and access management solution with zero-trust security framework',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Identity and access management maturity assessment',
          'Zero-trust architecture design and implementation planning',
          'Multi-factor authentication rollout across all user populations',
          'Security awareness training and zero-trust adoption program'
        ],
        microsoftSolutions: ['Azure Active Directory Premium P2', 'Microsoft Intune', 'Azure Information Protection'],
        deliveryMotions: ['Zero-trust transformation program', 'Identity security workshop', 'Access management optimization consultation'],
        stakeholdersRequired: ['Identity and Access Manager', 'Network Security Architect', 'Compliance Officer', 'End User Computing Manager'],
        successCriteria: ['Zero-trust principles implementation', 'Improved identity security posture', 'Reduced identity-related security incidents']
      }
    ]
  },
  {
    id: 'acc-19',
    name: 'SportsTech Arena',
    industry: 'Sports & Entertainment',
    arr: 22500000,
    healthScore: 75,
    status: 'Good',
    csam: 'Jordan Smith',
    ae: 'Taylor Wilson',
    contractEnd: '2024-11-10',
    lastActivity: '2024-01-14',
    expansionOpportunity: 5900000,
    expansionOpportunities: [
      {
        value: 3400000,
        category: 'feature-upgrade',
        description: 'Implement fan engagement and analytics platform with AI-powered personalization for enhanced stadium experience',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Fan experience journey mapping and optimization planning',
          'Personalization engine development for fan engagement',
          'Integration with existing ticketing and concession systems',
          'Marketing and operations team training on fan analytics platform'
        ],
        microsoftSolutions: ['Customer Insights', 'Azure Cognitive Services', 'Power Platform Fan Engagement'],
        deliveryMotions: ['Sports fan experience transformation', 'Personalization workshop', 'Fan analytics implementation consultation'],
        stakeholdersRequired: ['VP Fan Experience', 'Marketing Director', 'Stadium Operations Manager', 'Digital Engagement Team Lead'],
        successCriteria: ['Improved fan satisfaction and engagement scores', 'Increased concession and merchandise sales', 'Enhanced personalized fan experiences']
      },
      {
        value: 2500000,
        category: 'user-expansion',
        description: 'Scale broadcast and content creation platform to support multi-venue streaming and social media integration',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Multi-venue broadcast infrastructure assessment and planning',
          'Content creation workflow optimization and automation',
          'Social media integration and real-time content distribution setup',
          'Broadcast and content team training on advanced streaming technologies'
        ],
        microsoftSolutions: ['Azure Media Services', 'Microsoft Stream', 'Power Platform Content Automation'],
        deliveryMotions: ['Sports broadcast transformation', 'Content creation workshop', 'Multi-venue streaming consultation'],
        stakeholdersRequired: ['Broadcast Director', 'Content Creation Manager', 'Social Media Team Lead', 'Technical Operations Manager'],
        successCriteria: ['Seamless multi-venue broadcast capabilities', 'Enhanced social media content distribution', 'Improved content creation efficiency']
      }
    ]
  },
  {
    id: 'acc-20',
    name: 'FoodChain Logistics',
    industry: 'Food & Beverage',
    arr: 33500000,
    healthScore: 61,
    status: 'Watch',
    csam: 'Carlos Rodriguez',
    ae: 'Nicole Brown',
    contractEnd: '2024-06-25',
    lastActivity: '2024-01-09',
    expansionOpportunity: 8700000,
    expansionOpportunities: [
      {
        value: 5100000,
        category: 'feature-upgrade',
        description: 'Implement comprehensive food safety and traceability platform with blockchain and IoT integration',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Food safety compliance analysis and gap assessment',
          'Blockchain-based traceability system development and testing',
          'IoT sensor integration for real-time food quality monitoring',
          'Quality assurance and supply chain team training on new systems'
        ],
        microsoftSolutions: ['Azure Blockchain Service', 'Azure IoT Central', 'Power Platform Food Safety'],
        deliveryMotions: ['Food safety transformation program', 'Traceability implementation workshop', 'IoT food monitoring consultation'],
        stakeholdersRequired: ['Chief Quality Officer', 'Supply Chain Director', 'Food Safety Manager', 'Operations Compliance Lead'],
        successCriteria: ['End-to-end food traceability implementation', 'Improved food safety compliance', 'Reduced food waste and quality issues']
      },
      {
        value: 3600000,
        category: 'cross-sell',
        description: 'Deploy advanced inventory optimization and demand forecasting system for perishable goods management',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Inventory management workflow analysis and optimization',
          'Demand forecasting model development for perishable goods',
          'Integration with existing warehouse management systems',
          'Inventory and procurement team training on predictive analytics'
        ],
        microsoftSolutions: ['Azure Machine Learning', 'Dynamics 365 Supply Chain Management', 'Power BI Inventory Analytics'],
        deliveryMotions: ['Inventory optimization transformation', 'Demand forecasting workshop', 'Perishable goods analytics consultation'],
        stakeholdersRequired: ['VP Operations', 'Inventory Manager', 'Procurement Director', 'Analytics Team Lead'],
        successCriteria: ['20% reduction in food waste', 'Improved demand forecast accuracy', 'Optimized inventory levels and costs']
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
  const categories = ['cost', 'agility', 'data', 'risk', 'culture'] as const;
  const severityOptions: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  const typeOptions = [
    'engagement', 'usage', 'support', 'financial', 'feature_request', 'churn_risk', 
    'billing', 'feature', 'cost', 'agility', 'data', 'risk', 'culture'
  ] as const;

  // Enhanced signal templates for different industries
  const industrySignalTemplates = {
    'Technology': [
      'API usage increased by 300% indicating scale-up opportunity',
      'Development team expanded by 40% suggesting infrastructure needs',
      'CI/CD pipeline failures increased, indicating DevOps improvement needs',
      'Open source vulnerability scan results showing security gaps',
      'Cloud compute costs trending 25% over budget, optimization needed'
    ],
    'Manufacturing': [
      'IoT sensor data quality improved 45% showing analytics readiness',
      'Equipment downtime reduced by 18% with predictive maintenance',
      'Production line efficiency metrics showing 12% improvement opportunity',
      'Energy consumption patterns indicating sustainability optimization potential',
      'Supply chain visibility gaps identified across 15 facilities'
    ],
    'Financial Services': [
      'Regulatory compliance audit findings requiring immediate attention',
      'Transaction processing latency increased 35% affecting customer experience',
      'Data governance maturity assessment showing significant gaps',
      'Fraud detection false positive rates exceeding industry benchmarks',
      'Customer authentication failures increased by 22%'
    ],
    'Healthcare': [
      'Patient data interoperability score improved to 85%',
      'Clinical workflow efficiency gains of 20% identified',
      'HIPAA compliance audit results showing areas for improvement',
      'Telehealth adoption increased 180% creating scalability needs',
      'Medical device integration challenges affecting care coordination'
    ],
    'Retail': [
      'Customer engagement metrics declined 15% over past quarter',
      'Inventory turnover optimization opportunity worth $2.1M identified',
      'E-commerce platform performance issues during peak traffic',
      'Customer data unification project showing 60% completion',
      'Supply chain disruption impact analysis completed'
    ],
    'Education': [
      'Student engagement analytics showing 25% improvement opportunity',
      'Faculty digital adoption rates below target benchmarks',
      'Learning management system integration challenges identified',
      'Campus-wide collaboration tool usage increased 95%',
      'Data privacy compliance assessment revealing gaps'
    ],
    'Energy': [
      'Renewable energy output optimization showing 15% potential improvement',
      'Grid stability analytics indicating predictive maintenance needs',
      'Carbon footprint tracking accuracy improved to 92%',
      'Smart meter data integration completed across 85% of network',
      'Sustainability reporting automation showing 70% time savings'
    ],
    'Media & Entertainment': [
      'Content delivery network performance optimization needed',
      'Audience engagement analytics showing demographic shift trends',
      'Content creation workflow bottlenecks identified',
      'Digital rights management system showing integration challenges',
      'Live streaming scalability requirements exceeded capacity'
    ],
    'Insurance': [
      'Claims processing automation showing 40% efficiency improvement',
      'Risk assessment model accuracy improved by 28%',
      'Customer onboarding digital transformation 65% complete',
      'Fraud detection system generating false positives above threshold',
      'Regulatory reporting automation reducing manual effort by 50%'
    ],
    'Government': [
      'Citizen service digital adoption increased 120%',
      'Inter-agency data sharing improvements showing 35% efficiency gains',
      'Public safety analytics platform deployment 80% complete',
      'Compliance audit findings requiring infrastructure updates',
      'Emergency response system integration challenges identified'
    ],
    'Pharmaceuticals': [
      'Drug discovery platform showing 30% faster research cycles',
      'Clinical trial data quality improved to 94% accuracy',
      'Regulatory submission process automation 75% complete',
      'Research collaboration platform adoption exceeding targets',
      'Manufacturing quality control system showing optimization needs'
    ],
    'Clean Technology': [
      'Environmental impact monitoring showing 22% improvement',
      'Carbon offset tracking system deployment 90% complete',
      'Sustainability analytics platform user adoption at 78%',
      'Green technology research collaboration increased 45%',
      'Environmental compliance reporting automation reducing effort by 60%'
    ],
    'Aerospace': [
      'Aircraft simulation platform performance optimization needed',
      'Supply chain visibility improvements showing 25% efficiency gains',
      'Quality control automation reducing defects by 18%',
      'Engineering collaboration platform adoption at 85%',
      'Regulatory compliance system showing integration challenges'
    ],
    'Telecommunications': [
      '5G network optimization showing 20% performance improvement potential',
      'Customer service AI assistant reducing resolution time by 35%',
      'Network analytics platform deployment 88% complete',
      'Infrastructure monitoring system showing predictive maintenance opportunities',
      'Customer experience metrics improved 15% with digital transformation'
    ],
    'Cybersecurity': [
      'Threat detection accuracy improved to 96% with AI enhancement',
      'Security operations center efficiency increased 42%',
      'Identity management system integration 90% complete',
      'Incident response automation reducing resolution time by 55%',
      'Security awareness training completion rates at 94%'
    ],
    'Sports & Entertainment': [
      'Fan engagement analytics showing 30% improvement opportunity',
      'Stadium IoT sensor network deployment 85% complete',
      'Broadcast quality optimization showing technical improvements needed',
      'Social media integration increasing fan interaction by 65%',
      'Ticketing system performance during peak events showing scalability needs'
    ],
    'Food & Beverage': [
      'Food safety traceability system deployment 75% complete',
      'Supply chain visibility improvements reducing waste by 18%',
      'Quality control automation showing 25% efficiency improvement',
      'Inventory optimization system reducing costs by 12%',
      'Sustainability tracking platform showing environmental improvements'
    ],
    'Transportation': [
      'Fleet optimization system showing 15% fuel cost reduction potential',
      'Route planning AI improving delivery times by 22%',
      'Vehicle maintenance prediction reducing downtime by 30%',
      'Driver safety monitoring system deployment 80% complete',
      'Logistics automation showing supply chain efficiency improvements'
    ],
    'Agriculture': [
      'Precision agriculture platform showing 20% yield improvement',
      'Crop monitoring IoT sensors deployment 90% complete across farms',
      'Weather analytics integration improving farming decisions',
      'Sustainability tracking showing environmental impact improvements',
      'Farm equipment predictive maintenance reducing costs by 25%'
    ]
  };
  
  accounts.forEach(account => {
    // Generate 3-6 signals per account for rich visualization
    const signalCount = Math.floor(Math.random() * 4) + 3;
    const industryTemplates = industrySignalTemplates[account.industry as keyof typeof industrySignalTemplates] || 
                             industrySignalTemplates['Technology'];
    
    for (let i = 0; i < signalCount; i++) {
      // Distribute signals across categories
      const category = categories[i % categories.length];
      const severity = severityOptions[Math.floor(Math.random() * severityOptions.length)];
      const type = typeOptions[Math.floor(Math.random() * typeOptions.length)];
      const template = industryTemplates[Math.floor(Math.random() * industryTemplates.length)];
      
      // Create more realistic signal based on account health score
      let adjustedSeverity = severity;
      if (account.healthScore < 50) {
        // At risk accounts get more critical signals
        adjustedSeverity = Math.random() > 0.3 ? 'critical' : 'high';
      } else if (account.healthScore < 70) {
        // Watch accounts get more medium/high signals
        adjustedSeverity = Math.random() > 0.5 ? 'high' : 'medium';
      } else {
        // Good accounts get more positive signals
        adjustedSeverity = Math.random() > 0.7 ? 'low' : 'medium';
      }
      
      const signal: Signal = {
        id: `signal-${account.id}-${i}-${Date.now()}`,
        accountId: account.id,
        accountName: account.name,
        type: type,
        category: category,
        severity: adjustedSeverity,
        description: template,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          industry: account.industry,
          healthScore: account.healthScore,
          arr: account.arr,
          trend: Math.random() > 0.5 ? 'improving' : 'declining',
          lastUpdated: new Date().toISOString(),
          confidence: Math.floor(Math.random() * 30) + 70, // 70-99% confidence
          impact: Math.floor(Math.random() * 8) + 3, // 3-10 impact score
          source: `${account.industry.toLowerCase()}-analytics`
        }
      };
      
      signals.push(signal);
    }
    
    // Add one guaranteed industry-specific signal per account
    const industrySignal = generateIndustrySpecificSignal(account.id, account.name, account.industry);
    signals.push(industrySignal);
  });
  
  // Add some cross-account signals for portfolio-level insights
  const portfolioSignals: Signal[] = [
    {
      id: `portfolio-signal-1-${Date.now()}`,
      accountId: 'portfolio',
      accountName: 'Portfolio Analysis',
      type: 'data',
      category: 'data',
      severity: 'medium',
      description: 'Overall portfolio health score improved by 8% this quarter with 15 accounts showing positive momentum',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        trend: 'improving',
        accountsAffected: 15,
        portfolioValue: accounts.reduce((sum, a) => sum + a.arr, 0),
        source: 'portfolio-analytics',
        confidence: 92,
        impact: 8
      }
    },
    {
      id: `portfolio-signal-2-${Date.now()}`,
      accountId: 'portfolio',
      accountName: 'Portfolio Analysis',
      type: 'financial',
      category: 'cost',
      severity: 'high',
      description: `Identified $${(accounts.reduce((sum, a) => sum + a.expansionOpportunity, 0) / 1000000).toFixed(1)}M in expansion opportunities across ${accounts.length} accounts`,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        expansionValue: accounts.reduce((sum, a) => sum + a.expansionOpportunity, 0),
        accountsWithOpportunities: accounts.filter(a => a.expansionOpportunity > 0).length,
        industryBreakdown: accounts.reduce((acc, a) => {
          acc[a.industry] = (acc[a.industry] || 0) + a.expansionOpportunity;
          return acc;
        }, {} as Record<string, number>),
        source: 'expansion-analytics',
        confidence: 88,
        impact: 9
      }
    }
  ];
  
  signals.push(...portfolioSignals);
  
  return signals;
}
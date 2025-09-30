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
  },
  {
    id: 'acc-21',
    name: 'RealEstate PropTech',
    industry: 'Real Estate',
    arr: 27000000,
    healthScore: 69,
    status: 'Watch',
    csam: 'Amanda Foster',
    ae: 'Marcus Johnson',
    contractEnd: '2024-07-15',
    lastActivity: '2024-01-11',
    expansionOpportunity: 6800000,
    expansionOpportunities: [
      {
        value: 4100000,
        category: 'feature-upgrade',
        description: 'Implement AI-powered property valuation and market analytics platform with predictive insights',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Property valuation model development and validation',
          'Market analytics integration with existing CRM systems',
          'Real estate agent training on AI-powered insights',
          'Regulatory compliance validation for automated valuations'
        ],
        microsoftSolutions: ['Azure Machine Learning', 'Power BI Real Estate Analytics', 'Dynamics 365 Sales'],
        deliveryMotions: ['PropTech AI transformation', 'Real estate analytics workshop', 'Valuation automation consultation'],
        stakeholdersRequired: ['Chief Technology Officer', 'VP Sales', 'Market Research Director', 'Compliance Manager'],
        successCriteria: ['Improved valuation accuracy by 35%', 'Faster property analysis turnaround', 'Enhanced market trend predictions']
      },
      {
        value: 2700000,
        category: 'user-expansion',
        description: 'Scale collaboration platform to 3,500 real estate agents and property managers across multiple regions',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Agent workflow analysis and optimization',
          'Mobile-first platform deployment for field work',
          'Client communication enhancement and automation',
          'Regional training and adoption program rollout'
        ],
        microsoftSolutions: ['Microsoft Teams Premium', 'Power Platform Real Estate', 'Dynamics 365 Customer Engagement'],
        deliveryMotions: ['Real estate collaboration transformation', 'Agent productivity workshop', 'Mobile-first adoption program'],
        stakeholdersRequired: ['Regional Managers', 'Agent Development Director', 'Customer Success Manager', 'Training Coordinators'],
        successCriteria: ['95% agent platform adoption', 'Improved client satisfaction scores', 'Enhanced regional coordination']
      }
    ]
  },
  {
    id: 'acc-22',
    name: 'Mining Operations Global',
    industry: 'Mining',
    arr: 65000000,
    healthScore: 56,
    status: 'Watch',
    csam: 'Diego Santos',
    ae: 'Rebecca Thompson',
    contractEnd: '2024-09-20',
    lastActivity: '2024-01-08',
    expansionOpportunity: 16200000,
    expansionOpportunities: [
      {
        value: 9500000,
        category: 'feature-upgrade',
        description: 'Implement autonomous mining equipment monitoring and predictive maintenance platform with IoT integration',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Mining equipment sensor integration and data collection setup',
          'Predictive maintenance model development for heavy machinery',
          'Safety protocol automation and compliance monitoring',
          'Mining operations team training on predictive analytics'
        ],
        microsoftSolutions: ['Azure IoT Central', 'Azure Digital Twins', 'Azure Machine Learning for Industrial'],
        deliveryMotions: ['Mining digitization transformation', 'Predictive maintenance workshop', 'Industrial IoT consultation'],
        stakeholdersRequired: ['Chief Operations Officer', 'Mine Site Managers', 'Equipment Maintenance Director', 'Safety Compliance Officer'],
        successCriteria: ['25% reduction in equipment downtime', 'Improved safety incident reporting', 'Optimized maintenance scheduling']
      },
      {
        value: 6700000,
        category: 'geographic-expansion',
        description: 'Deploy environmental monitoring and sustainability tracking across 12 additional mining sites globally',
        timeline: '6+ months',
        probability: 'high',
        requiredActivities: [
          'Environmental impact assessment and monitoring system design',
          'Regulatory compliance validation across multiple jurisdictions',
          'Local team training on environmental data collection',
          'Automated sustainability reporting implementation'
        ],
        microsoftSolutions: ['Microsoft Sustainability Manager', 'Azure Environmental Monitoring', 'Power BI Mining Analytics'],
        deliveryMotions: ['Mining sustainability program', 'Environmental compliance workshop', 'Multi-site deployment expertise'],
        stakeholdersRequired: ['Environmental Affairs Director', 'Site Environmental Managers', 'Regulatory Compliance Team', 'Sustainability Officer'],
        successCriteria: ['Real-time environmental monitoring across all sites', 'Automated regulatory reporting', 'Improved sustainability metrics']
      }
    ]
  },
  {
    id: 'acc-23',
    name: 'Fashion Forward Retail',
    industry: 'Fashion & Apparel',
    arr: 19500000,
    healthScore: 82,
    status: 'Good',
    csam: 'Sophia Chen',
    ae: 'Alexander Rodriguez',
    contractEnd: '2025-01-20',
    lastActivity: '2024-01-15',
    expansionOpportunity: 5400000,
    expansionOpportunities: [
      {
        value: 3200000,
        category: 'feature-upgrade',
        description: 'Implement AI-powered fashion trend prediction and inventory optimization with customer preference analytics',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Fashion trend analysis model development using social media and sales data',
          'Customer preference analytics integration with existing e-commerce platform',
          'Inventory optimization algorithm implementation',
          'Merchandising team training on AI-driven insights'
        ],
        microsoftSolutions: ['Azure Cognitive Services', 'Customer Insights', 'Azure Machine Learning Fashion'],
        deliveryMotions: ['Fashion AI transformation', 'Trend prediction workshop', 'Retail analytics consultation'],
        stakeholdersRequired: ['Chief Merchandising Officer', 'VP E-commerce', 'Data Analytics Manager', 'Creative Director'],
        successCriteria: ['Improved trend prediction accuracy', '20% reduction in inventory waste', 'Enhanced customer personalization']
      },
      {
        value: 2200000,
        category: 'cross-sell',
        description: 'Deploy omnichannel customer experience platform with AR fitting and virtual styling capabilities',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Virtual fitting room technology integration',
          'Augmented reality styling application development',
          'Customer journey mapping across all touchpoints',
          'Sales associate training on digital styling tools'
        ],
        microsoftSolutions: ['Azure Mixed Reality', 'Dynamics 365 Commerce', 'Power Platform Fashion'],
        deliveryMotions: ['Omnichannel fashion experience', 'AR/VR retail workshop', 'Customer experience transformation'],
        stakeholdersRequired: ['Customer Experience Director', 'Digital Innovation Manager', 'Store Operations Manager', 'Technology Integration Lead'],
        successCriteria: ['Unified customer experience across channels', 'Increased online engagement', 'Higher conversion rates']
      }
    ]
  },
  {
    id: 'acc-24',
    name: 'Maritime Logistics Corp',
    industry: 'Maritime & Shipping',
    arr: 49000000,
    healthScore: 64,
    status: 'Watch',
    csam: 'Captain James Mitchell',
    ae: 'Elena Popov',
    contractEnd: '2024-08-10',
    lastActivity: '2024-01-10',
    expansionOpportunity: 12800000,
    expansionOpportunities: [
      {
        value: 7600000,
        category: 'feature-upgrade',
        description: 'Implement smart vessel monitoring and autonomous navigation assistance with AI-powered route optimization',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Vessel IoT sensor integration and data collection infrastructure',
          'Navigation AI model development and testing',
          'Maritime safety protocol automation and compliance monitoring',
          'Fleet operations team training on autonomous systems'
        ],
        microsoftSolutions: ['Azure IoT Maritime', 'Azure Machine Learning Navigation', 'Azure Maps Maritime'],
        deliveryMotions: ['Maritime digital transformation', 'Smart shipping consultation', 'Navigation AI workshop'],
        stakeholdersRequired: ['Fleet Operations Manager', 'Chief Navigation Officer', 'Maritime Safety Director', 'Technology Integration Team'],
        successCriteria: ['Improved fuel efficiency by 18%', 'Enhanced safety compliance', 'Optimized shipping routes']
      },
      {
        value: 5200000,
        category: 'cross-sell',
        description: 'Deploy comprehensive port operations and cargo tracking platform with blockchain-based documentation',
        timeline: '6+ months',
        probability: 'high',
        requiredActivities: [
          'Port operations workflow analysis and digitization',
          'Blockchain-based shipping documentation system development',
          'Cargo tracking and visibility platform integration',
          'Port authority and customs system integration'
        ],
        microsoftSolutions: ['Azure Blockchain Service', 'Dynamics 365 Supply Chain', 'Power Platform Maritime'],
        deliveryMotions: ['Port digitization program', 'Blockchain shipping workshop', 'Cargo visibility consultation'],
        stakeholdersRequired: ['Port Operations Director', 'Cargo Management Manager', 'Documentation Systems Lead', 'Customs Liaison'],
        successCriteria: ['End-to-end cargo visibility', 'Automated documentation processing', 'Improved port efficiency']
      }
    ]
  },
  {
    id: 'acc-25',
    name: 'Gaming Studios Network',
    industry: 'Gaming & Interactive',
    arr: 34000000,
    healthScore: 77,
    status: 'Good',
    csam: 'Tyler Wilson',
    ae: 'Jessica Wang',
    contractEnd: '2024-12-05',
    lastActivity: '2024-01-14',
    expansionOpportunity: 8900000,
    expansionOpportunities: [
      {
        value: 5300000,
        category: 'feature-upgrade',
        description: 'Implement cloud gaming infrastructure with AI-powered player analytics and dynamic content delivery',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Cloud gaming platform architecture design and implementation',
          'Player behavior analytics and engagement model development',
          'Dynamic content delivery network optimization',
          'Game development team training on cloud-native technologies'
        ],
        microsoftSolutions: ['Azure PlayFab', 'Azure Cognitive Services Gaming', 'Azure Content Delivery Network'],
        deliveryMotions: ['Gaming cloud transformation', 'Player analytics workshop', 'Cloud gaming consultation'],
        stakeholdersRequired: ['CTO', 'Lead Game Developers', 'Player Experience Manager', 'Infrastructure Director'],
        successCriteria: ['Seamless cloud gaming experience', 'Improved player engagement metrics', 'Optimized content delivery performance']
      },
      {
        value: 3600000,
        category: 'user-expansion',
        description: 'Scale collaborative game development platform to 2,000 developers across multiple studio locations',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Game development workflow optimization and collaboration enhancement',
          'Version control and asset management system scalability improvement',
          'Cross-studio communication and project management platform deployment',
          'Developer productivity tools integration and training'
        ],
        microsoftSolutions: ['Azure DevOps Gaming', 'Microsoft Teams for Developers', 'GitHub Enterprise Gaming'],
        deliveryMotions: ['Game development collaboration transformation', 'Developer productivity workshop', 'Multi-studio coordination program'],
        stakeholdersRequired: ['VP Game Development', 'Studio Managers', 'Lead Technical Artists', 'DevOps Engineering Team'],
        successCriteria: ['Improved cross-studio collaboration', 'Faster game development cycles', 'Enhanced asset sharing efficiency']
      }
    ]
  },
  {
    id: 'acc-26',
    name: 'Construction Technologies',
    industry: 'Construction',
    arr: 41000000,
    healthScore: 58,
    status: 'Watch',
    csam: 'Maria Gonzalez',
    ae: 'Brian O\'Connor',
    contractEnd: '2024-06-15',
    lastActivity: '2024-01-07',
    expansionOpportunity: 10500000,
    expansionOpportunities: [
      {
        value: 6200000,
        category: 'feature-upgrade',
        description: 'Implement Building Information Modeling (BIM) and construction project management platform with IoT site monitoring',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'BIM integration with existing project management systems',
          'Construction site IoT sensor deployment and monitoring setup',
          'Project timeline optimization using predictive analytics',
          'Construction team training on digital project management tools'
        ],
        microsoftSolutions: ['Azure Digital Twins Construction', 'Power Platform Project Management', 'Azure IoT Construction'],
        deliveryMotions: ['Construction digitization transformation', 'BIM integration workshop', 'Smart construction consultation'],
        stakeholdersRequired: ['Chief Project Officer', 'Construction Site Managers', 'BIM Specialists', 'Safety Compliance Director'],
        successCriteria: ['Improved project timeline accuracy', 'Enhanced safety monitoring', 'Reduced construction waste']
      },
      {
        value: 4300000,
        category: 'cross-sell',
        description: 'Deploy comprehensive safety management and compliance platform with real-time incident reporting',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Construction safety protocol digitization and automation',
          'Real-time incident reporting and response system implementation',
          'Compliance monitoring and regulatory reporting automation',
          'Safety officer and site supervisor training on digital tools'
        ],
        microsoftSolutions: ['Power Platform Safety', 'Microsoft Compliance Manager Construction', 'Azure IoT Safety Monitoring'],
        deliveryMotions: ['Construction safety transformation', 'Safety compliance workshop', 'Incident management consultation'],
        stakeholdersRequired: ['Chief Safety Officer', 'Site Safety Managers', 'Compliance Team', 'Emergency Response Coordinators'],
        successCriteria: ['Reduced safety incidents', 'Automated compliance reporting', 'Improved emergency response times']
      }
    ]
  },
  {
    id: 'acc-27',
    name: 'Legal Services International',
    industry: 'Legal Services',
    arr: 23500000,
    healthScore: 73,
    status: 'Good',
    csam: 'Jonathan Davis',
    ae: 'Sarah Kim',
    contractEnd: '2024-11-25',
    lastActivity: '2024-01-13',
    expansionOpportunity: 6100000,
    expansionOpportunities: [
      {
        value: 3700000,
        category: 'feature-upgrade',
        description: 'Implement AI-powered legal research and document analysis platform with contract intelligence',
        timeline: '60-90 days',
        probability: 'high',
        requiredActivities: [
          'Legal document AI model training and validation',
          'Contract analysis and risk assessment automation',
          'Legal research platform integration with existing case management',
          'Attorney and paralegal training on AI-powered research tools'
        ],
        microsoftSolutions: ['Azure Cognitive Services Legal', 'Azure AI Document Intelligence', 'Power Platform Legal'],
        deliveryMotions: ['Legal AI transformation', 'Document intelligence workshop', 'Legal research automation consultation'],
        stakeholdersRequired: ['Managing Partner', 'Head of Legal Research', 'Practice Group Leaders', 'Legal Technology Director'],
        successCriteria: ['50% faster legal research', 'Improved contract risk identification', 'Enhanced document analysis accuracy']
      },
      {
        value: 2400000,
        category: 'user-expansion',
        description: 'Scale secure collaboration and client communication platform to 800 attorneys across international offices',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Attorney workflow analysis and collaboration optimization',
          'Client communication security and confidentiality enhancement',
          'International office integration and compliance validation',
          'Legal professional training on secure collaboration tools'
        ],
        microsoftSolutions: ['Microsoft Teams for Legal', 'Azure Information Protection Legal', 'Dynamics 365 Legal'],
        deliveryMotions: ['Legal collaboration transformation', 'Attorney productivity workshop', 'International office integration program'],
        stakeholdersRequired: ['International Office Managing Partners', 'IT Security Director', 'Client Relations Manager', 'Knowledge Management Lead'],
        successCriteria: ['Enhanced attorney collaboration', 'Improved client communication security', 'Streamlined international case coordination']
      }
    ]
  },
  {
    id: 'acc-28',
    name: 'Hospitality Chain Global',
    industry: 'Hospitality & Tourism',
    arr: 36500000,
    healthScore: 66,
    status: 'Watch',
    csam: 'Isabella Martinez',
    ae: 'Christopher Lee',
    contractEnd: '2024-07-30',
    lastActivity: '2024-01-09',
    expansionOpportunity: 9200000,
    expansionOpportunities: [
      {
        value: 5500000,
        category: 'feature-upgrade',
        description: 'Implement guest experience personalization platform with AI-powered recommendations and IoT room automation',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Guest preference analytics and personalization engine development',
          'IoT room automation system integration and deployment',
          'Hotel staff training on guest experience management tools',
          'Integration with existing property management systems'
        ],
        microsoftSolutions: ['Customer Insights Hospitality', 'Azure IoT Hotel Automation', 'Power Platform Guest Services'],
        deliveryMotions: ['Hospitality experience transformation', 'Guest personalization workshop', 'Smart hotel consultation'],
        stakeholdersRequired: ['VP Guest Experience', 'Hotel General Managers', 'IT Operations Director', 'Revenue Management Team'],
        successCriteria: ['Improved guest satisfaction scores', 'Enhanced personalization accuracy', 'Increased revenue per guest']
      },
      {
        value: 3700000,
        category: 'geographic-expansion',
        description: 'Deploy integrated operations and revenue management platform across 50 additional hotel properties',
        timeline: '6+ months',
        probability: 'high',
        requiredActivities: [
          'Multi-property operations standardization and integration',
          'Revenue management optimization across all locations',
          'Staff training and adoption program for new properties',
          'Central reservation system integration and synchronization'
        ],
        microsoftSolutions: ['Dynamics 365 Hospitality', 'Power BI Hotel Analytics', 'Azure Multi-Property Integration'],
        deliveryMotions: ['Hotel chain expansion program', 'Revenue optimization workshop', 'Multi-property management consultation'],
        stakeholdersRequired: ['Regional Operations Managers', 'Revenue Management Director', 'Property Integration Team', 'Training Coordinators'],
        successCriteria: ['Standardized operations across all properties', 'Optimized revenue management', 'Improved operational efficiency']
      }
    ]
  },
  {
    id: 'acc-29',
    name: 'Chemical Processing Solutions',
    industry: 'Chemicals',
    arr: 58000000,
    healthScore: 62,
    status: 'Watch',
    csam: 'Dr. Michael Thompson',
    ae: 'Rachel Adams',
    contractEnd: '2024-08-25',
    lastActivity: '2024-01-08',
    expansionOpportunity: 14600000,
    expansionOpportunities: [
      {
        value: 8700000,
        category: 'feature-upgrade',
        description: 'Implement advanced process optimization and predictive quality control with AI-powered chemical analysis',
        timeline: '90-180 days',
        probability: 'medium',
        requiredActivities: [
          'Chemical process data integration and analytics platform development',
          'Predictive quality control model training and validation',
          'Process optimization algorithm implementation',
          'Process engineering team training on AI-powered analytics'
        ],
        microsoftSolutions: ['Azure Machine Learning Chemical', 'Azure Digital Twins Process', 'Power BI Process Analytics'],
        deliveryMotions: ['Chemical process AI transformation', 'Predictive quality workshop', 'Process optimization consultation'],
        stakeholdersRequired: ['Chief Process Engineer', 'Quality Control Director', 'Plant Operations Managers', 'R&D Team Lead'],
        successCriteria: ['Improved process efficiency by 22%', 'Reduced quality defects', 'Enhanced predictive maintenance']
      },
      {
        value: 5900000,
        category: 'cross-sell',
        description: 'Deploy comprehensive environmental compliance and safety management platform with real-time monitoring',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Environmental monitoring system integration and automation',
          'Safety protocol digitization and incident management',
          'Regulatory compliance reporting automation',
          'Environmental and safety team training on digital monitoring tools'
        ],
        microsoftSolutions: ['Microsoft Sustainability Manager Chemical', 'Azure Environmental Monitoring', 'Power Platform Safety'],
        deliveryMotions: ['Chemical safety transformation', 'Environmental compliance workshop', 'Safety management consultation'],
        stakeholdersRequired: ['Environmental Health & Safety Director', 'Compliance Officer', 'Plant Safety Managers', 'Environmental Monitoring Team'],
        successCriteria: ['Real-time environmental monitoring', 'Automated compliance reporting', 'Improved safety incident management']
      }
    ]
  },
  {
    id: 'acc-30',
    name: 'Space Technology Ventures',
    industry: 'Space & Satellite',
    arr: 72000000,
    healthScore: 84,
    status: 'Good',
    csam: 'Dr. Amanda Chen',
    ae: 'Robert Johnson',
    contractEnd: '2025-02-15',
    lastActivity: '2024-01-16',
    expansionOpportunity: 18500000,
    expansionOpportunities: [
      {
        value: 11200000,
        category: 'feature-upgrade',
        description: 'Implement satellite data analytics and space mission control platform with AI-powered anomaly detection',
        timeline: '90-180 days',
        probability: 'high',
        requiredActivities: [
          'Satellite telemetry data integration and real-time analytics setup',
          'AI anomaly detection model development for space missions',
          'Mission control dashboard and alert system implementation',
          'Flight operations team training on AI-powered mission monitoring'
        ],
        microsoftSolutions: ['Azure Space Analytics', 'Azure Machine Learning Aerospace', 'Azure IoT Space'],
        deliveryMotions: ['Space technology AI transformation', 'Mission control analytics workshop', 'Satellite data consultation'],
        stakeholdersRequired: ['Mission Control Director', 'Satellite Operations Manager', 'Flight Dynamics Team Lead', 'Ground Systems Engineer'],
        successCriteria: ['Enhanced satellite health monitoring', 'Improved mission success rates', 'Faster anomaly detection and response']
      },
      {
        value: 7300000,
        category: 'cross-sell',
        description: 'Deploy comprehensive space project management and collaboration platform for multi-mission coordination',
        timeline: '6+ months',
        probability: 'high',
        requiredActivities: [
          'Multi-mission project coordination and resource optimization',
          'Cross-functional team collaboration enhancement',
          'Space project lifecycle management automation',
          'International space partner collaboration platform integration'
        ],
        microsoftSolutions: ['Azure DevOps Space', 'Microsoft Teams for Space Projects', 'Power Platform Mission Management'],
        deliveryMotions: ['Space project management transformation', 'Multi-mission coordination workshop', 'Space collaboration consultation'],
        stakeholdersRequired: ['VP Space Operations', 'Mission Program Managers', 'International Partnership Director', 'Systems Integration Lead'],
        successCriteria: ['Improved multi-mission coordination', 'Enhanced international collaboration', 'Optimized resource allocation across projects']
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
    setAccounts([...sampleAccounts]); // Create a new array to ensure reactivity
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

  // Helper function to clear and reset signals
  const resetSignals = (newSignals: Signal[]) => {
    setSignals([...newSignals]); // Create a new array to ensure reactivity
  };

  return {
    signals: signals || [],
    setSignals,
    addSignal,
    removeSignal,
    resetSignals
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
    'billing', 'feature', 'cost', 'agility', 'data', 'risk', 'culture',
    'security', 'compliance', 'performance', 'innovation', 'collaboration',
    'training', 'integration', 'scalability', 'sustainability', 'quality',
    'efficiency', 'automation', 'analytics', 'ai_readiness', 'digital_transformation'
  ] as const;

  // Enhanced signal templates for different industries with more variety
  const industrySignalTemplates = {
    'Technology': [
      'API usage surged 450% in Q1 with 2M+ daily requests - immediate scale-up required',
      'Development velocity increased 78% following DevOps automation deployment',
      'Critical security vulnerability detected in 23 microservices - patch deployment urgent',
      'Cloud costs optimized by $180K monthly through AI-powered resource allocation',
      'Machine learning inference latency reduced 67% with edge computing migration',
      'Container orchestration efficiency improved 89% across 15 production clusters',
      'Developer productivity index reached 94% with GitHub Copilot Enterprise adoption',
      'Open source dependency vulnerabilities decreased 85% with automated scanning',
      'Kubernetes cluster utilization optimized from 45% to 91% through right-sizing',
      'Zero-trust security implementation completed across 85% of services',
      'GraphQL API adoption reducing data transfer by 52% and improving performance',
      'Serverless architecture migration showing 73% cost reduction for compute workloads',
      'AI pair programming tools increasing code quality scores by 34%',
      'Database query performance improved 156% with intelligent caching strategies',
      'Continuous deployment frequency increased from daily to 47 releases per day'
    ],
    'Manufacturing': [
      'Predictive maintenance preventing $2.3M in unplanned downtime across 12 facilities',
      'Smart factory deployment achieving 94% OEE (Overall Equipment Effectiveness)',
      'Energy consumption reduced 31% through AI-optimized production scheduling',
      'Quality defects decreased from 2.1% to 0.3% with computer vision inspection',
      'Supply chain disruption risk mitigated through 47 alternative supplier relationships',
      'Digital twin accuracy reached 97% for critical manufacturing processes',
      'Worker safety incidents eliminated for 180+ consecutive days with IoT monitoring',
      'Inventory carrying costs reduced $890K through demand sensing algorithms',
      'Production line changeover time improved from 4.2 hours to 27 minutes',
      'Environmental compliance automated across 23 manufacturing sites globally',
      'Cobots (collaborative robots) increasing production efficiency by 63%',
      'Real-time quality analytics preventing 89% of potential defective products',
      'Additive manufacturing reducing prototype costs by 72% and lead times by 85%',
      'Sustainability tracking showing 28% reduction in carbon footprint year-over-year',
      'Predictive supply chain analytics preventing stockouts 94% of the time'
    ],
    'Financial Services': [
      'Fraud detection accuracy reached 99.2% with $12M in prevented losses this quarter',
      'Digital transformation ROI exceeded projections by 340% through automation',
      'Real-time transaction processing latency reduced from 450ms to 23ms',
      'Customer onboarding time decreased 89% from 5 days to 2.6 hours',
      'Regulatory compliance costs reduced $4.2M annually through automated reporting',
      'AI-powered credit scoring improving loan approval accuracy by 67%',
      'Open banking API adoption increasing customer engagement by 156%',
      'Algorithmic trading strategies outperforming market by 23.7% consistently',
      'Customer authentication success rate improved to 98.9% with biometric integration',
      'Data governance maturity elevated from level 2 to level 4 across all business units',
      'Anti-money laundering detection reducing false positives by 78%',
      'Robo-advisory platform managing $1.8B in assets with 94% client satisfaction',
      'Blockchain settlement reducing transaction costs by 67% for cross-border payments',
      'Predictive analytics identifying churn risk 14 days earlier with 91% accuracy',
      'Regulatory stress testing automated reducing compliance burden by 83%'
    ],
    'Healthcare': [
      'AI-powered diagnostics achieving 96.8% accuracy surpassing radiologist benchmarks',
      'Patient outcomes improved 42% through predictive clinical decision support',
      'Hospital readmission rates reduced 67% with discharge prediction models',
      'Telehealth adoption scaling to 2.8M patient interactions monthly',
      'Drug discovery timeline accelerated 58% through machine learning optimization',
      'Clinical workflow efficiency enhanced 73% with intelligent automation',
      'Patient satisfaction scores increased to 94.2% with personalized care protocols',
      'Medical device interoperability achieved across 97% of hospital systems',
      'Population health analytics identifying preventive interventions 21 days earlier',
      'Electronic health record optimization reducing physician documentation time by 45%',
      'Precision medicine matching increasing treatment success rates by 38%',
      'Remote patient monitoring preventing 234 emergency room visits monthly',
      'Clinical trial enrollment accelerated 156% through AI-powered patient matching',
      'Medical imaging analysis reducing diagnosis time from 2.3 hours to 12 minutes',
      'Healthcare cost per patient reduced $3,400 annually through preventive analytics'
    ],
    'Retail': [
      'Dynamic pricing optimization generating $7.2M additional revenue quarterly',
      'Personalization engine increasing conversion rates 187% across all channels',
      'Inventory turnover improved 145% reducing carrying costs by $3.8M annually',
      'Omnichannel customer experience achieving 97% satisfaction scores',
      'Social commerce integration driving 298% increase in Gen Z engagement',
      'AI-powered demand forecasting accuracy reaching 94.6% for seasonal products',
      'Supply chain visibility preventing 96% of potential stockouts',
      'Customer lifetime value increased 73% through predictive analytics',
      'Sustainable packaging initiatives improving brand perception by 89%',
      'Voice commerce adoption growing 456% with smart assistant integration',
      'Augmented reality try-on features reducing return rates by 62%',
      'Micro-fulfillment centers enabling same-day delivery for 87% of orders',
      'Customer data unification creating 360-degree view across 12M profiles',
      'Loyalty program optimization increasing member engagement by 234%',
      'Real-time inventory synchronization across 340 stores and online channels'
    ],
    'Education': [
      'AI-powered adaptive learning improving student outcomes by 78% across 50K students',
      'Virtual reality education modules increasing engagement scores to 96.4%',
      'Predictive analytics identifying at-risk students 8 weeks earlier with 93% accuracy',
      'Digital collaboration increasing cross-institutional research by 245%',
      'Automated grading and feedback reducing educator workload by 67%',
      'Campus safety enhanced through IoT monitoring preventing 12 incidents monthly',
      'Learning analytics platform supporting personalized education for 125K students',
      'Remote learning infrastructure scaling to support 2.1M concurrent sessions',
      'Student success prediction models improving graduation rates by 34%',
      'Smart campus initiatives reducing energy consumption by 42% annually',
      'Blockchain credentialing system eliminating 99.7% of diploma fraud',
      'AI tutoring systems providing 24/7 personalized support to 89K students',
      'Digital library access increasing research productivity by 156%',
      'Campus-wide WiFi optimization supporting 95K simultaneous device connections',
      'Inclusive education technology improving accessibility scores by 89%'
    ],
    'Energy': [
      'Smart grid optimization increasing renewable energy efficiency by 89% across 200 sites',
      'Predictive maintenance preventing $8.7M in turbine downtime annually',
      'Carbon footprint reduced 67% through AI-optimized energy distribution',
      'Energy storage systems achieving 97.2% efficiency with machine learning controls',
      'Demand forecasting accuracy reaching 96.8% for peak load management',
      'Renewable energy output maximized through weather prediction algorithms',
      'Grid stability enhanced with real-time analytics preventing 45 outages monthly',
      'Energy trading optimization generating $12.3M additional revenue quarterly',
      'Sustainability reporting automated across 340 renewable energy facilities',
      'Smart meter analytics providing insights for 4.7M residential customers',
      'Microgrid deployment enabling 99.9% uptime for critical infrastructure',
      'Battery management systems extending energy storage life by 134%',
      'Power quality monitoring reducing industrial customer complaints by 91%',
      'Green hydrogen production scaled to 500MW with 87% efficiency ratings',
      'Transmission line monitoring preventing failures and saving $23M annually'
    ],
    'Media & Entertainment': [
      'Content personalization algorithms increasing viewer engagement by 312%',
      'AI-powered content creation reducing production costs by $4.8M annually',
      'Real-time streaming optimization supporting 18M concurrent viewers globally',
      '4K content delivery achieving 99.7% uptime with edge computing infrastructure',
      'Audience analytics revealing demographic trends 6 months ahead of competition',
      'Dynamic content monetization increasing ad revenue by 156% year-over-year',
      'Social media integration driving 445% increase in user-generated content',
      'Virtual production studios reducing filming costs by 73% while improving quality',
      'Content rights management preventing $2.1M in revenue leakage monthly',
      'Interactive streaming features increasing viewer session time by 189%',
      'AI-powered subtitle generation supporting 47 languages with 98.9% accuracy',
      'Live event streaming scaling to 25M viewers with zero buffering incidents',
      'Content recommendation engine achieving 91.4% user satisfaction scores',
      'Digital asset management streamlining workflows and saving 340 hours weekly',
      'Predictive content analytics identifying viral trends 72 hours before competitors'
    ],
    'Insurance': [
      'AI fraud detection saving $47M annually with 99.1% accuracy across 2.8M claims',
      'Automated underwriting reducing policy approval time from 14 days to 90 minutes',
      'Predictive risk modeling improving pricing accuracy by 89% across all product lines',
      'Customer self-service portal handling 94% of inquiries without human intervention',
      'Telematics data optimizing auto insurance premiums for 1.2M policyholders',
      'Claims processing automation reducing costs by 67% while improving customer satisfaction',
      'Regulatory compliance monitoring preventing $8.3M in potential fines',
      'Parametric insurance payouts automated using IoT sensors and satellite data',
      'Customer lifetime value optimization increasing retention rates by 78%',
      'Real-time risk assessment enabling instant policy adjustments',
      'Chatbot technology resolving 87% of customer service requests in under 3 minutes',
      'Blockchain-based policy management eliminating 99.2% of documentation errors',
      'Predictive analytics identifying cross-sell opportunities worth $23M quarterly',
      'Digital claims management reducing settlement time by 156% on average',
      'Catastrophe modeling and response coordination saving $67M in disaster claims'
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
    ],
    'Real Estate': [
      'Property valuation accuracy improved 35% with AI analytics',
      'Virtual property tour engagement increased 150%',
      'Market trend prediction model showing 92% accuracy',
      'Agent productivity analytics revealing workflow optimization opportunities',
      'Customer relationship management integration showing 25% efficiency gains'
    ],
    'Mining': [
      'Equipment downtime reduced 25% with predictive maintenance',
      'Environmental compliance monitoring showing 95% accuracy',
      'Safety incident reporting automated across all sites',
      'Resource extraction optimization showing 18% efficiency improvement',
      'Sustainability tracking platform deployment 80% complete'
    ],
    'Fashion & Apparel': [
      'Fashion trend prediction accuracy improved to 87%',
      'Inventory optimization reducing waste by 22%',
      'Customer preference analytics showing personalization opportunities',
      'Supply chain visibility improved across 45 suppliers',
      'Omnichannel customer experience showing 30% engagement increase'
    ],
    'Maritime & Shipping': [
      'Vessel fuel efficiency optimized by 18% with route analytics',
      'Cargo tracking accuracy improved to 99.2%',
      'Port operations efficiency increased 25% with digitization',
      'Maritime safety compliance automated across fleet',
      'Blockchain documentation reducing processing time by 40%'
    ],
    'Gaming & Interactive': [
      'Player engagement analytics showing 35% retention improvement',
      'Cloud gaming infrastructure scaling to support 2M concurrent users',
      'Developer productivity increased 45% with collaboration tools',
      'Game performance analytics revealing optimization opportunities',
      'Content delivery network showing 60% faster load times'
    ],
    'Construction': [
      'Project timeline accuracy improved 30% with BIM integration',
      'Construction safety incidents reduced 40% with IoT monitoring',
      'Resource utilization optimization showing 15% cost savings',
      'Quality control automation reducing defects by 28%',
      'Compliance reporting automated across 85% of projects'
    ],
    'Legal Services': [
      'Legal research efficiency improved 50% with AI assistance',
      'Contract analysis accuracy increased to 94%',
      'Document review time reduced 45% with automation',
      'Client communication security enhanced with compliance protocols',
      'Knowledge management system showing 80% attorney adoption'
    ],
    'Hospitality & Tourism': [
      'Guest satisfaction scores improved 25% with personalization',
      'Revenue optimization showing 18% increase per room',
      'Operational efficiency enhanced 22% across properties',
      'Guest preference analytics revealing upselling opportunities',
      'Multi-property integration reducing management overhead by 30%'
    ],
    'Chemicals': [
      'Process efficiency optimized by 22% with AI analytics',
      'Quality control defects reduced 35% with predictive monitoring',
      'Environmental compliance automated across all facilities',
      'Safety incident management showing 50% faster response times',
      'Predictive maintenance reducing unplanned downtime by 40%'
    ],
    'Space & Satellite': [
      'Satellite health monitoring accuracy improved to 98%',
      'Mission success rate increased 15% with AI anomaly detection',
      'Ground operations efficiency enhanced 35%',
      'Multi-mission coordination showing 25% resource optimization',
      'International collaboration platform adoption at 90%'
    ]
  };
  
  accounts.forEach(account => {
    // Generate 5-8 signals per account for rich visualization (increased from 4-7)
    const signalCount = Math.floor(Math.random() * 4) + 5;
    const industryTemplates = industrySignalTemplates[account.industry as keyof typeof industrySignalTemplates] || 
                             industrySignalTemplates['Technology'];
    
    for (let i = 0; i < signalCount; i++) {
      // Distribute signals across categories more evenly
      const category = categories[i % categories.length];
      const severity = severityOptions[Math.floor(Math.random() * severityOptions.length)];
      const type = typeOptions[Math.floor(Math.random() * typeOptions.length)];
      const template = industryTemplates[Math.floor(Math.random() * industryTemplates.length)];
      
      // Create more dramatic signal variations based on account health score and industry
      let adjustedSeverity = severity;
      let confidenceRange = [70, 99];
      let impactRange = [3, 10];
      
      if (account.healthScore < 50) {
        // At risk accounts get more critical signals with higher impact
        adjustedSeverity = Math.random() > 0.2 ? 'critical' : 'high';
        confidenceRange = [85, 99]; // Higher confidence for critical situations
        impactRange = [7, 10];
      } else if (account.healthScore < 70) {
        // Watch accounts get varied signals with medium-high confidence
        adjustedSeverity = Math.random() > 0.4 ? 'high' : 'medium';
        confidenceRange = [75, 95];
        impactRange = [5, 9];
      } else {
        // Good accounts get more positive signals with opportunities
        adjustedSeverity = Math.random() > 0.5 ? 'medium' : 'low';
        confidenceRange = [80, 97]; // High confidence for positive signals
        impactRange = [4, 8];
      }
      
      // Add industry-specific confidence and impact adjustments
      const highTechIndustries = ['Technology', 'Cybersecurity', 'Space & Satellite'];
      const traditionalIndustries = ['Manufacturing', 'Energy', 'Mining', 'Construction'];
      
      if (highTechIndustries.includes(account.industry)) {
        confidenceRange = [confidenceRange[0] + 5, Math.min(confidenceRange[1] + 5, 99)];
        impactRange = [Math.max(impactRange[0] + 1, 1), Math.min(impactRange[1] + 2, 10)];
      } else if (traditionalIndustries.includes(account.industry)) {
        confidenceRange = [Math.max(confidenceRange[0] - 3, 60), confidenceRange[1]];
        impactRange = [Math.max(impactRange[0] - 1, 1), impactRange[1]];
      }
      
      const confidence = Math.floor(Math.random() * (confidenceRange[1] - confidenceRange[0])) + confidenceRange[0];
      const impact = Math.floor(Math.random() * (impactRange[1] - impactRange[0])) + impactRange[0];
      const signalStrength = Math.floor(Math.random() * 40) + 60; // 60-99% signal strength
      
      const signal: Signal = {
        id: `signal-${account.id}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        accountId: account.id,
        accountName: account.name,
        type: type,
        category: category,
        severity: adjustedSeverity,
        description: template,
        timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(), // Up to 2 weeks ago
        metadata: {
          industry: account.industry,
          healthScore: account.healthScore,
          arr: account.arr,
          trend: Math.random() > 0.3 ? 'improving' : 'declining', // More positive trends
          lastUpdated: new Date().toISOString(),
          confidence: confidence,
          impact: impact,
          source: `${account.industry.toLowerCase().replace(/\s+/g, '-')}-analytics`,
          signalStrength: signalStrength,
          correlationId: `corr-${Math.random().toString(36).substr(2, 9)}`,
          businessImpact: impact >= 7 ? 'high' : impact >= 5 ? 'medium' : 'low',
          urgencyScore: adjustedSeverity === 'critical' ? 95 : adjustedSeverity === 'high' ? 80 : adjustedSeverity === 'medium' ? 60 : 40,
          trendVelocity: Math.random() > 0.6 ? 'accelerating' : Math.random() > 0.3 ? 'stable' : 'decelerating',
          predictiveScore: Math.floor(Math.random() * 30) + 70,
          automationPotential: Math.random() > 0.4 ? 'high' : 'medium'
        }
      };
      
      signals.push(signal);
    }
    
    // Add one guaranteed industry-specific signal per account
    const industrySignal = generateIndustrySpecificSignal(account.id, account.name, account.industry);
    signals.push(industrySignal);
    
    // Add one guaranteed expansion/opportunity signal for accounts with high expansion potential
    if (account.expansionOpportunity > 5000000) {
      const expansionSignal: Signal = {
        id: `expansion-signal-${account.id}-${Date.now()}`,
        accountId: account.id,
        accountName: account.name,
        type: 'financial',
        category: 'cost',
        severity: account.healthScore > 75 ? 'high' : 'critical', // Higher severity for better visibility
        description: `Major expansion opportunity identified worth $${(account.expansionOpportunity / 1000000).toFixed(1)}M based on accelerated usage patterns, stakeholder alignment signals, and digital transformation readiness`,
        timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          industry: account.industry,
          healthScore: account.healthScore,
          arr: account.arr,
          expansionValue: account.expansionOpportunity,
          trend: 'accelerating',
          lastUpdated: new Date().toISOString(),
          confidence: Math.floor(Math.random() * 15) + 85, // 85-99% confidence for expansion signals
          impact: 10, // Maximum impact for expansion opportunities
          source: 'expansion-analytics',
          signalStrength: Math.floor(Math.random() * 15) + 85, // 85-99% for strong signals
          businessImpact: 'high',
          opportunityType: 'expansion',
          urgencyScore: 90,
          trendVelocity: 'accelerating',
          predictiveScore: Math.floor(Math.random() * 20) + 80,
          automationPotential: 'high',
          stakeholderAlignment: Math.random() > 0.7 ? 'excellent' : 'good',
          technicalReadiness: Math.random() > 0.6 ? 'advanced' : 'ready'
        }
      };
      signals.push(expansionSignal);
    }
  });
  
  // Add comprehensive cross-account signals for portfolio-level insights
  const portfolioSignals: Signal[] = [
    {
      id: `portfolio-signal-1-${Date.now()}`,
      accountId: 'portfolio',
      accountName: 'Portfolio Analysis',
      type: 'data',
      category: 'data',
      severity: 'high',
      description: `Portfolio health acceleration: Average health score jumped 23% this quarter with ${Math.floor(accounts.length * 0.85)} accounts showing exponential digital transformation momentum`,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        trend: 'accelerating',
        accountsAffected: Math.floor(accounts.length * 0.85),
        portfolioValue: accounts.reduce((sum, a) => sum + a.arr, 0),
        source: 'portfolio-analytics',
        confidence: 96,
        impact: 9,
        healthScoreIncrease: 23,
        digitalTransformationVelocity: 'exponential',
        industryBreakdown: accounts.reduce((acc, a) => {
          acc[a.industry] = (acc[a.industry] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    },
    {
      id: `portfolio-signal-2-${Date.now()}`,
      accountId: 'portfolio',
      accountName: 'Portfolio Analysis',
      type: 'financial',
      category: 'cost',
      severity: 'critical',
      description: `Massive expansion wave detected: $${(accounts.reduce((sum, a) => sum + a.expansionOpportunity, 0) / 1000000).toFixed(1)}M in qualified opportunities across ${accounts.length} enterprise accounts with 91% AI-readiness confidence`,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        expansionValue: accounts.reduce((sum, a) => sum + a.expansionOpportunity, 0),
        accountsWithOpportunities: accounts.filter(a => a.expansionOpportunity > 0).length,
        aiReadinessScore: 91,
        qualificationRate: 96,
        industryBreakdown: accounts.reduce((acc, a) => {
          acc[a.industry] = (acc[a.industry] || 0) + a.expansionOpportunity;
          return acc;
        }, {} as Record<string, number>),
        source: 'expansion-analytics',
        confidence: 94,
        impact: 10,
        uniqueIndustries: new Set(accounts.map(a => a.industry)).size,
        expansionVelocity: 'unprecedented'
      }
    },
    {
      id: `portfolio-signal-3-${Date.now()}`,
      accountId: 'portfolio',
      accountName: 'Portfolio Analysis',
      type: 'ai_readiness',
      category: 'agility',
      severity: 'high',
      description: `AI transformation breakthrough: 94% of portfolio showing advanced AI adoption with $127M in measured productivity gains across ${accounts.length} diverse enterprises`,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        aiReadinessAccounts: Math.floor(accounts.length * 0.94),
        totalAccounts: accounts.length,
        productivityGains: 127000000,
        digitalizationTrend: 'breakthrough',
        source: 'ai-adoption-analytics',
        confidence: 92,
        impact: 9,
        aiMaturityLevel: 'advanced',
        technologiesInDemand: ['Azure OpenAI Service', 'Azure Machine Learning', 'Power Platform AI', 'Azure Cognitive Services'],
        innovationIndex: 89
      }
    },
    {
      id: `portfolio-signal-4-${Date.now()}`,
      accountId: 'portfolio',
      accountName: 'Portfolio Analysis',
      type: 'sustainability',
      category: 'risk',
      severity: 'medium',
      description: `Sustainability leadership emerging: ${Math.floor(accounts.length * 0.89)}% of portfolio achieving carbon neutrality targets 18 months ahead of schedule with $89M in cost savings`,
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        sustainabilityAccounts: Math.floor(accounts.length * 0.89),
        carbonNeutralityProgress: 'ahead-of-schedule',
        costSavings: 89000000,
        timelineAcceleration: 18,
        esgCompliance: 'leading',
        source: 'sustainability-analytics',
        confidence: 87,
        impact: 8,
        carbonReduction: 67,
        greenTechOpportunities: accounts.filter(a => 
          ['Energy', 'Clean Technology', 'Manufacturing', 'Transportation', 'Chemicals'].includes(a.industry)
        ).length,
        sustainabilityROI: 245
      }
    },
    {
      id: `portfolio-signal-5-${Date.now()}`,
      accountId: 'portfolio',
      accountName: 'Portfolio Analysis',
      type: 'innovation',
      category: 'culture',
      severity: 'high',
      description: `Innovation velocity surge: R&D productivity increased 167% across portfolio with 43 breakthrough patents filed and $234M in new product revenue generated`,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        rdProductivityIncrease: 167,
        patentsFiled: 43,
        newProductRevenue: 234000000,
        innovationAccounts: Math.floor(accounts.length * 0.78),
        source: 'innovation-analytics',
        confidence: 88,
        impact: 9,
        breakthroughTechnologies: ['Quantum Computing', 'Edge AI', 'Digital Twins', 'Blockchain', '5G/6G'],
        timeToMarket: 'accelerated-156%'
      }
    },
    {
      id: `portfolio-signal-6-${Date.now()}`,
      accountId: 'portfolio',
      accountName: 'Portfolio Analysis',
      type: 'collaboration',
      category: 'culture',
      severity: 'medium',
      description: `Collaboration revolution: Cross-functional productivity increased 245% with 97% employee satisfaction in hybrid work environments across all portfolio companies`,
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        collaborationProductivity: 245,
        employeeSatisfaction: 97,
        hybridWorkAdoption: 100,
        collaborationTools: ['Microsoft Teams', 'Power Platform', 'Viva Suite'],
        source: 'collaboration-analytics',
        confidence: 91,
        impact: 7,
        workplaceTransformation: 'revolutionary',
        culturalTransformationScore: 94
      }
    }
  ];
  
  signals.push(...portfolioSignals);
  
  return signals;
}
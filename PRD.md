# SignalCX - Agentic AI Platform for Customer Success

SignalCX is an intelligent Customer Success platform that leverages Azure AI to automatically analyze account data, generate contextual Next Best Actions, and orchestrate multi-step workflows for customer success teams.

**Experience Qualities**:
1. **Intelligent** - AI-driven insights and recommendations feel smart and contextually relevant
2. **Responsive** - Real-time updates and live streaming create dynamic, engaging interactions
3. **Professional** - Enterprise-grade interface that builds trust and confidence in business-critical decisions

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Requires sophisticated AI integration, real-time data streaming, multi-step workflows, and enterprise-grade data management capabilities

## Essential Features

### Account Management Dashboard
- **Functionality**: Display comprehensive account overview with health scores, ARR, and risk categorization
- **Purpose**: Provides at-a-glance visibility into customer portfolio health and prioritization
- **Trigger**: Landing page access or navigation menu selection
- **Progression**: Load accounts → Display in sortable table → Filter by health status → Select account for details
- **Success criteria**: All accounts display with accurate health scores and proper risk categorization (Good/Watch/At Risk)

### AI-Powered Next Best Actions (NBA)
- **Functionality**: Generate contextual AI recommendations for specific customer accounts
- **Purpose**: Eliminates guesswork by providing data-driven action recommendations
- **Trigger**: Click "Generate NBA" button on selected account
- **Progression**: Select account → Click Generate NBA → AI processes account data → Display recommended actions with reasoning
- **Success criteria**: NBA recommendations are contextually relevant and include clear reasoning and prioritization

### Live Signal Streaming
- **Functionality**: Real-time display of customer behavior signals and system events
- **Purpose**: Enables proactive customer success responses to live customer activities
- **Trigger**: Automatic SSE connection on dashboard load with pause/resume controls
- **Progression**: Connect to signal stream → Display real-time events → Filter/categorize signals → Action on critical signals
- **Success criteria**: Signals stream in real-time with ability to pause/resume and proper categorization

### Agentic Orchestration (Plan & Run)
- **Functionality**: Execute multi-step AI workflows with human approval gates
- **Purpose**: Automates complex customer success processes while maintaining human oversight
- **Trigger**: Click "Plan & Run" button after NBA generation
- **Progression**: Generate plan → Display approval card → Approve/reject → Execute workflow → Log results in memory
- **Success criteria**: Workflows execute successfully with proper approval gates and complete audit trail

### Agent Memory & Audit Trail
- **Functionality**: Persistent logging of all AI decisions, approvals, and workflow executions
- **Purpose**: Provides transparency and accountability for all automated actions
- **Trigger**: Automatic logging during any AI operation or workflow execution
- **Progression**: Action occurs → Log entry created → Display in memory panel → Filter/search history
- **Success criteria**: Complete audit trail with timestamps, user attribution, and outcome tracking

### CSV Data Import
- **Functionality**: Upload and process customer account and signal data via CSV files
- **Purpose**: Enables bulk data import and system initialization with customer data
- **Trigger**: Click upload button in data management section
- **Progression**: Select CSV file → Validate format → Preview data → Confirm import → Process and store
- **Success criteria**: CSV files process successfully with error handling and data validation

## Edge Case Handling

- **AI Service Failures**: Graceful degradation with offline mode and retry mechanisms
- **Invalid CSV Data**: Comprehensive validation with clear error messages and format guidance
- **Network Connectivity Loss**: Queue actions for retry and maintain local state
- **Large Dataset Performance**: Pagination and virtual scrolling for performance optimization
- **Concurrent User Actions**: Optimistic updates with conflict resolution
- **Empty States**: Helpful guidance for getting started and importing initial data

## Design Direction

The interface should feel like a premium enterprise SaaS platform - clean, data-focused, and confident. Think Microsoft Teams meets Power BI with subtle AI-powered intelligence indicators. Minimal interface with strategic use of color to highlight AI insights and critical alerts.

## Color Selection

Complementary (opposite colors) - Professional blue primary with strategic orange accents for AI-generated content and alerts, creating clear hierarchy between human actions and AI recommendations.

- **Primary Color**: Deep Azure Blue (oklch(0.45 0.15 240)) - Communicates trust, reliability, and Microsoft ecosystem alignment
- **Secondary Colors**: Neutral grays (oklch(0.95 0 0) to oklch(0.2 0 0)) for data hierarchy and professional appearance
- **Accent Color**: Intelligent Orange (oklch(0.65 0.15 45)) - Highlights AI-generated content, recommendations, and critical alerts
- **Foreground/Background Pairings**:
  - Background (White oklch(1 0 0)): Dark gray text (oklch(0.2 0 0)) - Ratio 16.75:1 ✓
  - Primary (Azure Blue oklch(0.45 0.15 240)): White text (oklch(1 0 0)) - Ratio 7.2:1 ✓
  - Accent (Orange oklch(0.65 0.15 45)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Card (Light Gray oklch(0.98 0 0)): Dark gray text (oklch(0.2 0 0)) - Ratio 15.8:1 ✓

## Font Selection

Inter typeface family conveys modern professionalism and excellent readability for data-heavy interfaces while maintaining Microsoft ecosystem consistency.

- **Typographic Hierarchy**:
  - H1 (Dashboard Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Data/Content): Inter Regular/14px/relaxed line height
  - Caption (Metadata): Inter Regular/12px/muted color
  - Code (IDs/Technical): Inter Mono/12px/background highlight

## Animations

Subtle, purposeful animations that enhance data comprehension and provide feedback for AI processing states without distracting from critical business information.

- **Purposeful Meaning**: Smooth transitions communicate AI processing states and data relationships while maintaining enterprise professionalism
- **Hierarchy of Movement**: Live signal updates receive gentle pulse animations, AI generation shows progress indicators, approval state changes use satisfying confirmations

## Component Selection

- **Components**: Cards for account overview, Tables for data display, Dialogs for NBA details, Badges for health status, Progress bars for AI processing, Tabs for dashboard sections, Buttons with loading states for AI actions
- **Customizations**: Custom signal stream component, specialized NBA recommendation cards, agent memory timeline component, adaptive card preview component
- **States**: Buttons show loading spinners during AI processing, cards highlight on hover, inputs validate in real-time, status badges change color based on health scores
- **Icon Selection**: Phosphor icons for actions (Brain for AI, Play for execution, Shield for approvals, Database for data), consistent with modern SaaS applications
- **Spacing**: Generous 8px base unit with 16px section gaps and 24px component separation for comfortable data consumption
- **Mobile**: Responsive design with collapsible sidebar, stacked cards on mobile, touch-optimized controls, maintaining full functionality across devices
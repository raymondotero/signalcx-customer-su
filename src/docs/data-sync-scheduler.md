# Data Sync Scheduler Documentation

## Overview

The Data Sync Scheduler is a comprehensive automated data synchronization system that allows you to configure, monitor, and manage data imports from various Microsoft and third-party systems into your SignalCX platform.

## Features

### 1. Multi-Source Data Integration
- **API Endpoints**: REST APIs, GraphQL, webhook integrations
- **Database Connections**: SQL Server, Azure SQL, Cosmos DB
- **File Imports**: CSV, Excel, JSON file uploads
- **CRM Systems**: Dynamics 365 Sales, Salesforce, HubSpot
- **Power BI**: Datasets, reports, dashboard metrics
- **Microsoft Fabric**: Lakehouses, data warehouses, analytics

### 2. Flexible Scheduling Options
- **Real-time**: Continuous data streaming (5-minute intervals)
- **Hourly**: Top of every hour synchronization
- **Daily**: Scheduled time-based sync (default 2:00 AM UTC)
- **Weekly**: Weekly recurring sync (configurable day)
- **Monthly**: Monthly sync on specified date

### 3. Advanced Monitoring & Analytics
- **Success Rate Tracking**: Monitor sync performance over time
- **Record Processing Metrics**: Track volume and processing speed
- **Duration Analytics**: Average sync times and performance trends
- **Source Distribution**: Visual breakdown of data source types
- **Upcoming Sync Preview**: 24-hour lookahead for scheduled syncs

## Configuration Guide

### Creating a New Sync Schedule

1. **Access the Scheduler**
   - Click the "Data Sync" button in the main navigation
   - Navigate to the "Schedules" tab
   - Click "Add Schedule"

2. **Basic Configuration**
   - **Schedule Name**: Descriptive name (e.g., "CRM Daily Sync")
   - **Data Source**: Source system name (e.g., "Dynamics 365 Sales")
   - **Source Type**: Select from available types
   - **Frequency**: Choose sync interval

3. **Advanced Settings**
   - **Sync Time**: For daily/weekly schedules, specify exact time (UTC)
   - **Data Types**: Comma-separated list of data entities to sync
   - **Enable Schedule**: Toggle immediate activation

### Data Type Configuration

Configure which data entities to synchronize:

#### CRM Systems
```
accounts, contacts, opportunities, activities, notes, attachments
```

#### Azure Cost Management
```
usage, billing, resources, subscriptions, cost_alerts
```

#### Power BI
```
dashboards, reports, datasets, workspaces, usage_metrics
```

#### Microsoft Fabric
```
analytics, signals, metrics, lakehouse_data, warehouse_tables
```

## Operational Features

### Manual Sync Execution
- **Run Now**: Execute any schedule immediately
- **Status Monitoring**: Real-time sync progress tracking
- **Result Logging**: Detailed execution logs and metrics

### Schedule Management
- **Enable/Disable**: Toggle schedules without deletion
- **Status Indicators**: Visual status badges (Success, Running, Failed, Pending)
- **Performance Metrics**: Records processed, duration, last run time

### Error Handling
- **Automatic Retry**: Failed syncs retry with exponential backoff
- **Error Notifications**: Toast notifications for sync status changes
- **Failure Logging**: Detailed error logs for troubleshooting

## Analytics Dashboard

### Overview Metrics
- **Active Schedules**: Number of enabled sync configurations
- **Success Rate**: Percentage of successful sync executions
- **Records Today**: Total records processed in current day
- **Total Syncs**: Total number of configured schedules

### Performance Insights
- **Sync Performance Trends**: Success rate visualization
- **Average Duration**: Mean processing time across all syncs
- **Source Distribution**: Breakdown by data source type
- **Recent Activity**: Timeline of latest sync executions

### Upcoming Syncs
- **24-Hour Preview**: All scheduled syncs in next 24 hours
- **Time Until Execution**: Countdown to next sync
- **Schedule Details**: Source, frequency, and configuration info

## Best Practices

### Schedule Frequency
- **Real-time**: Use for critical business signals requiring immediate updates
- **Hourly**: Ideal for operational metrics and usage data
- **Daily**: Standard for CRM data, financial reports, and analytics
- **Weekly/Monthly**: Suitable for large datasets and historical reporting

### Performance Optimization
- **Off-Peak Scheduling**: Schedule large syncs during low-usage hours (2-4 AM)
- **Data Filtering**: Sync only necessary data types to reduce processing time
- **Incremental Updates**: Configure delta syncs where supported
- **Error Monitoring**: Regular review of failed syncs and performance metrics

### Data Quality
- **Source Validation**: Verify data source connectivity before scheduling
- **Data Type Mapping**: Ensure proper mapping between source and target schemas
- **Regular Audits**: Monitor sync results for data quality issues
- **Backup Strategies**: Maintain data backups before major sync operations

## Troubleshooting

### Common Issues

#### Sync Failures
1. **Check Source Connectivity**: Verify API endpoints or database connections
2. **Review Permissions**: Ensure proper authentication and authorization
3. **Validate Data Types**: Confirm specified data types exist in source system
4. **Monitor Resource Limits**: Check for API rate limits or quota restrictions

#### Performance Issues
1. **Reduce Data Volume**: Limit sync to essential data types only
2. **Optimize Timing**: Move syncs to off-peak hours
3. **Check Network**: Verify stable network connectivity
4. **Review Source Load**: Ensure source systems can handle sync requests

#### Configuration Problems
1. **Time Zone Settings**: Verify UTC time configuration for scheduled syncs
2. **Data Type Syntax**: Check comma-separated data type list format
3. **Schedule Conflicts**: Avoid overlapping syncs from same source system
4. **Resource Allocation**: Ensure adequate system resources for concurrent syncs

## Integration Examples

### Dynamics 365 CRM Integration
```json
{
  "name": "Dynamics 365 Daily Sync",
  "source": "Dynamics 365 Sales",
  "sourceType": "crm",
  "frequency": "daily",
  "schedule": {
    "time": "02:00",
    "timezone": "UTC"
  },
  "dataTypes": [
    "accounts",
    "contacts", 
    "opportunities",
    "activities"
  ]
}
```

### Azure Cost Management Integration
```json
{
  "name": "Azure Usage Analytics",
  "source": "Azure Cost Management",
  "sourceType": "api",
  "frequency": "hourly",
  "dataTypes": [
    "usage",
    "billing",
    "resources"
  ]
}
```

### Power BI Workspace Integration
```json
{
  "name": "Power BI Workspace Data",
  "source": "Power BI Service",
  "sourceType": "powerbi",
  "frequency": "daily",
  "schedule": {
    "time": "01:30",
    "timezone": "UTC"
  },
  "dataTypes": [
    "dashboards",
    "reports",
    "datasets"
  ]
}
```

## Security Considerations

### Authentication
- **API Keys**: Secure storage of API keys and tokens
- **OAuth Integration**: Support for OAuth 2.0 flows
- **Service Principals**: Azure AD service principal authentication
- **Connection Encryption**: All data transfers use TLS encryption

### Access Control
- **Role-Based Access**: Schedule management requires appropriate permissions
- **Audit Logging**: All configuration changes are logged
- **Data Governance**: Compliance with organizational data policies
- **Sensitive Data Handling**: Proper handling of PII and confidential information

## API Reference

### Schedule Management Endpoints

#### Create Schedule
```http
POST /api/sync/schedules
Content-Type: application/json

{
  "name": "Schedule Name",
  "source": "Data Source",
  "sourceType": "api|database|file|crm|powerbi|fabric",
  "frequency": "realtime|hourly|daily|weekly|monthly",
  "enabled": true,
  "dataTypes": ["type1", "type2"],
  "schedule": {
    "time": "HH:MM",
    "timezone": "UTC"
  }
}
```

#### Execute Schedule
```http
POST /api/sync/schedules/{id}/execute
```

#### Update Schedule
```http
PUT /api/sync/schedules/{id}
Content-Type: application/json

{
  "enabled": false
}
```

#### Get Schedule Status
```http
GET /api/sync/schedules/{id}/status
```

This comprehensive data sync scheduling system ensures reliable, automated data integration across all your Microsoft and third-party systems, providing the foundation for accurate business intelligence and customer success insights in SignalCX.
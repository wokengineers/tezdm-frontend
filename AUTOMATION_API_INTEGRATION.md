# Automation API Integration

This document outlines the integration of the automation API into the TezDM frontend application.

## Overview

The automation system has been fully integrated with the backend API, replacing mock data with real API calls. The implementation includes search, filtering, and CRUD operations for automations.

## API Endpoints

### Base Endpoint
```
/tezdm/setup/workflow/
```

### Available Operations

#### 1. Get Automations List
- **Method**: `GET`
- **Endpoint**: `/tezdm/setup/workflow/`
- **Required Parameters**:
  - `group_id` (number): Mandatory group identifier
- **Optional Parameters**:
  - `search` (string): Search term (automatically converted to lowercase)
  - `is_active` (boolean): Filter by active status
  - `event_type` (number): Filter by automation type (1=comments, 2=stories)

#### 2. Toggle Automation Status
- **Method**: `PATCH`
- **Endpoint**: `/tezdm/setup/workflow/{automation_id}/`
- **Parameters**:
  - `group_id` (number): Group identifier
  - `is_active` (boolean): New status

#### 3. Delete Automation
- **Method**: `DELETE`
- **Endpoint**: `/tezdm/setup/workflow/{automation_id}/`
- **Parameters**:
  - `group_id` (number): Group identifier

#### 4. Duplicate Automation
- **Method**: `POST`
- **Endpoint**: `/tezdm/setup/workflow/{automation_id}/duplicate/`
- **Parameters**:
  - `group_id` (number): Group identifier

## API Response Structure

### Success Response
```json
{
  "status": 1,
  "message": "Success",
  "data": [
    {
      "id": 11,
      "name": "first automation",
      "profile_info_id": 134,
      "event_type": "comment",
      "event_ids": null,
      "config_status": "active_for_all_events",
      "direct_message_templates": [
        {
          "id": 9,
          "sequence": 1,
          "message": "string",
          "keyword": "string"
        }
      ],
      "is_active": false
    }
  ]
}
```

## Implementation Details

### 1. API Service (`src/services/automationApi.ts`)

The automation API service follows the established pattern:
- Uses `secureApi` for authenticated requests
- Includes automatic token refresh
- Proper TypeScript interfaces
- Error handling and response validation

### 2. Search Implementation

**Debounced Search**: 
- 500ms delay after user stops typing
- Automatically converts search terms to lowercase
- Only sends search parameter when there's actual text

**Search Logic**:
```typescript
// Debounced search effect
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]);
```

### 3. Filter Implementation

**Status Filter**:
- Maps `is_active` boolean to UI states
- `true` → "Active" status
- `false` → "Inactive" status
- "All" → No filter parameter sent

**Type Filter**:
- Maps event types to integers
- `comment` → `event_type: 1`
- `story_reply` → `event_type: 2`
- "All" → No filter parameter sent

### 4. State Management

**API State**:
- `automations`: Array of automation objects
- `isLoading`: Loading state for API calls
- `error`: Error state for failed requests
- `groupId`: Group identifier from authentication tokens

**Filter State**:
- `searchTerm`: Current search input
- `debouncedSearchTerm`: Debounced search for API calls
- `statusFilter`: Current status filter
- `typeFilter`: Current type filter
- `sortBy`: Current sort order

### 5. Error Handling

**Network Errors**:
- Automatic retry with token refresh
- User-friendly error messages
- Retry functionality

**Authentication Errors**:
- Handled by `secureApi` service
- Automatic logout on token expiration
- Redirect to login page

### 6. Loading States

**Loading Indicators**:
- Spinner during API calls
- Disabled filters during loading
- Skeleton loading for better UX

## Usage Examples

### Basic API Call
```typescript
const response = await automationApi.getAutomations(groupId);
setAutomations(response.data);
```

### With Filters
```typescript
const filters = {
  search: 'comment automation',
  is_active: true,
  event_type: 1
};
const response = await automationApi.getAutomations(groupId, filters);
```

### Toggle Automation
```typescript
await automationApi.toggleAutomation(automationId, groupId, !currentStatus);
```

## Data Mapping

### API to UI Mapping

| API Field | UI Field | Notes |
|-----------|----------|-------|
| `is_active` | Status | Boolean to string mapping |
| `event_type` | Trigger Type | String to integer mapping |
| `name` | Name | Direct mapping |
| `direct_message_templates.length` | Message Count | Array length |

### Status Mapping
```typescript
// API: is_active: boolean
// UI: status: string
const getStatusText = (isActive: boolean) => {
  return isActive ? 'Live' : 'Inactive';
};
```

### Type Mapping
```typescript
// API: event_type: string
// UI: trigger: string
const getFlowDescription = (automation: Automation) => {
  const eventType = automation.event_type === 'comment' ? 'Comment' : 'Story Reply';
  return `${eventType} → DM`;
};
```

## Security Considerations

1. **Authentication**: All requests use Bearer tokens
2. **Group Isolation**: All requests include `group_id` for data isolation
3. **Token Refresh**: Automatic token refresh on expiration
4. **Error Handling**: Secure error messages without exposing sensitive data

## Performance Optimizations

1. **Debounced Search**: Prevents excessive API calls
2. **Local State Updates**: Optimistic updates for better UX
3. **Error Boundaries**: Graceful error handling
4. **Loading States**: Better perceived performance

## Future Enhancements

1. **Pagination**: Support for large automation lists
2. **Real-time Updates**: WebSocket integration for live updates
3. **Bulk Operations**: Select multiple automations for bulk actions
4. **Advanced Filtering**: Date range, performance metrics
5. **Export/Import**: Automation templates and sharing

## Testing

The implementation includes:
- Error state testing
- Loading state testing
- Filter functionality testing
- Search functionality testing
- CRUD operations testing

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check token validity and refresh
2. **Group ID Missing**: Verify user authentication state
3. **Search Not Working**: Check debounce timing and API parameters
4. **Filters Not Applied**: Verify parameter mapping and API calls

### Debug Information

Enable console logging for debugging:
```typescript
console.log('API Response:', response);
console.log('Filters:', filters);
console.log('Group ID:', groupId);
``` 
# Unified Analytics Architecture

## Overview

NextStack SaaS Starter now uses a unified event-driven analytics system that automatically forwards events to both Google Analytics and Microsoft Clarity. This creates a single source of truth for all analytics while maintaining the flexibility to send data to multiple platforms.

## Architecture

```
Custom Events → Event System → Analytics Services → External Platforms
     ↓              ↓               ↓                    ↓
  useAnalytics   Event Bus   UnifiedAnalyticsService   Google Analytics
  Product CRUD      ↓        DomainAnalyticsService    Microsoft Clarity
  View Changes      ↓        NotificationService
  User Actions   Listeners
```

## Key Components

### 1. Event System (`~/events/`)
- **Domain Events**: Product, Analytics, Notification events with type safety
- **Event Hooks**: Type-safe hooks for dispatching and listening to events
- **Event Bus**: Window-based event system for decoupled communication

### 2. Analytics Services (`~/components/services/`)

#### UnifiedAnalyticsService
Listens to generic analytics events and forwards to GA/Clarity:
- `analytics:track` → Custom events
- `analytics:page-view` → Page views
- `analytics:user-action` → User interactions
- `analytics:business-metric` → Business KPIs
- `analytics:error` → Error tracking

#### DomainAnalyticsService
Listens to domain-specific events and forwards to GA/Clarity:
- `product:created` → Product management events
- `product:updated` → Product updates
- `product:deleted` → Product deletions
- `product:favorited` → Engagement events
- `product:view-toggled` → UI interaction events
- `project:search` → Project search interactions

#### NotificationService
Converts notification events to Mantine notifications:
- `notification:show` → Display notifications
- `notification:product-action` → Product-specific notifications
- `notification:system` → System announcements

### 3. Analytics Hook (`~/hooks/analytics/useAnalytics.tsx`)
Simplified interface for manual analytics tracking:
```typescript
const analytics = useAnalytics();

// Track custom events
analytics.track({ event: 'custom_action', properties: { ... } });

// Track page views
analytics.trackPageView({ page: 'products', title: 'Products' });

// Track user actions
analytics.trackUserAction({ action: 'click', category: 'button' });
```

## Event Flow Examples

### Product Creation
1. User creates product → `useProductService.createProduct`
2. Service dispatches `product:created` event
3. `DomainAnalyticsService` listens and forwards to:
   - Google Analytics: `gevent('product_created', { category: 'product_management' })`
   - Microsoft Clarity: `cevent({ event: { name: 'product_created', value: productName } })`

### Project Search
1. User searches in sidebar → `useEvent('project:search')`
2. Component dispatches `project:search` event (debounced 300ms)
3. `DomainAnalyticsService` listens and forwards to:
   - Google Analytics: `gevent('project_search', { category: 'navigation', result_count: count })`
   - Microsoft Clarity: `cevent({ event: { name: 'project_search', value: query } })`

### Page View Tracking
1. Component calls `analytics.trackPageView({ page: 'products' })`
2. Hook dispatches `analytics:page-view` event
3. `UnifiedAnalyticsService` listens and forwards to:
   - Google Analytics: `pageView({ path: 'products' })`
   - Microsoft Clarity: `cevent({ event: { name: 'page_view', value: 'products' } })`

## Benefits

### 1. **Single Source of Truth**
- All analytics go through the same event system
- Consistent data across platforms
- Easy to add new analytics platforms

### 2. **Decoupled Architecture**
- Components don't directly call analytics APIs
- Easy to modify or remove analytics platforms
- Clean separation of concerns

### 3. **Type Safety**
- TypeScript ensures correct event payloads
- IDE autocomplete for event properties
- Compile-time error checking

### 4. **Debugging & Development**
- Event listeners for debugging in development
- Console logs show event flow
- Easy to monitor analytics in dev tools

### 5. **Extensible**
- Easy to add new event types
- Simple to add new analytics platforms
- Flexible event payload structure

## Usage Examples

### Manual Analytics Tracking
```typescript
import { useAnalytics } from '~/hooks/analytics/useAnalytics';

function MyComponent() {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.trackUserAction({
      action: 'button_click',
      category: 'navigation',
      label: 'header_menu',
    });
  };

  useEffect(() => {
    analytics.trackPageView({
      page: 'my-page',
      title: 'My Page Title',
    });
  }, []);
}
```

### Automatic Domain Event Tracking
```typescript
// This happens automatically when using useProductService
const { createProduct } = productService.useMutations();

// When this is called, it automatically:
// 1. Dispatches product:created event
// 2. Forwards to GA and Clarity
// 3. Shows notification
createProduct.mutate({ name: 'New Product' });
```

### Adding New Analytics Platforms
```typescript
// Just add a new listener in a service component
useAnalyticsEvent('analytics:track', (data) => {
  // Forward to new platform
  newPlatform.track(data.event, data.properties);
});
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_GA_TAG=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxx
```

### Global Setup
Analytics services are automatically loaded in `~/app/providers.tsx`:
```typescript
<UnifiedAnalyticsService />
<DomainAnalyticsService />
<NotificationService />
```

## Debug Mode

In development, enable debug logging by adding event listeners:
```typescript
import { 
  AnalyticsEventListener,
  ProductEventListener,
  NotificationEventListener 
} from '~/components/debug/';

// Add to your component for debugging
<AnalyticsEventListener />
<ProductEventListener />
<NotificationEventListener />
```

## Migration Notes

### From Direct GA/Clarity Calls
```typescript
// OLD - Direct calls
gtag('event', 'purchase', { ... });
clarity('set', 'user_type', 'premium');

// NEW - Event-driven
const analytics = useAnalytics();
analytics.track({ event: 'purchase', properties: { ... } });
```

### From Direct Notifications
```typescript
// OLD - Direct Mantine calls
notifications.show({ message: 'Success!' });

// NEW - Event-driven
const notificationDispatcher = useNotificationDispatcher();
notificationDispatcher.show({ message: 'Success!', type: 'success' });
```

This unified approach provides better maintainability, type safety, and flexibility for future analytics needs.
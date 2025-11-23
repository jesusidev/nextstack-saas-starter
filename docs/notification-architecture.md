# Notification Architecture

## Overview

NextStack SaaS Starter uses an **event-driven notification system** that decouples notification logic from business logic, making the codebase more maintainable, testable, and flexible.

## Architecture

### Event-Driven Pattern

```
Service/Component → notificationDispatcher → Event Bus → NotificationService → Mantine UI
```

**Benefits:**
- ✅ **Decoupled:** Services don't depend on UI library directly
- ✅ **Testable:** Easy to mock event dispatchers
- ✅ **Flexible:** Can swap notification UI without changing services
- ✅ **Centralized:** All notification logic in one place

---

## Components

### 1. Event Dispatcher (`useNotificationDispatcher`)

**Location:** `src/events/use-notification-events.ts`

**Usage:**
```typescript
import { useNotificationDispatcher } from '~/events';

function MyComponent() {
  const notificationDispatcher = useNotificationDispatcher();
  
  const handleAction = async () => {
    try {
      await someAction();
      notificationDispatcher.show({
        message: 'Action completed successfully',
        type: 'success',
      });
    } catch (error) {
      notificationDispatcher.show({
        message: `Failed: ${error.message}`,
        type: 'error',
      });
    }
  };
}
```

**API:**
```typescript
notificationDispatcher.show({
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  persistent?: boolean;
  action?: { label: string; onClick: () => void };
});

notificationDispatcher.productAction({
  action: 'created' | 'updated' | 'deleted' | 'favorited';
  productName: string;
  type: 'success' | 'info';
});

notificationDispatcher.system({
  message: string;
  type: 'maintenance' | 'update' | 'announcement';
  level: 'low' | 'medium' | 'high';
});

notificationDispatcher.hide({ id?: string });
notificationDispatcher.clearAll();
```

---

### 2. Notification Service (`NotificationService`)

**Location:** `src/components/services/NotificationService.tsx`

This component listens for notification events and converts them to Mantine notifications. It's the **only place** where Mantine's `notifications` API should be used directly.

**How it works:**
```typescript
export function NotificationService() {
  // Listen for notification events
  useNotificationEvent('notification:show', (data) => {
    notifications.show({  // ← Only place Mantine is used
      message: data.message,
      color: getColorForType(data.type),
      icon: getIconForType(data.type),
      autoClose: data.persistent ? false : data.duration || 5000,
    });
  });
  
  // ... other event listeners
  
  return null; // Service component renders nothing
}
```

---

### 3. Event System

**Location:** `src/events/`

**Event Types:**
- `notification:show` - General notifications
- `notification:hide` - Hide specific notification
- `notification:clear-all` - Clear all notifications
- `notification:product-action` - Product-specific notifications
- `notification:system` - System-wide announcements

---

## Usage Patterns

### ✅ Correct: Service Hooks

```typescript
// src/hooks/service/useProjectService.tsx
export function useProjectService() {
  const notificationDispatcher = useNotificationDispatcher();
  
  function useCreateProject() {
    return api.project.create.useMutation({
      onSuccess: (project) => {
        notificationDispatcher.show({
          message: `${project.name} has been created successfully`,
          type: 'success',
        });
      },
      onError: (error) => {
        notificationDispatcher.show({
          message: `Failed to create project: ${error.message}`,
          type: 'error',
        });
      },
    });
  }
}
```

### ✅ Correct: Components

```typescript
// src/components/MyComponent.tsx
export function MyComponent() {
  const notificationDispatcher = useNotificationDispatcher();
  
  const handleSubmit = async () => {
    try {
      await submitData();
      notificationDispatcher.show({
        message: 'Data submitted successfully',
        type: 'success',
      });
    } catch (error) {
      notificationDispatcher.show({
        message: 'Failed to submit data',
        type: 'error',
      });
    }
  };
}
```

### ❌ Wrong: Direct Mantine Usage

```typescript
// ❌ DON'T DO THIS
import { notifications } from '@mantine/notifications';

export function MyComponent() {
  const handleSubmit = async () => {
    notifications.show({  // ❌ Wrong!
      message: 'Success',
      color: 'green',
    });
  };
}
```

---

## Migration Guide

### Migrating from Mantine Notifications

**Before:**
```typescript
import { notifications } from '@mantine/notifications';
import { IconCircleCheck } from '@tabler/icons-react';

notifications.show({
  id: 'my-notification',
  title: 'Success',
  message: 'Operation completed',
  color: 'green.5',
  icon: <IconCircleCheck />,
  autoClose: 5000,
});
```

**After:**
```typescript
import { useNotificationDispatcher } from '~/events';

const notificationDispatcher = useNotificationDispatcher();

notificationDispatcher.show({
  message: 'Operation completed',
  type: 'success',
  duration: 5000,
});
```

### Key Changes

1. **Remove Mantine imports:**
   - Remove `import { notifications } from '@mantine/notifications'`
   - Remove icon imports (handled by NotificationService)

2. **Add event dispatcher:**
   - Add `import { useNotificationDispatcher } from '~/events'`
   - Call `const notificationDispatcher = useNotificationDispatcher()`

3. **Update notification calls:**
   - Replace `notifications.show()` with `notificationDispatcher.show()`
   - Use `type` instead of `color` and `icon`
   - Use `duration` instead of `autoClose`
   - Remove `id` and `title` (handled automatically)

---

## Files Updated (2025-11-02)

The following files were migrated to use `notificationDispatcher`:

### ✅ Migrated Files
1. `src/hooks/service/useProjectService.tsx`
2. `src/hooks/service/useUserService.tsx`
3. `src/hooks/useS3Upload.tsx`
4. `src/components/input/ProjectSelect.tsx`

### ✅ Already Correct
1. `src/hooks/service/useCategoryService.tsx`
2. `src/hooks/service/useProductService.tsx`

### ✅ Allowed (Infrastructure)
1. `src/components/services/NotificationService.tsx` - Event listener (uses Mantine)
2. `src/app/providers.tsx` - Mantine provider setup

---

## Testing

### Mocking in Tests

When testing components that use notifications:

```typescript
// Mock the notification dispatcher
jest.mock('~/events', () => ({
  useNotificationDispatcher: () => ({
    show: jest.fn(),
    hide: jest.fn(),
    clearAll: jest.fn(),
    productAction: jest.fn(),
    system: jest.fn(),
  }),
}));
```

### Testing Notifications

```typescript
import { useNotificationDispatcher } from '~/events';

it('shows success notification', async () => {
  const mockShow = jest.fn();
  (useNotificationDispatcher as jest.Mock).mockReturnValue({
    show: mockShow,
  });
  
  // ... trigger action
  
  expect(mockShow).toHaveBeenCalledWith({
    message: 'Success message',
    type: 'success',
  });
});
```

---

## Best Practices

### 1. Use Appropriate Notification Types

- **`success`** - Successful operations (create, update, delete)
- **`error`** - Failed operations, validation errors
- **`info`** - Informational messages, status updates
- **`warning`** - Warnings, deprecation notices

### 2. Keep Messages User-Friendly

```typescript
// ✅ Good
notificationDispatcher.show({
  message: 'Project "My Project" has been created successfully',
  type: 'success',
});

// ❌ Bad
notificationDispatcher.show({
  message: 'POST /api/project 201',
  type: 'success',
});
```

### 3. Include Context in Error Messages

```typescript
// ✅ Good
notificationDispatcher.show({
  message: `Failed to create project: ${error.message}`,
  type: 'error',
});

// ❌ Bad
notificationDispatcher.show({
  message: 'Error',
  type: 'error',
});
```

### 4. Use Product Actions for Product Operations

```typescript
// ✅ Good - Uses specialized product action
notificationDispatcher.productAction({
  action: 'created',
  productName: product.name,
  type: 'success',
});

// ❌ Less ideal - Generic notification
notificationDispatcher.show({
  message: `${product.name} created`,
  type: 'success',
});
```

---

## Troubleshooting

### Notifications Not Appearing

1. **Check NotificationService is mounted:**
   - Verify `<NotificationService />` is in `providers.tsx`

2. **Check event dispatcher is called:**
   - Add console.log to verify dispatcher is invoked

3. **Check Mantine Notifications provider:**
   - Verify `<Notifications />` is in providers

### Duplicate Notifications

- Check if both service hook AND component are showing notifications
- Service hooks should handle success/error notifications
- Components should only show notifications for custom logic

---

## Future Enhancements

### Planned Features
- [ ] Notification queue management
- [ ] Notification history/log
- [ ] Persistent notifications across page reloads
- [ ] Notification preferences per user
- [ ] Rich notification content (images, actions)
- [ ] Sound notifications
- [ ] Desktop notifications API integration

---

## Related Documentation

- [Event System](./event-system.md)
- [Service Hooks](./service-hooks.md)
- [Testing Guide](./testing-guide.md)

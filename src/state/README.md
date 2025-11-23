# State Management Architecture

This folder follows a domain-driven design pattern for organizing React context providers and state management.

## 📁 Folder Structure

```
src/state/
├── index.ts                    # Barrel exports for clean imports
├── provider-builder.tsx        # Utility for composing multiple providers
├── notifications/              # Notification system domain
│   ├── index.ts               # Domain barrel exports
│   ├── notification-context.tsx    # Context definition & types
│   ├── notification-provider.tsx   # Provider implementation
│   └── use-notification.tsx        # Custom hook
└── user-preferences/           # User preferences domain
    ├── index.ts               # Domain barrel exports
    ├── user-preferences-context.tsx  # Context definition & types
    ├── user-preferences-provider.tsx # Provider implementation
    └── use-user-preferences.tsx      # Custom hook
```

## 🎯 Design Principles

### **Domain Organization**
Each domain (notifications, user-preferences, etc.) has its own folder with:
- `*-context.tsx` - Context definition, types, and default values
- `*-provider.tsx` - Provider component with business logic
- `use-*.tsx` - Custom hook for consuming the context
- `index.ts` - Barrel exports for clean imports

### **Separation of Concerns**
- **Context**: Type definitions and context creation
- **Provider**: State management and business logic
- **Hook**: Safe context consumption with error handling
- **Index**: Clean import/export interface

### **Type Safety**
- Full TypeScript support with proper type inference
- Exported types for external consumption
- Context validation with helpful error messages

## 🚀 Usage Examples

### **Import from domain**
```tsx
import { useNotification, NotificationProvider } from '~/state/notifications';
```

### **Import from state root**
```tsx
import { useNotification, useUserPreferences } from '~/state';
```

### **Using in components**
```tsx
function MyComponent() {
  const { success, error } = useNotification();
  const { preferences, updateTheme } = useUserPreferences();
  
  return (
    <button onClick={() => success('Settings updated!')}>
      Switch Theme
    </button>
  );
}
```

## 🔄 Relationship with React Query

This state management complements React Query:

- **Context Providers**: Handle client-side UI state (preferences, notifications, modals)
- **React Query (TRPC)**: Handle server state (API calls, caching, synchronization)

Perfect separation of concerns for a scalable architecture!
// Global type declarations

// Google Analytics gtag function
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent' | 'set',
      targetOrAction: string,
      params?: Record<string, string | number | boolean | undefined>
    ) => void;
    clarity: (action: string, params?: unknown) => void;
  }
}

export {};

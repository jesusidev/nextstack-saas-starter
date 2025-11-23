import type { Dispatch } from 'react';
import { useCallback, useEffect } from 'react';
import type { AppEvent, CustomWindowEventMap } from '../events';

export const useEvent = <
  EventName extends keyof CustomWindowEventMap,
  PayloadType = CustomWindowEventMap[EventName] extends AppEvent<infer P> ? P : unknown,
>(
  eventName: EventName,
  callback?: Dispatch<PayloadType> | VoidFunction
) => {
  useEffect(() => {
    if (!callback) {
      return;
    }

    const listener = ((event: AppEvent<PayloadType>) => {
      // Type-safe callback with proper payload
      if (typeof callback === 'function') {
        if (callback.length > 0) {
          // Callback expects payload
          (callback as Dispatch<PayloadType>)(event.detail);
        } else {
          // Callback is VoidFunction
          (callback as VoidFunction)();
        }
      }
    }) as EventListener;

    // Cast eventName to string for DOM API compatibility
    window.addEventListener(eventName as string, listener);

    return () => {
      window.removeEventListener(eventName as string, listener);
    };
  }, [callback, eventName]);

  const dispatch = useCallback(
    (detail?: PayloadType) => {
      const event = new CustomEvent(eventName as string, {
        detail,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    },
    [eventName]
  );

  return { dispatch };
};

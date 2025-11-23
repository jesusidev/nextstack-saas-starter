import type { AppEvent } from './types';

/**
 * Project-related events for analytics and state management
 */
export interface ProjectEvents {
  /**
   * Fired when user searches for projects in the sidebar
   * @property query - The search query string
   * @property resultCount - Number of projects matching the query
   * @property userId - Optional user identifier
   */
  'project:search': AppEvent<{
    query: string;
    resultCount: number;
    userId?: string;
  }>;
}

export type ProjectEventName = keyof ProjectEvents;

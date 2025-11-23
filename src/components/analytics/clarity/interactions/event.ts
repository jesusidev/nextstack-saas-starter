// https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api

type ClarityEvents = Record<string, unknown> & {
  /**
   * @param {upgrade} upgrade Upgrade Session Object
   * @param {reason} upgrade.reason of the session upgrade
   **/
  upgrade?: { reason: string };
  /**
   * Cookie Consent
   * @param {consent} consent
   **/
  consent?: boolean;
  /**
   * @param {event} event Setup custom tags
   * @param {name} event.name The tag name that identifies the kind of information you're sending
   * @param {value} event.value The value attached to the tag
   */
  event?: { name: string; value: string };
  /**
   * @param {identify} Identify user
   * @param {userId} identify.userId Unique ID of a user
   * @param {sessionId} identify.sessionId Unique ID of a session
   * @param {pageId} identify.pageId Unique ID of a page
   */
  identify?: { userId: string; sessionId?: string; pageId?: string };
};

declare global {
  interface Window {
    clarity: {
      (action: 'set', key: string, value: string): void;
      (action: 'identify', userId: string, sessionId?: string, pageId?: string): void;
      (action: 'upgrade', reason: string): void;
      (action: 'consent', hasConsented: boolean): void;
    };
  }
}

export function cevent({ upgrade, event, identify, consent }: ClarityEvents = {}): void {
  if (typeof window === 'undefined' || window.clarity === undefined) {
    console.warn('Microsoft Clarity is not loaded');
    return;
  }

  if (upgrade !== undefined) {
    window.clarity('upgrade', upgrade.reason);
  }

  if (event !== undefined) {
    // Clarity API: clarity('set', key, value)
    // key = tag name, value = tag value
    console.log('📊 Clarity custom tag:', event.name, '=', event.value);
    window.clarity('set', event.name, event.value);
  }

  if (identify !== undefined) {
    // Clarity API: clarity('identify', userId, sessionId?, pageId?)
    if (identify.sessionId && identify.pageId) {
      window.clarity('identify', identify.userId, identify.sessionId, identify.pageId);
    } else if (identify.sessionId) {
      window.clarity('identify', identify.userId, identify.sessionId);
    } else {
      window.clarity('identify', identify.userId);
    }
  }

  if (consent !== undefined) {
    window.clarity('consent', consent);
  }
}

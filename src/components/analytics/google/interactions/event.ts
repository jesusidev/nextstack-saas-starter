// https://developers.google.com/analytics/devguides/collection/gtagjs/events

type EventOptions = Record<string, string | number | boolean | undefined> & {
  category?: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  userId?: string;
};

type GtagEventOptions = Record<string, string | number | boolean | undefined> & {
  event_category?: string;
  event_label?: string;
  value?: number;
  non_interaction?: boolean;
  user_id?: string;
};

export function gevent(
  action: string,
  { category, label, value, nonInteraction, userId, ...otherOptions }: EventOptions = {}
): void {
  if (!window?.gtag) {
    return;
  }

  const eventOptions: GtagEventOptions = { ...otherOptions };

  if (category !== undefined) {
    eventOptions.event_category = category;
  }

  if (label !== undefined) {
    eventOptions.event_label = label;
  }

  if (value !== undefined) {
    eventOptions.value = value;
  }

  if (nonInteraction !== undefined) {
    eventOptions.non_interaction = nonInteraction;
  }

  if (userId !== undefined) {
    eventOptions.user_id = userId;
  }

  window?.gtag('event', action, eventOptions);
}

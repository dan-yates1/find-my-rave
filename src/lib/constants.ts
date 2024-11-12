export const EVENT_TYPES = [
  'rave',
  'festival',
  'concert',
  'club night',
  'warehouse party',
  'boat party',
  'day party',
  'underground'
] as const;

export type EventType = typeof EVENT_TYPES[number]; 
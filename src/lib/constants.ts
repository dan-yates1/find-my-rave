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

export const GENRE_MAPPINGS = {
  house: {
    label: 'House',
    keywords: ['house', 'deep house', 'tech house', 'progressive house'],
  },
  techno: {
    label: 'Techno',
    keywords: ['techno', 'industrial techno', 'minimal techno'],
  },
  dnb: {
    label: 'Drum & Bass',
    keywords: ['drum and bass', 'dnb', 'd&b', 'jungle', 'neurofunk'],
  },
  trance: {
    label: 'Trance',
    keywords: ['trance', 'psytrance', 'progressive trance', 'uplifting trance'],
  },
  dubstep: {
    label: 'Dubstep',
    keywords: ['dubstep', 'brostep', 'riddim'],
  },
  garage: {
    label: 'Garage',
    keywords: ['garage', 'uk garage', 'ukg', '2-step'],
  },
  hardstyle: {
    label: 'Hardstyle',
    keywords: ['hardstyle', 'hardcore', 'hard dance', 'gabber'],
  },
} as const;

export type GenreType = keyof typeof GENRE_MAPPINGS; 

// Mapping between Skiddle's eventcodes and our genres
export const SKIDDLE_GENRE_MAPPING = {
  'CLUB': ['CLUB', 'HOUSE', 'TECH', 'TRANCE'],
  'LIVE': ['LIVE', 'DNB', 'BASS'],
  'FEST': ['FEST'],
} as const; 
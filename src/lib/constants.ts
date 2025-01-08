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

export const GENRE_MAPPINGS: Record<string, { label: string; keywords: string[] }> = {
  'house': {
    label: 'House',
    keywords: ['house', 'deep house', 'tech house', 'progressive house', 'funky house', 'acid house']
  },
  'techno': {
    label: 'Techno',
    keywords: ['techno', 'industrial', 'minimal', 'hard techno', 'detroit techno', 'acid techno']
  },
  'dnb': {
    label: 'Drum & Bass',
    keywords: ['drum and bass', 'drum & bass', 'dnb', 'd&b', 'jungle', 'liquid', 'neurofunk', 'drum & bass', 'dnb', 'd&b', 'bass', 'liquid', 'drum', 'drum n bass']
  },
  'trance': {
    label: 'Trance',
    keywords: ['trance', 'psytrance', 'progressive trance', 'uplifting trance', 'goa']
  },
  'dubstep': {
    label: 'Dubstep',
    keywords: ['dubstep', 'brostep', 'riddim', 'bass music']
  },
  'garage': {
    label: 'Garage',
    keywords: ['garage', 'uk garage', 'ukg', '2-step', 'speed garage']
  },
  'hardstyle': {
    label: 'Hardstyle',
    keywords: ['hardstyle', 'hardcore', 'gabber', 'hard dance', 'rawstyle']
  },
  'disco': {
    label: 'Disco',
    keywords: ['disco', 'nu disco', 'italo disco', 'funk']
  },
  'experimental': {
    label: 'Experimental',
    keywords: ['experimental', 'idm', 'glitch', 'ambient', 'electronica']
  }
};

export type GenreType = keyof typeof GENRE_MAPPINGS; 

// Mapping between Skiddle's eventcodes and our genres
export const SKIDDLE_GENRE_MAPPING = {
  'CLUB': ['CLUB', 'HOUSE', 'TECH', 'TRANCE'],
  'LIVE': ['LIVE', 'DNB', 'BASS'],
  'FEST': ['FEST'],
} as const; 
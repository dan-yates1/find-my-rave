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

export const SKIDDLE_GENRE_IDS = {
  house: ['1', '10', '14', '22', '102', '108'], // House, Deep House, Tech House, Funky House, Disco House, Soulful House
  techno: ['9', '56'], // Techno, Minimal Techno
  dnb: ['8', '80'], // Drum and Bass, Jungle
  trance: ['2', '17', '28'], // Trance, Psy/GoaTrance, Hard Trance
  dubstep: ['65'], // Dubstep
  garage: ['3'], // UK Garage
  hardstyle: ['18', '81'], // Hardcore/Hardstyle, Hard Dance
} as const; 
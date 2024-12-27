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
  // Main Electronic Music Genres
  CLUB: { label: "Club Night", genres: ["House", "Techno", "General Club Night"] },
  BASS: { label: "Bass Music", genres: ["Drum & Bass", "Dubstep", "Garage", "Grime"] },
  DNB: { label: "Drum & Bass", genres: ["Drum & Bass", "Jungle", "Breakbeat"] },
  ELEC: { label: "Electronic", genres: ["Electronic", "EDM"] },
  TECH: { label: "Techno", genres: ["Techno", "Industrial", "Minimal"] },
  HOUSE: { label: "House", genres: ["House", "Deep House", "Tech House"] },
  TRANCE: { label: "Trance", genres: ["Trance", "Progressive"] },
  // Festival and Live categories
  FEST: { label: "Festival", genres: ["Multi-Genre", "Festival"] },
  LIVE: { label: "Live Music", genres: ["Live Electronic", "Live Performance"] },
  // Additional specific genres
  GARAGE: { label: "UK Garage", genres: ["UK Garage", "Speed Garage", "2-Step"] },
  HARD: { label: "Hardcore", genres: ["Hardcore", "Hard Dance", "Hardstyle"] }
} as const;

export type GenreType = keyof typeof GENRE_MAPPINGS; 

// Mapping between Skiddle's eventcodes and our genres
export const SKIDDLE_GENRE_MAPPING = {
  'CLUB': ['CLUB', 'HOUSE', 'TECH', 'TRANCE'],
  'LIVE': ['LIVE', 'DNB', 'BASS'],
  'FEST': ['FEST'],
} as const; 
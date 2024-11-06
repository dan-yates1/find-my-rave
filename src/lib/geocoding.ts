type GeocodingResponse = {
  lat: number;
  lon: number;
};

export async function getLatLon(location: string): Promise<GeocodingResponse | null> {
  if (!location) return null;
  
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        location
      )}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const { lat, lng: lon } = data.results[0].geometry;
      return { lat, lon };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
} 
"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;

interface Event {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  events: Event[];
}

const Map: React.FC<MapProps> = ({ events }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-0.1276, 51.5074], // Default to London
      zoom: 9,
      attributionControl: false, // Disable default attribution control
    });

    // TODO: Add markers for events
  }, [events]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;

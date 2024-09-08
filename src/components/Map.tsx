"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;

interface Event {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
}

interface MapProps {
  events: Event[];
}

const Map: React.FC<MapProps> = ({ events }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Initialize map only once
  useEffect(() => {
    if (map.current) return; // Skip if map is already initialized

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-0.1276, 51.5074], // Default to London
      zoom: 9,
      attributionControl: false, // Disable default attribution control
    });

    // ... other map setup code ...
  }, []); // Empty dependency array to run only once

  // Effect to add markers when events change
  useEffect(() => {
    if (!map.current) return; // Skip if map is not initialized

    // Remove existing markers if needed
    // You would need to keep track of added markers to remove them

    // Add markers for each event
    events.forEach((event) => {
      if (event.latitude !== null && event.longitude !== null) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(event.title);

        // Ensure map.current is not null before using it
        if (map.current) {
          new mapboxgl.Marker({ color: "#3B82F6" })
            .setLngLat([event.longitude, event.latitude])
            .setPopup(popup)
            .addTo(map.current);
        }
      }
    });
  }, [events]); // Dependency array with events, runs when events change

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;

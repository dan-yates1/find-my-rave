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
  searchLocation?: { latitude: number; longitude: number };
}

const Map: React.FC<MapProps> = ({ events, searchLocation }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Initialize map only once
  useEffect(() => {
    if (map.current) return; // Skip if map is already initialized

    let initialCenter: [number, number];
    if (searchLocation) {
      initialCenter = [searchLocation.longitude, searchLocation.latitude];
    } else if (events.length === 1 && events[0].latitude !== null && events[0].longitude !== null) {
      initialCenter = [events[0].longitude, events[0].latitude];
    } else {
      initialCenter = [-0.1276, 51.5074]; // Default to London
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: initialCenter,
      zoom: 9,
      attributionControl: false, // Disable default attribution control
    });

    // ... other map setup code ...
  }, [events, searchLocation]); // Add searchLocation to the dependency array

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

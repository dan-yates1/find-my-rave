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

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-0.1276, 51.5074], // Default to London
      zoom: 9,
      attributionControl: false, // Disable default attribution control
    });

    // Add markers for each event
    events.forEach((event) => {
      if (event.latitude !== null && event.longitude !== null) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(event.title);

        new mapboxgl.Marker({ color: "#3B82F6" }) // Customize marker color if needed
          .setLngLat([event.longitude, event.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });
  }, [events]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Map;

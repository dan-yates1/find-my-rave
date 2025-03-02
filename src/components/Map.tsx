"use client";

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Event } from '@prisma/client';

// Ensure mapboxgl only runs on the client side
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY as string;
}

interface MapProps {
  events: Event[];
  center?: [number, number];
  onMarkerClick?: (eventId: string) => void;
  zoom?: number;
  interactive?: boolean;
}

export default function Map({ events, center, onMarkerClick, zoom }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const centreLatLon = center || [events[0]?.longitude || -0.127758, events[0]?.latitude || 51.507351];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: centreLatLon,
      zoom: zoom || 11
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    events.forEach(event => {
      if (event.latitude && event.longitude) {
        // Create a default Mapbox marker (no custom element needed)
        const marker = new mapboxgl.Marker({
          color: '#3B82F6', // Tailwind blue-500 color
          scale: 1.2, // Make it slightly larger
        })
          .setLngLat([event.longitude, event.latitude])
          .addTo(map.current!);

        if (onMarkerClick) {
          marker.getElement().addEventListener('click', () => onMarkerClick(event.id));
        }

        markers.current.push(marker);
      }
    });

    // Fit bounds if multiple events
    if (events.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      events.forEach(event => {
        if (event.latitude && event.longitude) {
          bounds.extend([event.longitude, event.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [events, map.current]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}

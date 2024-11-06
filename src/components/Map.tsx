"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Event } from "@prisma/client";

interface MapProps {
  events: Event[];
  centreLatLon?: [number, number];
  className?: string;
  hoveredEventId?: string | null;
}

const Map: React.FC<MapProps> = ({ events, centreLatLon, className = "", hoveredEventId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_KEY,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-0.118092, 51.509865],
        zoom: 11,
      });

      // Add custom styles when map loads
      map.current.on("load", () => {
        if (!map.current) return;

        // Add custom layer for event clusters
        map.current.addSource("events", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Add cluster layer
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "events",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#4F46E5",
              10,
              "#3730A3",
              30,
              "#312E81",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              30,
              40,
            ],
            "circle-opacity": 0.9,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
            "circle-stroke-opacity": 0.5,
          },
        });

        // Add cluster count
        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "events",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 14,
            "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Add individual event points
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "events",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#4F46E5",
            "circle-radius": 12,
            "circle-opacity": 0.9,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
            "circle-stroke-opacity": 0.5,
          },
        });
      });

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.current.on("mouseenter", "unclustered-point", (e) => {
        if (!map.current || !e.features?.[0].geometry) return;
        
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        const properties = e.features[0].properties as { title: string; location: string };

        map.current.getCanvas().style.cursor = "pointer";

        popup
          .setLngLat(coordinates)
          .setHTML(
            `<div class="p-2">
              <h3 class="font-semibold">${properties.title}</h3>
              <p class="text-sm text-gray-600">${properties.location}</p>
            </div>`
          )
          .addTo(map.current);
      });

      map.current.on("mouseleave", "unclustered-point", () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = "";
        popup.remove();
      });
    }

    // Update map data when events change
    if (map.current && events.length > 0) {
      const source = map.current.getSource("events") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: events
            .filter((event) => event.latitude && event.longitude)
            .map((event) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [event.longitude!, event.latitude!],
              },
              properties: {
                id: event.id,
                title: event.title,
                location: event.location,
              },
            })),
        });
      }
    }

    // Update map center when centreLatLon changes
    if (map.current && centreLatLon) {
      map.current.flyTo({
        center: [centreLatLon[1], centreLatLon[0]],
        zoom: 11,
        duration: 1500,
        essential: true
      });
    }
  }, [events, centreLatLon]);

  // Add effect to handle hover state with adjusted zoom and animation
  useEffect(() => {
    if (map.current && hoveredEventId && events.length > 0) {
      const hoveredEvent = events.find(event => event.id === hoveredEventId);
      if (hoveredEvent?.latitude && hoveredEvent?.longitude) {
        map.current.flyTo({
          center: [hoveredEvent.longitude, hoveredEvent.latitude],
          zoom: 12,
          duration: 1500,
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          essential: true
        });
      }
    }
  }, [hoveredEventId, events]);

  return <div ref={mapContainer} className={`w-full h-full ${className}`} />;
};

export default Map;

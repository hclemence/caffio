"use client";
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Button } from './ui/button';
import { Locate } from 'lucide-react';

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGNsZW1lbmNlIiwiYSI6ImNtZjFjcnpvbDIzcWYyaXF4ZWhjdTk1emYifQ.AwYpUNAY2Br4VV5zDNYo0g';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/standard',
      center: [-79.4512, 43.6568],
      zoom: 13
    });

    mapRef.current.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl as any
      })
    );
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => mapRef.current?.remove();
  }, []);

    const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
      },
      (err) => {
        alert("Unable to retrieve your location.");
      }
    );
  };

  return <div ref={mapContainerRef} className='h-full w-full' >
    <Button onClick={handleLocate}><Locate /></Button>
    </div>;
};

export default MapboxExample;

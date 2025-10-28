"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { CafeHybrid } from "../types/cafes";
import { AddressType } from "./MapSearch";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
interface MapboxExampleProps {
  address?: AddressType;
  setAddress?: (address: AddressType) => void;
  cafes: CafeHybrid;
  mapRef: React.RefObject<mapboxgl.Map | null>;
}

const MapboxExample = ({ address, setAddress, cafes, mapRef }: MapboxExampleProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // mapRef is now passed as a prop

  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const reverseGeocode = async (longitude: number, latitude: number) => {
    if (!setAddress) return;

    try {
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error("Failed to reverse geocode");
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];

        const properties = feature.properties || {};
        const context = properties.context || {};

        setAddress({
          address1: properties.address_line1 || "",
          address2: properties.address_line2 || "",
          formattedAddress: properties.formatted || feature.place_name || "",
          city: context.place?.name || "",
          region: context.region?.name || "",
          postalCode: context.postcode?.name || "",
          country: context.country?.name || "",
          lat: latitude,
          lng: longitude,
        });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  if (!mapRef) return;

  // Try to get user's location for initial center
  const defaultCenter: [number, number] = [-79.4512, 43.6568];
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCenter: [number, number] = [position.coords.longitude, position.coords.latitude];
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/hclemence/cmf1d9fji000n01s8g7wpcfd9",
          center: userCenter,
          zoom: 13,
        });
        mapRef.current?.addControl(new mapboxgl.NavigationControl(), "top-right");
        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserLocation: true,
        });
        mapRef.current?.addControl(geolocateControl);
        mapRef.current?.on("moveend", () => {
          if (mapRef.current && setAddress) {
            const center = mapRef.current.getCenter();
            reverseGeocode(center.lng, center.lat);
          }
        });
        mapRef.current?.on("geolocate", (e: any) => {
          if (setAddress && e.coords) {
            const { longitude, latitude } = e.coords;
            reverseGeocode(longitude, latitude);
          }
        });
      },
      () => {
        // If user denies location, fallback to default
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/hclemence/cmf1d9fji000n01s8g7wpcfd9",
          center: defaultCenter,
          zoom: 13,
        });
        mapRef.current?.addControl(new mapboxgl.NavigationControl(), "top-right");
        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserLocation: true,
        });
        mapRef.current?.addControl(geolocateControl);
        mapRef.current?.on("moveend", () => {
          if (mapRef.current && setAddress) {
            const center = mapRef.current.getCenter();
            reverseGeocode(center.lng, center.lat);
          }
        });
        mapRef.current?.on("geolocate", (e: any) => {
          if (setAddress && e.coords) {
            const { longitude, latitude } = e.coords;
            reverseGeocode(longitude, latitude);
          }
        });
      }
    );
  } else {
    // If geolocation is not available
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/hclemence/cmf1d9fji000n01s8g7wpcfd9",
      center: defaultCenter,
      zoom: 13,
    });
    mapRef.current?.addControl(new mapboxgl.NavigationControl(), "top-right");
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true,
    });
    mapRef.current?.addControl(geolocateControl);
    mapRef.current?.on("moveend", () => {
      if (mapRef.current && setAddress) {
        const center = mapRef.current.getCenter();
        reverseGeocode(center.lng, center.lat);
      }
    });
    mapRef.current?.on("geolocate", (e: any) => {
      if (setAddress && e.coords) {
        const { longitude, latitude } = e.coords;
        reverseGeocode(longitude, latitude);
      }
    });
  }
    return () => mapRef.current?.remove();
  }, [setAddress, mapRef]);

  useEffect(() => {
  if (!mapRef || !mapRef.current || cafes.array.length === 0) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const markerHeight = 50;
    const markerRadius = 10;
    const linearOffset = 25;
    const popupOffsets: { [key: string]: [number, number] } = {
      top: [0, 0],
      "top-left": [linearOffset, markerHeight * -1],
      "top-right": [-linearOffset, markerHeight * -1],
      bottom: [0, -markerHeight],
      "bottom-left": [
        linearOffset,
        (markerHeight - markerRadius + linearOffset) * -1,
      ],
      "bottom-right": [
        -linearOffset,
        (markerHeight - markerRadius + linearOffset) * -1,
      ],
      left: [markerRadius, (markerHeight - markerRadius) * -1],
      right: [-markerRadius, (markerHeight - markerRadius) * -1],
    };

    cafes.array.forEach((cafe) => {
      // skip cafes without coordinates
      if (cafe.longitude == null || cafe.latitude == null) return;

      const lng = cafe.longitude;
      const lat = cafe.latitude;

      const popup = new mapboxgl.Popup({
        offset: popupOffsets,
        className: "my-class",
      })
        .setHTML(
          `<h1 style="font-weight: bold; margin-bottom: 5px;">${cafe.name}</h1>`
        )
        .setMaxWidth("300px");
      const marker = new mapboxgl.Marker({ color: "#FFD151" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [cafes]);

  return <div ref={mapContainerRef} className="h-full w-full"></div>;
};

export default MapboxExample;

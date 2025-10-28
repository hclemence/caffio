"use client";
import Map from "../components/Map";
import React from "react";
import MapSearch from "@/components/MapSearch";
import { useState } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { Cafe, CafeHybrid } from "../types/cafes";
import HeaderBar from "@/components/HeaderBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CafeList from "@/components/CafeList";

interface AddressType {
  address1: string;
  address2: string;
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

const fetchCafes = async () => {
  const response = await fetch("/api/cafes");
  if (!response.ok) {
    throw new Error("Failed to fetch cafes");
  }
  return response.json();
};

const queryClient = new QueryClient();

export default function Home() {
  const [address, setAddress] = useState<AddressType>({
    address1: "",
    address2: "",
    formattedAddress: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    lat: 0,
    lng: 0,
  });
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const flyTo = (lng: number, lat: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], essential: true });
    }
  };
  const [searchInput, setSearchInput] = useState("");
  const {
    data: cafes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cafes"],
    queryFn: fetchCafes,
  });

  if (isLoading) return <p>Loading cafes...</p>;
  if (error) return <p>Error loading cafes</p>;

  const cafesHybrid: CafeHybrid = cafes
    ? {
        byId: cafes.reduce((acc: Record<string, Cafe>, cafe: Cafe) => {
          acc[cafe.mapbox_id] = cafe;
          return acc;
        }, {}),
        array: cafes,
      }
    : { byId: {}, array: [] };

  return (
    <QueryClientProvider client={queryClient}>
      <HeaderBar />
      <main className="relative h-full w-full">
        <Map
          address={address}
          setAddress={setAddress}
          cafes={cafesHybrid}
          mapRef={mapRef}
        />
        <div className="absolute top-0 bottom-0 left-0 z-20 w-[350px] pointer-events-auto flex flex-col gap-4 min-h-0 p-4 bg-white shadow-[4px_0_16px_rgba(0,0,0,0.3)]">
          <MapSearch
            flyTo={flyTo}
            address={address}
            setAddress={setAddress}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            dialogTitle="Enter Address"
            cafes={cafesHybrid}
            // You can also pass mapRef here if needed
          />
          <div className="flex-1 overflow-y-auto  ">
            <CafeList
              cafes={cafesHybrid}
              currentLat={address.lat}
              currentLng={address.lng}
            />
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}

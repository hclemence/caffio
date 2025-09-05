"use client";
import Map from "../components/Map";
import CafeList from "@/components/CafeList";
import { Card, CardContent } from "@/components/ui/card";
import MapSearch from "@/components/MapSearch";
import { useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Cafe, CafeHybrid } from "../types/cafes";

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
  const [searchInput, setSearchInput] = useState("");
	const { data: cafes, isLoading, error } = useQuery({
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
        array: cafes
      }
    : { byId: {}, array: [] };

  return (
    <QueryClientProvider client={queryClient}>
      <main className="relative h-full w-full">
        <Map 
          address={address}
          setAddress={setAddress}
          cafes={cafesHybrid}
        />
        <div className="absolute top-4 left-4 z-20 w-[350px] pointer-events-auto">
          <MapSearch
            address={address}
            setAddress={setAddress}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            dialogTitle="Enter Address"
            cafes={cafesHybrid}
          />
          {/* <Card>
            <CardContent>
              <CafeList />
            </CardContent>
          </Card> */}
        </div>
      </main>
    </QueryClientProvider>
  );
}

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import type { Cafe, SupabaseCafe } from '../../../types/cafes';
import { randomUUID } from 'crypto';

// Generate a random session token for Mapbox API
function generateSessionToken(): string {
  return randomUUID();
}

export async function GET() {
  try {
    // Fetch curated cafes from Supabase
    const { data: cafes, error } = await supabase
      .from("cafes")
      .select("id, mapbox_id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    
    // Fetch Mapbox POI data for each cafe
    const cafePromises = cafes.map(async (cafe: SupabaseCafe) => {
      try {
        const sessionToken = generateSessionToken();
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${cafe.mapbox_id}?access_token=${mapboxToken}&session_token=${sessionToken}`
        );
        
        if (!response.ok) {
          console.error(`Failed to fetch POI ${cafe.mapbox_id}: ${response.statusText}`);
          return null;
        }
        
        const data = await response.json();
        const feature = data.features?.[0];
        if (!feature) {
          console.warn(`No feature found for POI ${cafe.mapbox_id}`);
          return null;
        }

        return {
          id: cafe.id,
          mapbox_id: cafe.mapbox_id,
          name: feature.text,
          address: feature.properties?.address,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        } as Cafe;
      } catch (error) {
        console.error(`Error fetching POI ${cafe.mapbox_id}:`, error);
        return null;
      }
    });
    
    const results = (await Promise.all(cafePromises)).filter((cafe): cafe is Cafe => cafe !== null);

    return NextResponse.json(results);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown server error' }, 
      { status: 500 }
    );
  }
}

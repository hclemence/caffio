import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import type { Cafe } from "../../../types/cafes";
import { fetchPoi, generateSessionToken } from "../../../lib/mapbox";

export async function GET() {
  try {
    // Fetch curated cafes from Supabase (select all columns)
    // Fetch all columns for cafes
    const { data: cafes, error } = await supabase.from("cafes").select("*");

    if (error) {
      return NextResponse.json({ error: (error as any).message || String(error) }, { status: 500 });
    }

  const cafesTyped = (cafes ?? []) as Cafe[];
  if (cafesTyped.length === 0) return NextResponse.json([]);

    const mapboxToken = process.env.MAPBOX_SERVER_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    // Fetch Mapbox POI data for each cafe
  const cafePromises = cafesTyped.map(async (cafe: Cafe) => {
      try {
        const sessionToken = generateSessionToken();
        const poi = await fetchPoi(cafe.mapbox_id, sessionToken);
        if (!poi) return null;
        return {
          ...cafe,
          // prefer fresh values from Mapbox POI, fall back to existing cafe values
          name: poi.properties?.name ?? cafe.name ?? null,
          full_address: poi.properties?.address ?? poi.properties?.formatted ?? cafe.full_address ?? null,
          latitude: poi.geometry?.coordinates?.[1] ?? cafe.latitude ?? null,
          longitude: poi.geometry?.coordinates?.[0] ?? cafe.longitude ?? null,
          mapbox_data: poi,
        } as Cafe;
      } catch (err) {
        console.error('Error fetching POI for cafe', cafe, err);
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body || {};

    // mapbox_id is required for the new schema
    const mapbox_id = payload.mapbox_id ?? null;
    if (!mapbox_id) {
      return NextResponse.json({ error: 'mapbox_id is required' }, { status: 400 });
    }

    // mapbox_data should contain the raw Mapbox feature (context_json from client)
    const mapbox_data = payload.context_json ?? payload.mapbox_data ?? null;
    if (!mapbox_data) {
      // allow insertion if caller explicitly passes empty object? enforce presence for now
      return NextResponse.json({ error: 'mapbox_data (context_json) is required' }, { status: 400 });
    }

    // Build insert object for the new table shape
    const insertObj: any = {
      mapbox_id: String(mapbox_id),
      name: payload.name ?? null,
      full_address: payload.full_address ?? null,
      latitude: payload.latitude !== undefined && payload.latitude !== null
        ? (typeof payload.latitude === 'string' ? parseFloat(payload.latitude) : payload.latitude)
        : null,
      longitude: payload.longitude !== undefined && payload.longitude !== null
        ? (typeof payload.longitude === 'string' ? parseFloat(payload.longitude) : payload.longitude)
        : null,
      mapbox_data: mapbox_data,
      description: payload.description ?? null,
      website_url: payload.website_url ?? null,
      instagram_url: payload.instagram_url ?? null,
      hero_image_url: payload.hero_image_url ?? null,
      gallery_images: Array.isArray(payload.gallery_images) || typeof payload.gallery_images === 'object'
        ? payload.gallery_images
        : null,
      approved: !!payload.approved,
    };

    const { data, error } = await supabase.from('cafes').insert([insertObj]).select().single();
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: (error as any).message || String(error) }, { status: 500 });
    }

    return NextResponse.json({ cafe: data }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/cafes error:', err);
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 });
  }
}

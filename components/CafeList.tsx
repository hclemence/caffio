"use client";
import React, { useEffect, useState } from "react";
import CafeListCard from "./CafeListCard";
import type { CafeHybrid } from "../types/cafes";
import { formatDistance } from "../lib/utils";

type Props = {
  cafes: CafeHybrid;
  // current location (map center / user location)
  currentLat?: number;
  currentLng?: number;
};

const CafeList = ({ cafes, currentLat, currentLng }: Props) => {
  if (!cafes || cafes.array.length === 0) {
    return <div className="flex flex-col gap-4">No cafes</div>;
  }

  const hasLocation =
    typeof currentLat === "number" &&
    typeof currentLng === "number" &&
    !(currentLat === 0 && currentLng === 0);

  const [apiDistances, setApiDistances] = useState<Record<string, number | undefined>>({});

  // Mapbox Matrix has limits on number of coordinates (total sources+destinations).
  // We'll cap destinations to 24 (1 source + up to 24 destinations = 25 coords).
  const MAX_DESTINATIONS = 24;

  useEffect(() => {
    if (!hasLocation) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    const controller = new AbortController();

    (async () => {
      try {
        const cafesList = cafes.array.slice(0, MAX_DESTINATIONS);
        if (cafesList.length === 0) return;

        // coordinates: source (user) first, then destinations
        const coords = [
          `${currentLng},${currentLat}`,
          ...cafesList.map((c) => `${c.longitude},${c.latitude}`),
        ].join(";");
        console.log("coords for matrix:", coords);

        const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/walking/${coords}?access_token=${token}&annotations=duration,distance`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Matrix API error");

        const data = await res.json();
        const distancesMatrix: (number | null)[][] = data?.distances ?? [];
        const firstRow: (number | null)[] = distancesMatrix[0] ?? [];

        const map: Record<string, number | undefined> = {};
        cafesList.forEach((cafe, idx) => {
          const maybeIndex = firstRow.length === cafesList.length + 1 ? idx + 1 : idx;
          const d = firstRow[maybeIndex];
          map[cafe.uuid] = typeof d === "number" && d !== null ? d : undefined;
        });

        setApiDistances(map);
      } catch (err) {
        // keep apiDistances empty and fall back to haversine
        // eslint-disable-next-line no-console
        console.error("Matrix API failed:", err);
      }
    })();

    return () => controller.abort();
  }, [hasLocation, currentLat, currentLng, cafes.array]);

  const enriched = cafes.array.map((cafe) => {
    const apiDistance = apiDistances[cafe.uuid];
    const distanceMeters =
      typeof apiDistance === "number"
        ? apiDistance
        : undefined;
    return { cafe, distanceMeters };
  });

  if (hasLocation) {
    enriched.sort((a, b) => ( (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity) ));
  }

    return (
    <div className="flex flex-col gap-4">
      {enriched.map(({ cafe, distanceMeters }) => (
        <CafeListCard
          key={cafe.uuid}
          title={cafe.name ?? ""}
          heroImageUrl={cafe.hero_image_url ?? undefined}
          distance={typeof distanceMeters === "number" ? formatDistance(distanceMeters) : undefined}
        />
      ))}
    </div>
  );
};

export default CafeList;
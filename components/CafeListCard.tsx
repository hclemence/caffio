"use client"

import { useMemo } from "react"
import { Card, CardHeader } from "./ui/card"
import Rating from "./Rating"
import { Badge } from "./ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type CafeBadge = "verified" | "roaster" | "food" | "single-origin" | "wifi" | "outdoor"

interface CafeCardProps {
  title: string
  rating?: number
  heroImageUrl?: string
  distance?: string
  badges?: CafeBadge[]
  // expansion removed — component is always non-collapsible
  address?: string
  hours?: string
  phone?: string
  website?: string
  description?: string
}

const badgeConfig: Record<CafeBadge, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  roaster: { label: "Coffee Roaster", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  food: { label: "Food Served", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  "single-origin": { label: "Single Origin", className: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
  wifi: { label: "WiFi", className: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20" },
  outdoor: { label: "Outdoor Seating", className: "bg-green-500/10 text-green-700 border-green-500/20" },
}

export function CafeCard({
  title,
  rating,
  heroImageUrl,
  distance,
  badges = [],
  address,
  hours,
  phone,
  website,
  description,
}: CafeCardProps) {
  // If parent didn't provide a rating, derive a stable pseudo-random rating from the title
  const computedRating = useMemo(() => {
    if (typeof rating === "number") return rating
    let h = 2166136261
    for (let i = 0; i < title.length; i++) {
      h ^= title.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const normalized = (h >>> 0) / 4294967295
    const raw = 3.5 + normalized * 1.5
    return Math.round(raw * 10) / 10
  }, [title, rating])

  return (
    <Card className={"overflow-hidden transition-all duration-300 hover:shadow-md pt-0"}>
      <CardHeader className="p-0">
        {/* Image */}
        <div className="relative">
          <img src={heroImageUrl} alt={title} className="h-40 w-full object-cover rounded-t-xl" />
          {distance && (
            <div className="absolute bottom-2 right-2 rounded-full bg-card/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {distance}
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          {/* Title and Rating */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight text-foreground">{title}</h3>
              {/* expansion removed */}
            </div>
            <Rating rating={computedRating} />
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <Badge key={badge} variant="outline" className={cn("text-xs", badgeConfig[badge].className)}>
                  {badgeConfig[badge].label}
                </Badge>
              ))}
            </div>
          )}

        </div>
      </CardHeader>
    </Card>
  )
}

export default CafeCard

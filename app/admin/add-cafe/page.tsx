"use client";

import React, { useState } from "react";
import { fetchPoi } from "@/lib/mapbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AddCafePage() {
  // local UI state
  const [mapboxId, setMapboxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poiRaw, setPoiRaw] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Zod schema for the form (shadcn/React Hook Form friendly)
  const cafeSchema = z.object({
    mapbox_id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    website_url: z.string().optional().nullable(),
    instagram_url: z.string().optional().nullable(),
    hero_image_url: z.string().optional().nullable(),
    approved: z.boolean().optional(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    place: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    locality: z.string().optional().nullable(),
    region: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    postcode: z.string().optional().nullable(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
  });

  type CafeFormValues = z.infer<typeof cafeSchema>;

  const form = useForm<CafeFormValues>({
    resolver: zodResolver(cafeSchema),
    defaultValues: {
      mapbox_id: "",
      name: "",
      description: "",
      website_url: "",
      instagram_url: "",
      hero_image_url: "",
      approved: false,
      address: "",
      city: "",
      place: "",
      district: "",
      neighborhood: "",
      locality: "",
      region: "",
      country: "",
      postcode: "",
      latitude: null,
      longitude: null,
    },
  });

  // Fetch POI from server and populate form
  async function handleFetch(e?: React.MouseEvent) {
    e?.preventDefault();
    setError(null);
    if (!mapboxId.trim()) {
      setError("Enter a Mapbox POI ID first");
      return;
    }
    setLoading(true);
    try {
      // Use public client token (NEXT_PUBLIC_MAPBOX_TOKEN) by default when calling from the browser
      const feature = await fetchPoi(mapboxId.trim());
      if (!feature) throw new Error("No feature returned from Mapbox");
      setPoiRaw(feature);

      const props = (feature as any)?.properties ?? {};
      const ctx = props.context ?? {};
      console.log("Fetched POI properties:", props);
      const coords = (feature as any)?.geometry?.coordinates ?? [];
      const lat = coords.length >= 2 ? Number(coords[1]) : null;
      const lng = coords.length >= 2 ? Number(coords[0]) : null;

      const current = form.getValues();
      const updates: Partial<Record<string, any>> = {
        mapbox_id: mapboxId.trim(),
        name: props.name ?? current.name,
        // address is already sourced from properties
        address: props.address ?? current.address,
      };

      if (ctx.district) updates.district = ctx.district.name;
      if (ctx.neighborhood) updates.neighborhood = ctx.neighborhood.name;
      if (ctx.locality) updates.locality = ctx.locality.name;
      if (ctx.place) updates.place = ctx.place.name;
      if (ctx.place && !updates.city) updates.city = ctx.place.name;
      if (ctx.postcode) updates.postcode = ctx.postcode.name;
      if (ctx.region) updates.region = ctx.region.name;
      if (ctx.country) updates.country = ctx.country.name;

      updates.latitude = lat;
      updates.longitude = lng;

      form.reset({
        ...current,
        ...updates,
      });
    } catch (err: any) {
      console.error("Fetch POI error:", err);
      setError(err?.message || "Failed to fetch POI");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: CafeFormValues) {
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      // Build payload matching new `cafes` table schema
      const payload = {
        mapbox_id: (values.mapbox_id ?? mapboxId.trim()) || null,
        name: values.name ?? null,
        full_address: poiRaw?.properties?.full_address ?? null,
        latitude: values.latitude ?? null,
        longitude: values.longitude ?? null,
        // send raw Mapbox feature as `mapbox_data` (JSONB)
        mapbox_data: poiRaw ?? null,
        description: values.description ?? null,
        website_url: values.website_url ?? null,
        instagram_url: values.instagram_url ?? null,
        hero_image_url: values.hero_image_url ?? null,
        gallery_images: null,
        approved: values.approved ?? false,
      } as any;

      const res = await fetch("/api/cafes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `status ${res.status}`);
      setSuccess("Cafe added successfully");
    } catch (err: any) {
      console.error("Submit error", err);
      setError(err?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-muted/30 p-4 md:p-8 pb-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Add New Café</h1>
          <p className="text-muted-foreground">
            Fetch café details from Mapbox and add custom information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mapbox Lookup</CardTitle>
            <CardDescription>
              Enter a Mapbox POI ID to fetch café details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mapbox_id">Mapbox POI ID</Label>
              <Input
                id="mapbox_id"
                value={mapboxId}
                onChange={(e) => setMapboxId(e.target.value)}
                placeholder="e.g., poi.123456789"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleFetch}
                disabled={loading}
              >
                {loading ? "Fetching…" : "Fetch from Mapbox"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>POI Details</CardTitle>
              <CardDescription>
                Values fetched from Mapbox (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Name & Address
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">First Line of Address</Label>
                    <Input
                      id="address"
                      {...form.register("address")}
                      placeholder="First Line of Address"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Café name"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Neighborhood</Label>
                    <Input
                      id="neighborhood"
                      {...form.register("neighborhood")}
                      placeholder="Neighborhood"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      {...form.register("district")}
                      placeholder="District"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locality">Locality</Label>
                    <Input
                      id="locality"
                      {...form.register("locality")}
                      placeholder="Locality"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="place">City</Label>
                    <Input
                      id="place"
                      {...form.register("place")}
                      placeholder="City"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      {...form.register("region")}
                      placeholder="Region"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...form.register("country")}
                      placeholder="Country"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      {...form.register("postcode")}
                      placeholder="Postcode"
                      disabled
                    />
                  </div>
                </div>
              </div>
              {/* Coordinates Group */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Coordinates
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      value={String(form.watch("latitude") ?? "")}
                      disabled
                      className="font-mono bg-muted/50"
                      placeholder="0.000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      value={String(form.watch("longitude") ?? "")}
                      disabled
                      className="font-mono bg-muted/50"
                      placeholder="0.000000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Add additional information about the café
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    {...form.register("website_url")}
                    type="url"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    {...form.register("instagram_url")}
                    type="url"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_image_url">Display Image</Label>
                <input
                  id="hero_image_url"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    setError(null);
                    if (!f) return;
                    setUploading(true);
                    try {
                      // local preview
                      const url = URL.createObjectURL(f);
                      setPreviewUrl(url);

                      const fd = new FormData();
                      fd.append("file", f, f.name);

                      const res = await fetch("/api/upload-image", {
                        method: "POST",
                        body: fd,
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json?.error || "Upload failed");
                      // set returned public URL into the form value
                      form.setValue("hero_image_url", json.url);
                    } catch (err: any) {
                      console.error("Image upload error", err);
                      setError(err?.message || "Failed to upload image");
                      setPreviewUrl(null);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />

                {uploading && <p className="text-sm text-muted-foreground">Uploading…</p>}
                {previewUrl && (
                  <img src={previewUrl} alt="preview" className="mt-2 max-h-40 rounded-md object-cover" />
                )}
                {form.watch("hero_image_url") && !previewUrl && (
                  <p className="text-sm text-muted-foreground">Uploaded: {form.watch("hero_image_url")}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <Checkbox
                  id="approved"
                  checked={!!form.watch("approved")}
                  onCheckedChange={(v) => form.setValue("approved", !!v)}
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="approved"
                    className="cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Approved
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Mark this café as approved and ready to publish
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {success && (
                  <p className="text-sm text-foreground">{success}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-brand-1 hover:bg-brand-1/80"
                    disabled={submitting}
                  >
                    {submitting ? "Saving…" : "Add Café"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

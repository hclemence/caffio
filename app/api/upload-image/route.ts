import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${(file as any).name}`;

    const { error: uploadError } = await supabase.storage
      .from("cafe-images")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("cafe-images").getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

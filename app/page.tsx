import dynamic from "next/dynamic";
import Map from "../components/Map";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-full">
      <Map />
    </main>
  );
}

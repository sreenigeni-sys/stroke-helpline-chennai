import { useMemo, useState, type MouseEvent } from "react";
import type { Level, Ownership, Source } from "@/data/hospitals";
import { pinStyle } from "@/components/stroke/pin-style";
import type { Lang } from "@/components/stroke/session";

export type MapPin = {
  id: string;
  name: string;
  ownership: Ownership;
  level: Level;
  address: string;
  phone: string;
  source: Source;
  lastVerified: string;
  lat: number;
  lng: number;
};

type Box = { north: number; south: number; east: number; west: number };

function spread(pins: MapPin[]) {
  const seen = new Map<string, number>();
  return pins.map((pin) => {
    const key = `${pin.lat.toFixed(5)}|${pin.lng.toFixed(5)}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    if (n === 0) return pin;
    const angle = n * 0.85;
    const delta = 0.0011 * n;
    return {
      ...pin,
      lat: pin.lat + Math.sin(angle) * delta,
      lng: pin.lng + Math.cos(angle) * delta,
    };
  });
}

function frame(pins: MapPin[], here: { lat: number; lng: number }): Box {
  let north = here.lat;
  let south = here.lat;
  let east = here.lng;
  let west = here.lng;
  for (const pin of pins) {
    north = Math.max(north, pin.lat);
    south = Math.min(south, pin.lat);
    east = Math.max(east, pin.lng);
    west = Math.min(west, pin.lng);
  }
  const latPad = Math.max(0.012, (north - south) * 0.16);
  const lngPad = Math.max(0.012, (east - west) * 0.16);
  return { north: north + latPad, south: south - latPad, east: east + lngPad, west: west - lngPad };
}

function streetImage(box: Box) {
  const bbox = `${box.west.toFixed(5)},${box.south.toFixed(5)},${box.east.toFixed(5)},${box.north.toFixed(5)}`;
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/export?bbox=${bbox}&bboxSR=4326&size=1000,800&format=png&f=image`;
}

export function HospitalMap({
  pins,
  user,
  center,
  onPick,
  onPlace,
  lang = null,
  tall = false,
}: {
  pins: MapPin[];
  user: { lat: number; lng: number; label?: string } | null;
  center: { lat: number; lng: number };
  onPick: (id: string) => void;
  onPlace: (lat: number, lng: number) => void;
  lang?: Lang | null;
  tall?: boolean;
}) {
  const [wide, setWide] = useState(false);
  const [broken, setBroken] = useState(false);
  const shown = useMemo(() => (wide ? spread(pins) : spread(pins).slice(0, 12)), [pins, wide]);
  const here = user ?? center;
  const box = useMemo(() => frame(shown, here), [shown, here]);
  const image = streetImage(box);

  function place(event: MouseEvent<HTMLDivElement>) {
    if (broken) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    onPlace(box.north - y * (box.north - box.south), box.west + x * (box.east - box.west));
  }

  function spot(lat: number, lng: number) {
    return {
      left: `${((lng - box.west) / (box.east - box.west)) * 100}%`,
      top: `${((box.north - lat) / (box.north - box.south)) * 100}%`,
    };
  }

  return (
    <div className="relative overflow-hidden rounded-card border border-line">
      <div
        className={`relative ${tall ? "map-frame map-frame-tall" : "map-frame"}`}
        onClick={place}
      >
        {broken ? (
          <iframe
            title={lang === "ta" ? "சென்னை சாலைகள்" : "Chennai streets"}
            className="absolute inset-0 h-full w-full border-0"
            src={`https://maps.google.com/maps?q=${here.lat},${here.lng}&z=12&output=embed`}
          />
        ) : (
          <img
            key={image}
            src={image}
            alt={lang === "ta" ? "சென்னை சாலை வரைபடம்" : "Chennai street map"}
            className="absolute inset-0 h-full w-full"
            referrerPolicy="no-referrer"
            onError={() => setBroken(true)}
          />
        )}
        {broken
          ? null
          : shown.map((hospital) => {
              const pin = pinStyle(hospital.level, hospital.ownership);
              const size = hospital.level === "comprehensive" ? 22 : 16;
              return (
                <button
                  key={hospital.id}
                  type="button"
                  title={hospital.name}
                  aria-label={hospital.name}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPick(hospital.id);
                  }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 border-2 border-white"
                  style={{
                    ...spot(hospital.lat, hospital.lng),
                    width: size,
                    height: size,
                    borderRadius: pin.round ? 999 : 4,
                    background: pin.color,
                    boxShadow: "0 0 0 2px #0b1220",
                  }}
                />
              );
            })}
        {broken ? null : (
          <span
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white"
            style={{
              ...spot(here.lat, here.lng),
              width: 16,
              height: 16,
              background: user ? "var(--color-signal)" : "#ffffff",
              boxShadow: user
                ? "0 0 0 6px color-mix(in srgb, var(--color-signal) 28%, transparent)"
                : "0 0 0 2px #14325f",
            }}
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => setWide((value) => !value)}
        className="absolute top-3 left-3 z-30 rounded-full bg-surface px-3 py-2 text-xs font-semibold text-ink shadow-card"
      >
        {wide ? "Zoom to nearest" : "Show all"}
      </button>
    </div>
  );
}

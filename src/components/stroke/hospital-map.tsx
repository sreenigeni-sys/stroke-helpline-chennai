import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
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

function matchAspect(box: Box, aspect: number): Box {
  const latC = (box.north + box.south) / 2;
  const lngC = (box.east + box.west) / 2;
  let latSpan = Math.min(1.4, Math.max(0.012, box.north - box.south));
  let lngSpan = Math.max(0.012, box.east - box.west);
  if (lngSpan / latSpan < aspect) lngSpan = latSpan * aspect;
  else latSpan = Math.min(1.4, lngSpan / aspect);
  lngSpan = latSpan * aspect;
  return {
    north: latC + latSpan / 2,
    south: latC - latSpan / 2,
    east: lngC + lngSpan / 2,
    west: lngC - lngSpan / 2,
  };
}

function shiftBox(box: Box, dx: number, dy: number, scale: number, width: number, height: number, aspect: number): Box {
  const latSpan = box.north - box.south;
  const lngSpan = box.east - box.west;
  const latC = (box.north + box.south) / 2 + (dy / height) * latSpan;
  const lngC = (box.east + box.west) / 2 - (dx / width) * lngSpan;
  const nextLat = latSpan / scale;
  return matchAspect(
    {
      north: latC + nextLat / 2,
      south: latC - nextLat / 2,
      east: lngC + lngSpan / 2,
      west: lngC - lngSpan / 2,
    },
    aspect,
  );
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
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ box: Box; x: number; y: number; dist: number } | null>(null);
  const [wide, setWide] = useState(false);
  const [broken, setBroken] = useState(false);
  const [aspect, setAspect] = useState(1.25);
  const [manual, setManual] = useState<Box | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0, scale: 1 });
  const offsetRef = useRef(offset);
  const placedPins = useMemo(() => spread(pins), [pins]);
  const focus = wide ? placedPins : placedPins.slice(0, 12);
  const here = user ?? center;
  const fitted = useMemo(() => matchAspect(frame(focus, here), aspect), [focus, here, aspect]);
  const box = manual ?? fitted;
  const image = streetImage(box);
  const [live, setLive] = useState(image);
  const [settled, setSettled] = useState<Box | null>(null);
  const pinBox = settled ?? box;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const read = () => setAspect(host.clientWidth / Math.max(1, host.clientHeight));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (image === live) return;
    let cancelled = false;
    const requested = box;
    const pic = new Image();
    pic.onload = () => {
      if (cancelled) return;
      setLive(image);
      setSettled(requested);
      const still = { x: 0, y: 0, scale: 1 };
      offsetRef.current = still;
      setOffset(still);
    };
    pic.onerror = () => {
      if (!cancelled) setBroken(true);
    };
    pic.src = image;
    return () => {
      cancelled = true;
    };
  }, [image, live, box]);

  function zoomBy(scale: number) {
    const host = hostRef.current;
    if (!host) return;
    setManual(shiftBox(pinBox, 0, 0, scale, host.clientWidth, host.clientHeight, aspect));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (broken) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pts = [...pointers.current.values()];
    const midX = pts.reduce((sum, point) => sum + point.x, 0) / pts.length;
    const midY = pts.reduce((sum, point) => sum + point.y, 0) / pts.length;
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { box: pinBox, x: midX, y: midY, dist };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pts = [...pointers.current.values()];
    const midX = pts.reduce((sum, point) => sum + point.x, 0) / pts.length;
    const midY = pts.reduce((sum, point) => sum + point.y, 0) / pts.length;
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : gesture.current.dist;
    const scale = gesture.current.dist > 0 && dist > 0 ? dist / gesture.current.dist : 1;
    const next = { x: midX - gesture.current.x, y: midY - gesture.current.y, scale };
    offsetRef.current = next;
    setOffset(next);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const host = hostRef.current;
    const active = gesture.current;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size > 0 || !active || !host) return;
    const shift = offsetRef.current;
    const moved = Math.hypot(shift.x, shift.y) > 6 || Math.abs(shift.scale - 1) > 0.04;
    gesture.current = null;
    if (!moved) {
      const rect = host.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      onPlace(pinBox.north - y * (pinBox.north - pinBox.south), pinBox.west + x * (pinBox.east - pinBox.west));
      offsetRef.current = { x: 0, y: 0, scale: 1 };
      setOffset({ x: 0, y: 0, scale: 1 });
      return;
    }
    setManual(shiftBox(active.box, shift.x, shift.y, shift.scale, host.clientWidth, host.clientHeight, aspect));
  }

  function spot(lat: number, lng: number) {
    return {
      left: `${((lng - pinBox.west) / (pinBox.east - pinBox.west)) * 100}%`,
      top: `${((pinBox.north - lat) / (pinBox.north - pinBox.south)) * 100}%`,
    };
  }

  return (
    <div className="relative overflow-hidden rounded-card border border-line">
      <div
        ref={hostRef}
        className={`relative touch-none ${tall ? "map-frame map-frame-tall" : "map-frame"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {broken ? (
          <iframe
            title={lang === "ta" ? "சென்னை சாலைகள்" : "Chennai streets"}
            className="absolute inset-0 h-full w-full border-0"
            src={`https://maps.google.com/maps?q=${here.lat},${here.lng}&z=12&output=embed`}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.scale})` }}
          >
            <img
              src={live}
              alt={lang === "ta" ? "சென்னை சாலை வரைபடம்" : "Chennai street map"}
              className="absolute inset-0 h-full w-full"
              referrerPolicy="no-referrer"
              draggable={false}
            />
            {placedPins.map((hospital) => {
              const pin = pinStyle(hospital.level, hospital.ownership);
              const size = hospital.level === "comprehensive" ? 22 : 16;
              return (
                <button
                  key={hospital.id}
                  type="button"
                  title={hospital.name}
                  aria-label={hospital.name}
                  onPointerDown={(event) => event.stopPropagation()}
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
          </div>
        )}
      </div>
      {broken ? null : (
        <p className="pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2 rounded-full bg-surface/95 px-3 py-1 text-[11px] font-semibold text-ink">
          {lang === "ta" ? "இழுத்து நகர்த்துங்கள்" : "Drag to move"}
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          setWide((value) => !value);
          setManual(null);
          offsetRef.current = { x: 0, y: 0, scale: 1 };
          setOffset({ x: 0, y: 0, scale: 1 });
        }}
        className="absolute top-3 left-3 z-30 rounded-full bg-surface px-3 py-2 text-xs font-semibold text-ink shadow-card"
      >
        {wide ? "Zoom to nearest" : "Show all"}
      </button>
      {broken ? null : (
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
          <button
            type="button"
            aria-label={lang === "ta" ? "பெரிதாக்கு" : "Zoom in"}
            onClick={() => zoomBy(1.6)}
            className="flex size-11 items-center justify-center rounded-full bg-surface text-xl font-semibold text-ink shadow-card"
          >
            +
          </button>
          <button
            type="button"
            aria-label={lang === "ta" ? "சிறிதாக்கு" : "Zoom out"}
            onClick={() => zoomBy(0.65)}
            className="flex size-11 items-center justify-center rounded-full bg-surface text-xl font-semibold text-ink shadow-card"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}

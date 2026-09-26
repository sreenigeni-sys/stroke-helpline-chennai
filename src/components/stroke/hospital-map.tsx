import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Level, Ownership } from "@/data/hospitals";
import { hospitalFacts, pathwayLine, serviceWord } from "@/data/hospital-facts";
import type { Lang } from "@/components/stroke/session";

export type MapPin = {
  id: string;
  name: string;
  ownership: Ownership;
  level: Level;
  address: string;
  phone: string;
  lat: number;
  lng: number;
};

type LeafletNs = typeof import("leaflet");

async function loadLeaflet(): Promise<LeafletNs> {
  const mod = await import("leaflet");
  if (typeof mod.map === "function") return mod;
  return mod.default as unknown as LeafletNs;
}

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "\u0026amp;";
      case "<":
        return "\u0026lt;";
      case ">":
        return "\u0026gt;";
      case '"':
        return "\u0026quot;";
      default:
        return "\u0026#39;";
    }
  });
}

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

export function HospitalMap({
  pins,
  user,
  center,
  onPick,
  onPlace,
  lang = null,
}: {
  pins: MapPin[];
  user: { lat: number; lng: number; label?: string } | null;
  center: { lat: number; lng: number };
  onPick: (id: string) => void;
  onPlace: (lat: number, lng: number) => void;
  lang?: Lang | null;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const groupRef = useRef<LayerGroup | null>(null);
  const onPickRef = useRef(onPick);
  const onPlaceRef = useRef(onPlace);
  onPickRef.current = onPick;
  onPlaceRef.current = onPlace;
  const [ready, setReady] = useState(false);
  const [wide, setWide] = useState(false);
  const pinKey = pins.map((pin) => pin.id).join("|");
  const userKey = user ? `${user.lat.toFixed(4)},${user.lng.toFixed(4)},${user.label ?? ""}` : "city";

  useEffect(() => {
    const host = elRef.current;
    if (!host) return;
    let cancelled = false;
    let map: LeafletMap | null = null;
    let observer: ResizeObserver | null = null;

    void (async () => {
      const L = await loadLeaflet();
      if (cancelled || !elRef.current) return;
      map = L.map(elRef.current, { scrollWheelZoom: true, zoomControl: false }).setView(
        [center.lat, center.lng],
        11,
      );
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      groupRef.current = L.layerGroup().addTo(map);
      map.on("click", (event) => {
        onPlaceRef.current(event.latlng.lat, event.latlng.lng);
      });
      mapRef.current = map;
      if (cancelled) {
        map.remove();
        mapRef.current = null;
        groupRef.current = null;
        return;
      }
      setReady(true);
      requestAnimationFrame(() => map?.invalidateSize());
      const resize = new ResizeObserver(() => map?.invalidateSize());
      observer = resize;
      if (cancelled || !elRef.current) {
        resize.disconnect();
        return;
      }
      resize.observe(elRef.current);
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
      groupRef.current = null;
      setReady(false);
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const group = groupRef.current;
    if (!map || !group) return;
    let cancelled = false;

    void (async () => {
      const L = await loadLeaflet();
      if (cancelled || !mapRef.current || !groupRef.current) return;
      group.clearLayers();
      const shown = spread(pins);
      for (const hospital of shown) {
        const comprehensive = hospital.level === "comprehensive";
        const gov = hospital.ownership === "Government";
        const color = comprehensive
          ? gov
            ? "#3dff9a"
            : "#d6ff4a"
          : gov
            ? "#4cc3ff"
            : "#ffb020";
        const size = comprehensive ? 22 : 15;
        const radius = gov ? "4px" : "999px";
        const icon = L.divIcon({
          className: "stroke-pin",
          html: `<div style="width:${size}px;height:${size}px;border-radius:${radius};background:${color};border:3px solid #0b1220;box-shadow:${
            comprehensive
              ? "0 0 0 4px color-mix(in srgb, " + color + " 55%, transparent), 0 2px 6px rgba(0,0,0,.45)"
              : "0 2px 6px rgba(0,0,0,.45)"
          }"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        const facts = hospitalFacts(hospital.id);
        const tamil = lang === "ta";
        const owner = tamil ? (gov ? "அரசு" : "தனியார்") : hospital.ownership;
        const services = tamil
          ? `24/7 சிடி: ${serviceWord(facts.ct, lang)}<br/>24/7 எம்ஆர்ஐ: ${serviceWord(facts.mri, lang)}<br/>24/7 த்ராம்பெக்டமி: ${serviceWord(facts.thrombectomy, lang)}`
          : `24/7 CT: ${serviceWord(facts.ct)}<br/>24/7 MRI: ${serviceWord(facts.mri)}<br/>24/7 thrombectomy: ${serviceWord(facts.thrombectomy)}`;
        const note = pathwayLine(hospital.id, lang);
        const pathway = note ? `<br/>${esc(note)}` : "";
        const phone = hospital.phone ? `<br/>${tamil ? "அழை" : "Call"} ${esc(hospital.phone)}` : "";
        const marker = L.marker([hospital.lat, hospital.lng], {
          icon,
          zIndexOffset: comprehensive ? 400 : 0,
        }).addTo(group);
        marker.bindPopup(
          `<strong>${esc(hospital.name)}</strong><br/>${esc(owner)}<br/>${services}${pathway}${phone}`,
        );
        marker.on("click", (event) => {
          if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
          onPickRef.current(hospital.id);
        });
      }

      const here = user ?? center;
      const hereIcon = L.divIcon({
        className: "stroke-pin",
        html: user
          ? `<div style="width:16px;height:16px;border-radius:999px;background:var(--color-signal);border:3px solid #ffffff;box-shadow:0 0 0 6px color-mix(in srgb, var(--color-signal) 28%, transparent)"></div>`
          : `<div style="width:14px;height:14px;border-radius:999px;background:#ffffff;border:2px solid #14325f"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([here.lat, here.lng], { icon: hereIcon, zIndexOffset: 800 })
        .addTo(group)
        .bindPopup(user?.label ?? (user ? (lang === "ta" ? "நீங்கள் இங்கே" : "You are here") : lang === "ta" ? "சென்னை மையம்" : "Chennai centre"));

      const focus = wide ? shown : shown.slice(0, 10);
      const points = focus.map((pin) => L.latLng(pin.lat, pin.lng));
      points.push(L.latLng(here.lat, here.lng));
      map.invalidateSize();
      if (points.length > 0) {
        map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 14 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, pinKey, userKey, wide, pins, user, center, lang]);

  return (
    <div className="relative overflow-hidden rounded-card border border-line">
      <div ref={elRef} className="map-frame" />
      <button
        type="button"
        onClick={() => setWide((value) => !value)}
        className="absolute top-3 left-3 z-10 rounded-full bg-surface px-3 py-2 text-xs font-semibold text-ink shadow-card"
      >
        {wide ? "Zoom to nearest" : "Show all"}
      </button>
    </div>
  );
}

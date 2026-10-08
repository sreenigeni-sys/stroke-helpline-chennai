import { useEffect, useRef, useState } from "react";
import type { Circle, LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Minus, Plus } from "lucide-react";
import type { Level, Ownership, Source } from "@/data/hospitals";
import { pinStyle } from "@/components/stroke/pin-style";
import type { Lang } from "@/components/stroke/session";
import { useReduceMotion } from "@/lib/reduce-motion";

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

type LeafletNs = typeof import("leaflet");
type Here = { lat: number; lng: number; label?: string; accuracy?: number };

// Esri first; OpenStreetMap only if Esri tiles never load.
const ESRI_STREETS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const OSM_STREETS = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const GOOGLE_BLUE = "#1a73e8";

async function loadLeaflet(): Promise<LeafletNs> {
  const mod = await import("leaflet");
  if (typeof mod.map === "function") return mod;
  return mod.default as unknown as LeafletNs;
}

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
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
    return { ...pin, lat: pin.lat + Math.sin(angle) * delta, lng: pin.lng + Math.cos(angle) * delta };
  });
}

/** Google-style teardrop. The white glyph keeps the legend's square = government, circle = private. */
function pinHtml(color: string, round: boolean, width: number, height: number) {
  const glyph = round
    ? `<circle cx="12" cy="11.5" r="4" fill="#fff"/>`
    : `<rect x="8" y="7.5" width="8" height="8" rx="1.5" fill="#fff"/>`;
  return `<svg class="gpin" width="${width}" height="${height}" viewBox="0 0 24 32" aria-hidden="true"><path d="M12 1C6.2 1 1.5 5.6 1.5 11.5 1.5 19.6 12 31 12 31s10.5-11.4 10.5-19.5C22.5 5.6 17.8 1 12 1z" fill="${color}" stroke="#fff" stroke-width="1.5"/>${glyph}</svg>`;
}

function hereHtml(gps: boolean) {
  return gps
    ? `<span class="ghere"></span>`
    : `<span class="ghere ghere-centre"></span>`;
}

export function HospitalMap({
  pins,
  user,
  center,
  onPick,
  onPlace,
  onLocate,
  activeId = null,
  lang = null,
  tall = false,
}: {
  pins: MapPin[];
  user: Here | null;
  center: { lat: number; lng: number };
  onPick: (id: string) => void;
  onPlace: (lat: number, lng: number) => void;
  onLocate?: () => void;
  activeId?: string | null;
  lang?: Lang | null;
  tall?: boolean;
}) {
  const ta = lang === "ta";
  const reduce = useReduceMotion();
  const elRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletNs | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const pinLayerRef = useRef<LayerGroup | null>(null);
  const hereLayerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const latest = useRef({ onPick, onPlace, reduce, ta });
  latest.current = { onPick, onPlace, reduce, ta };
  const [ready, setReady] = useState(false);
  const [wide, setWide] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<number | undefined>(undefined);

  const shown = spread(pins);
  const pinKey = pins.map((pin) => pin.id).join("|");
  const here: Here = user ?? center;
  const userKey = user ? `${user.lat.toFixed(5)},${user.lng.toFixed(5)},${user.label ?? ""},${user.accuracy ?? ""}` : "city";

  function flashHint(text: string) {
    setHint(text);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 1400);
  }

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let observer: ResizeObserver | null = null;
    let wheelTimer: number | undefined;
    let clickTimer: number | undefined;
    const host = elRef.current;
    const markers = markersRef.current;
    const cleanups: Array<() => void> = [];

    void (async () => {
      const L = await loadLeaflet();
      if (cancelled || !elRef.current) return;
      leafletRef.current = L;
      const mobile = L.Browser.mobile;
      map = L.map(elRef.current, {
        center: [center.lat, center.lng],
        zoom: 12,
        zoomControl: false,
        // Google-style cooperative gestures: on phones one finger scrolls the
        // page and two fingers move/zoom the map; on desktop, ctrl/⌘ + scroll.
        dragging: !mobile,
        touchZoom: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        zoomSnap: 1,
        minZoom: 9,
        maxZoom: 19,
        worldCopyJump: false,
      });
      map.attributionControl.setPrefix(false);

      let layer: TileLayer | null = null;
      let loaded = 0;
      let errors = 0;
      let backup = false;
      const addTiles = (url: string, attribution: string) => {
        const next = L.tileLayer(url, { attribution, maxZoom: 19, maxNativeZoom: 19 });
        next.on("tileload", () => {
          loaded += 1;
          setTilesFailed(false);
        });
        next.on("tileerror", () => {
          errors += 1;
          if (loaded > 0 || errors < 4 || !map) return;
          if (!backup) {
            backup = true;
            errors = 0;
            map.removeLayer(next);
            layer = addTiles(OSM_STREETS, "&copy; OpenStreetMap contributors");
          } else {
            setTilesFailed(true);
          }
        });
        return next.addTo(map!);
      };
      layer = addTiles(ESRI_STREETS, "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors");
      void layer;

      pinLayerRef.current = L.layerGroup().addTo(map);
      hereLayerRef.current = L.layerGroup().addTo(map);

      // Single tap drops a pin; a double tap only zooms (Google behaviour).
      map.on("click", (event) => {
        window.clearTimeout(clickTimer);
        clickTimer = window.setTimeout(() => latest.current.onPlace(event.latlng.lat, event.latlng.lng), 260);
      });
      map.on("dblclick", () => window.clearTimeout(clickTimer));

      const container = map.getContainer();
      const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
      let wheelDelta = 0;
      let wheelPoint = map.getSize().divideBy(2);
      const onWheel = (event: WheelEvent) => {
        if (!map) return;
        if (!(event.ctrlKey || event.metaKey)) {
          flashHint(
            latest.current.ta
              ? `வரைபடத்தைப் பெரிதாக்க ${isMac ? "⌘" : "ctrl"} + scroll பயன்படுத்துங்கள்`
              : `Use ${isMac ? "⌘" : "ctrl"} + scroll to zoom the map`,
          );
          return;
        }
        event.preventDefault();
        wheelDelta += event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY;
        wheelPoint = map.mouseEventToContainerPoint(event);
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          if (!map) return;
          const raw = -wheelDelta / 60;
          wheelDelta = 0;
          const steps = Math.max(-3, Math.min(3, Math.trunc(raw) || Math.sign(raw)));
          if (steps) map.setZoomAround(wheelPoint, map.getZoom() + steps, { animate: !latest.current.reduce });
        }, 40);
      };
      const onTouchMove = (event: TouchEvent) => {
        if (mobile && event.touches.length === 1) {
          flashHint(
            latest.current.ta
              ? "வரைபடத்தை நகர்த்த இரண்டு விரல்களைப் பயன்படுத்துங்கள்"
              : "Use two fingers to move the map",
          );
        }
      };
      container.addEventListener("wheel", onWheel, { passive: false });
      container.addEventListener("touchmove", onTouchMove, { passive: true });
      cleanups.push(() => {
        container.removeEventListener("wheel", onWheel);
        container.removeEventListener("touchmove", onTouchMove);
      });

      mapRef.current = map;
      setReady(true);
      requestAnimationFrame(() => map?.invalidateSize());
      observer = new ResizeObserver(() => map?.invalidateSize());
      if (host) observer.observe(host);
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(wheelTimer);
      window.clearTimeout(clickTimer);
      window.clearTimeout(hintTimer.current);
      for (const cleanup of cleanups) cleanup();
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
      pinLayerRef.current = null;
      hereLayerRef.current = null;
      markers.clear();
      setReady(false);
    };
    // The map is created once; later prop changes are applied by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hospital pins: all of them, so panning reveals the rest like Google Maps.
  useEffect(() => {
    const L = leafletRef.current;
    const layer = pinLayerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    for (const hospital of shown) {
      const style = pinStyle(hospital.level, hospital.ownership);
      const selected = hospital.id === activeId;
      const big = hospital.level === "comprehensive";
      const width = Math.round((big ? 30 : 24) * (selected ? 1.3 : 1));
      const height = Math.round(width * (32 / 24));
      const marker = L.marker([hospital.lat, hospital.lng], {
        icon: L.divIcon({
          className: selected ? "stroke-pin stroke-pin-active" : "stroke-pin",
          html: pinHtml(style.color, style.round, width, height),
          iconSize: [width, height],
          iconAnchor: [width / 2, height],
          tooltipAnchor: [0, -height],
        }),
        title: hospital.name,
        keyboard: true,
        riseOnHover: true,
        zIndexOffset: selected ? 2000 : big ? 400 : 0,
      });
      marker.bindTooltip(esc(hospital.name), { direction: "top", opacity: 0.96, className: "gpin-label" });
      marker.on("click", (event) => {
        if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
        latest.current.onPick(hospital.id);
      });
      marker.addTo(layer);
      markersRef.current.set(hospital.id, marker);
    }
    // `shown` is derived from `pins`; pinKey captures its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pinKey, activeId]);

  // "You are here" (or Chennai centre) dot, with a GPS accuracy halo.
  useEffect(() => {
    const L = leafletRef.current;
    const layer = hereLayerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    const gps = Boolean(user) && !user?.label;
    if (gps && user?.accuracy && user.accuracy > 15) {
      const halo: Circle = L.circle([here.lat, here.lng], {
        radius: user.accuracy,
        color: GOOGLE_BLUE,
        weight: 1,
        opacity: 0.4,
        fillColor: GOOGLE_BLUE,
        fillOpacity: 0.12,
        interactive: false,
      });
      halo.addTo(layer);
    }
    const label = user?.label ?? (user ? (ta ? "நீங்கள் இங்கே" : "You are here") : ta ? "சென்னை மையம்" : "Chennai centre");
    L.marker([here.lat, here.lng], {
      icon: L.divIcon({ className: "stroke-pin", html: hereHtml(Boolean(user)), iconSize: [22, 22], iconAnchor: [11, 11] }),
      zIndexOffset: 3000,
      keyboard: false,
      interactive: true,
    })
      .bindTooltip(esc(label), { direction: "top", offset: [0, -10], className: "gpin-label" })
      .addTo(layer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userKey, ta]);

  // Frame the nearest hospitals (or all) whenever the list or origin changes.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    const focus = wide ? shown : shown.slice(0, 8);
    const points = focus.map((pin) => L.latLng(pin.lat, pin.lng));
    points.push(L.latLng(here.lat, here.lng));
    map.invalidateSize();
    map.fitBounds(L.latLngBounds(points), {
      padding: [40, 40],
      maxZoom: 15,
      animate: !reduce,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pinKey, userKey, wide, tall]);

  // Keep the selected hospital in view, like Google pans to a tapped place.
  useEffect(() => {
    const map = mapRef.current;
    const marker = activeId ? markersRef.current.get(activeId) : undefined;
    if (!ready || !map || !marker) return;
    map.panInside(marker.getLatLng(), { padding: [60, 60], animate: !reduce });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, activeId]);

  function zoom(by: number) {
    mapRef.current?.setZoom((mapRef.current?.getZoom() ?? 12) + by, { animate: !reduce });
  }

  function showMe() {
    const map = mapRef.current;
    if (user && map) {
      map.setView([user.lat, user.lng], Math.max(map.getZoom(), 14), { animate: !reduce });
      return;
    }
    onLocate?.();
  }

  const control =
    "flex size-10 items-center justify-center bg-white text-[#5f6368] hover:bg-[#f1f3f4] active:bg-[#e8eaed] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1a73e8]";

  return (
    <div className="relative overflow-hidden rounded-card border border-line">
      {/* Leaflet adds its own classes to the map div, so React must never
          re-render that div's className — it lives inside a sized frame. */}
      <div className={tall ? "map-frame map-frame-tall relative" : "map-frame relative"}>
        <div ref={elRef} className="absolute inset-0" />
      </div>

      <button
        type="button"
        onClick={() => setWide((value) => !value)}
        className="absolute top-3 left-3 z-10 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#3c4043] shadow-[0_1px_4px_rgba(0,0,0,0.3)] hover:bg-[#f1f3f4]"
      >
        {wide ? (ta ? "அருகிலுள்ளவை" : "Zoom to nearest") : ta ? "அனைத்தும்" : "Show all"}
      </button>

      <div className="absolute right-2.5 bottom-7 z-10 flex flex-col items-end gap-2.5">
        <button
          type="button"
          onClick={showMe}
          aria-label={ta ? "என் இடத்தைக் காட்டு" : "Show my location"}
          title={ta ? "என் இடத்தைக் காட்டு" : "Show my location"}
          className={`${control} rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.3)]`}
        >
          <LocateFixed className={user && !user.label ? "size-5 text-[#1a73e8]" : "size-5"} aria-hidden="true" />
        </button>
        <div className="flex flex-col overflow-hidden rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
          <button
            type="button"
            onClick={() => zoom(1)}
            aria-label={ta ? "பெரிதாக்கு" : "Zoom in"}
            title={ta ? "பெரிதாக்கு" : "Zoom in"}
            className={control}
          >
            <Plus className="size-5" aria-hidden="true" />
          </button>
          <span className="mx-2 h-px bg-[#e6e6e6]" aria-hidden="true" />
          <button
            type="button"
            onClick={() => zoom(-1)}
            aria-label={ta ? "சிறிதாக்கு" : "Zoom out"}
            title={ta ? "சிறிதாக்கு" : "Zoom out"}
            className={control}
          >
            <Minus className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {hint ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-6 text-center text-base font-medium text-white"
          role="status"
        >
          {hint}
        </div>
      ) : null}

      {tilesFailed ? (
        <p className="absolute inset-x-3 top-14 z-10 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-ink shadow-card" role="status">
          {ta
            ? "சாலை வரைபடம் ஏற்றப்படவில்லை. மருத்துவமனைகளின் இடங்களை முள்கள் இன்னும் காட்டுகின்றன."
            : "Street map didn't load. The pins still show where each hospital is."}
        </p>
      ) : null}
    </div>
  );
}

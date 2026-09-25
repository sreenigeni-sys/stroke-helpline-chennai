import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation, Phone } from "lucide-react";
import { CHENNAI_CENTER, HOSPITALS, type Hospital } from "@/data/hospitals";
import { cn } from "@/lib/cn";
import { distanceKm, formatDistance } from "@/lib/geo";
import { Countdown } from "@/components/stroke/countdown";
import { HospitalMap } from "@/components/stroke/hospital-map";
import { markedWords, type Session } from "@/components/stroke/session";

const TAP = "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]";

type TierFilter = "all" | "comprehensive";
type OwnFilter = "all" | "Government" | "Private";

function canCall(phone: string) {
  return /^\+?[0-9]{3,15}$/.test(phone);
}

function isGeoError(error: unknown): error is GeolocationPositionError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as GeolocationPositionError).code === "number"
  );
}

function readPosition(options: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    let settled = false;
    const finish = (run: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      navigator.geolocation.clearWatch(watchId);
      run();
    };
    const timer = window.setTimeout(() => {
      finish(() => reject(Object.assign(new Error("timeout"), { code: 3 })));
    }, (options.timeout ?? 20000) + 1000);
    const watchId = navigator.geolocation.watchPosition(
      (position) => finish(() => resolve(position)),
      (error) => finish(() => reject(error)),
      options,
    );
  });
}

function locateMessage(error: unknown) {
  if (isGeoError(error) && error.code === 1) {
    return "Location is blocked. Allow it for this site in the browser, then tap again.";
  }
  return "Couldn't get a fix. Turn location on, step nearer a window, and tap again.";
}

export function Locator({
  answers,
  onsetIso,
  user,
  concern,
  onEditTime,
  onRecheck,
  onUser,
}: {
  answers: Session["answers"];
  onsetIso: string | null;
  user: Session["user"];
  concern: "yes" | "unsure" | "clear" | "skipped";
  onEditTime: () => void;
  onRecheck: () => void;
  onUser: (user: Session["user"]) => void;
}) {
  const [tier, setTier] = useState<TierFilter>("all");
  const [ownership, setOwnership] = useState<OwnFilter>("all");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const asked = useRef(false);

  const origin = user ?? CHENNAI_CENTER;
  const rows = useMemo(() => {
    return HOSPITALS.filter((hospital) => {
      if (tier === "comprehensive" && hospital.level !== "comprehensive") return false;
      if (ownership !== "all" && hospital.ownership !== ownership) return false;
      return true;
    })
      .map((hospital) => ({
        ...hospital,
        dist: distanceKm(origin.lat, origin.lng, hospital.lat, hospital.lng),
      }))
      .sort((a, b) => a.dist - b.dist);
  }, [origin.lat, origin.lng, ownership, tier]);

  const yes = markedWords(answers, "yes");
  const unsure = markedWords(answers, "unsure");

  async function locate() {
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocError("This browser can't share location. Open the link in Chrome or Safari.");
      return;
    }
    setLocating(true);
    setLocError(null);
    try {
      let position: GeolocationPosition;
      try {
        position = await readPosition({
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 120_000,
        });
      } catch (error) {
        if (isGeoError(error) && error.code === 1) throw error;
        position = await readPosition({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
      }
      let accuracy = position.coords.accuracy;
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("bad fix");
      }
      onUser({ lat: latitude, lng: longitude, at: Date.now(), accuracy });
      if (accuracy > 300) {
        try {
          const better = await readPosition({
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          });
          if (
            Number.isFinite(better.coords.latitude) &&
            better.coords.accuracy < accuracy
          ) {
            accuracy = better.coords.accuracy;
            onUser({
              lat: better.coords.latitude,
              lng: better.coords.longitude,
              at: Date.now(),
              accuracy,
            });
          }
        } catch {
          // Keep the first fix. A rough point is still better than the city centre.
        }
      }
      if (accuracy > 2000) {
        setLocError(
          `Rough location, about ${Math.max(1, Math.round(accuracy / 1000))} km. Tap again if the nearest hospital looks wrong.`,
        );
      }
    } catch (error) {
      setLocError(locateMessage(error));
    } finally {
      setLocating(false);
    }
  }

  useEffect(() => {
    if (asked.current) return;
    const fresh = user?.at && Date.now() - user.at < 2 * 60 * 1000;
    if (fresh) return;
    asked.current = true;
    void locate();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {concern === "yes" ? (
        <div className="mb-4 rounded-card bg-signal px-4 py-3 text-ink">
          <p className="font-semibold">Possible stroke signs: {yes.join(", ")}.</p>
          <p className="mt-1 text-sm">
            If you travel, call the hospital before you arrive — teams and scanners change by the
            hour.
          </p>
        </div>
      ) : null}
      {concern === "unsure" ? (
        <div className="mb-4 rounded-card bg-late-soft px-4 py-3 text-late-ink">
          <p className="font-semibold">Not sure about: {unsure.join(", ")}.</p>
          <p className="mt-1 text-sm">Treat that as urgent.</p>
        </div>
      ) : null}
      {concern === "clear" ? (
        <div className="mb-4 rounded-card border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
          You did not mark a BEFAST sign. That does not rule out a stroke. If something still feels
          wrong, call the hospital before you go.
        </div>
      ) : null}

      <Countdown onsetIso={onsetIso} onEdit={onEditTime} />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className={cn(
            "h-14 flex-1 rounded-full bg-signal text-base font-semibold text-ink disabled:opacity-60",
            TAP,
          )}
        >
          {locating ? "Finding you…" : user ? "Update my location" : "Find nearest to me"}
        </button>
        {user ? (
          <button
            type="button"
            onClick={() => onUser(null)}
            className={cn(
              "h-14 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink",
              TAP,
            )}
          >
            Use city centre
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-ink-soft" role="status">
        {rows.length} hospital{rows.length === 1 ? "" : "s"} · sorted{" "}
        {user
          ? `from you${
              user.accuracy && user.accuracy >= 50
                ? `, about ${
                    user.accuracy < 1000
                      ? `${Math.round(user.accuracy / 10) * 10} m`
                      : `${Math.max(1, Math.round(user.accuracy / 1000))} km`
                  }`
                : ""
            }`
          : "from Chennai centre"}
      </p>
      {locError ? (
        <p className="mt-2 text-sm font-semibold text-signal" role="alert">
          {locError}
        </p>
      ) : null}

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <div>
          <FilterRow
            label="Capability"
            value={tier}
            options={[
              { id: "all", label: "All tiers", active: "border-transparent bg-[#f4efe6] text-[#071018]" },
              { id: "comprehensive", label: "Comprehensive", active: "border-transparent bg-[#3dff9a] text-[#062016]" },
            ]}
            onChange={setTier}
          />
          <FilterRow
            label="Hospital type"
            value={ownership}
            options={[
              { id: "all", label: "Gov + private", active: "border-transparent bg-[#f4efe6] text-[#071018]" },
              { id: "Government", label: "Government", active: "border-transparent bg-[#4cc3ff] text-[#041820]" },
              { id: "Private", label: "Private", active: "border-transparent bg-[#ffb020] text-[#2a1400]" },
            ]}
            onChange={setOwnership}
          />
          <ul className="mt-3 mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-ink">
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[#3dff9a]" aria-hidden="true" />
              Gov comprehensive
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-[#d6ff4a]" aria-hidden="true" />
              Private comprehensive
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[#4cc3ff]" aria-hidden="true" />
              Gov stroke-ready
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-[#ffb020]" aria-hidden="true" />
              Private stroke-ready
            </li>
          </ul>
          <HospitalMap
            pins={rows}
            user={user}
            center={CHENNAI_CENTER}
            onPick={(id) => {
              setActiveId(id);
              document.getElementById(`hospital-${id}`)?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <h1 className="font-display text-3xl leading-tight">Nearest hospitals</h1>
            <button
              type="button"
              onClick={onRecheck}
              className="mb-1 shrink-0 text-sm font-semibold text-ink-soft"
            >
              Check signs again
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="rounded-card border border-line bg-surface px-4 py-8 text-center font-semibold text-signal">
              No hospitals match this filter.
            </p>
          ) : (
            rows.map((hospital, index) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                active={activeId === hospital.id}
                fromYou={Boolean(user)}
                index={index}
              />
            ))
          )}
          <footer className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
            <p>
              <strong className="text-ink">This app does not diagnose stroke</strong> and does not
              dispatch an ambulance.
            </p>
            <p className="mt-2">
              The green clock is 4.5 hours from the time you entered — a window often cited for
              clot-busting medicine. The orange clock is 9 hours — a later window some centres
              still assess. Only the hospital team can decide, after an exam and scans.
            </p>
            <p className="mt-2">
              Labels come from public pages and clinician review, dated on each card. They are not
              a government certificate. Call ahead to confirm who is on duty.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; active?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="mb-2">
      <legend className="sr-only">{label}</legend>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "h-11 flex-1 rounded-full border text-xs font-semibold",
              TAP,
              value === option.id
                ? (option.active ?? "border-transparent bg-[#f4efe6] text-[#071018]")
                : "border-line bg-transparent text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function HospitalCard({
  hospital,
  active,
  fromYou,
  index,
}: {
  hospital: Hospital & { dist: number };
  active: boolean;
  fromYou: boolean;
  index: number;
}) {
  const callable = canCall(hospital.phone);
  const comprehensive = hospital.level === "comprehensive";
  const gov = hospital.ownership === "Government";
  const tab = comprehensive
    ? gov
      ? "bg-[#3dff9a] text-[#062016]"
      : "bg-[#d6ff4a] text-[#1a2400]"
    : gov
      ? "bg-[#4cc3ff] text-[#041820]"
      : "bg-[#ffb020] text-[#2a1400]";
  return (
    <article
      id={`hospital-${hospital.id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className={cn(
        "rise overflow-hidden rounded-card border border-line bg-surface shadow-card",
        active && "ring-2 ring-[#f4efe6]",
      )}
    >
      <div className={cn("flex items-center justify-between gap-3 px-4 py-2.5", tab)}>
        <p className="text-xs font-extrabold tracking-[0.16em] uppercase">
          {gov ? "Government" : "Private"}
          <span className="px-1.5 opacity-60">·</span>
          {comprehensive ? "Comprehensive" : "Stroke-ready"}
        </p>
        <span className="shrink-0 rounded-full bg-[#071018]/15 px-3 py-1 text-sm font-semibold tabular-nums">
          {formatDistance(hospital.dist)}
          <span className="sr-only"> {fromYou ? "from you" : "from Chennai centre"}</span>
        </span>
      </div>
      <div className="p-4">
      <h2 className="text-lg leading-snug font-semibold">{hospital.name}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {hospital.address}
        {hospital.area ? ` · ${hospital.area}` : ""}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        <li
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            hospital.source === "clinician_verified" ? "bg-ok-soft text-ok" : "bg-paper-deep text-ink-soft",
          )}
        >
          {hospital.source === "clinician_verified" ? "Clinician-reviewed" : "Public sources"}
        </li>
      </ul>
      <p className="mt-3 rounded-xl bg-paper-deep px-3 py-2 text-sm leading-snug text-ink">
        <span className="font-semibold">Notes. </span>
        {hospital.notes}
      </p>
      <p className="mt-2 text-sm font-medium text-late-ink">{hospital.verify}</p>
      <p className="mt-1 text-xs text-ink-soft">Last reviewed {hospital.lastVerified}. Call ahead.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {callable ? (
          <a
            href={`tel:${hospital.phone}`}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-full bg-ok text-sm font-semibold text-[#062016]",
              TAP,
            )}
          >
            <Phone className="size-4" aria-hidden="true" />
            {hospital.phone.length <= 6 ? `Call ${hospital.phone}` : "Call"}
          </a>
        ) : (
          <span className="flex h-11 items-center justify-center rounded-full bg-paper-deep text-sm font-semibold text-ink-soft">
            No public number
          </span>
        )}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "flex h-11 items-center justify-center gap-2 rounded-full bg-[#f4efe6] text-sm font-semibold text-[#071018]",
            TAP,
          )}
        >
          <Navigation className="size-4" aria-hidden="true" />
          Navigate
        </a>
      </div>
      </div>
    </article>
  );
}

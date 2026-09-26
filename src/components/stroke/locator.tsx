import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation, Phone } from "lucide-react";
import { CHENNAI_CENTER, HOSPITALS, type Hospital } from "@/data/hospitals";
import { PLACES, type Place } from "@/data/places";
import { cn } from "@/lib/cn";
import { distanceKm, formatDistance } from "@/lib/geo";
import { Countdown } from "@/components/stroke/countdown";
import { HospitalMap } from "@/components/stroke/hospital-map";
import { readClock } from "@/lib/clock";
import { recordStrokeCall } from "@/components/stroke/activity.functions";
import { markedWords, type Lang, type Session } from "@/components/stroke/session";
import { hospitalFacts, pathwayLine, serviceWord } from "@/data/hospital-facts";
import { locatorCopy } from "@/components/stroke/locator-copy";
import { beginGps, cancelGps, followGps, type GpsFix } from "@/components/stroke/gps";

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

function matchPlaces(query: string) {
  const q = query.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
  if (!q) return PLACES.slice(0, 6);
  return PLACES.filter((place) => {
    if (place.name.toLowerCase().includes(q)) return true;
    return (place.aliases ?? []).some((alias) => alias.includes(q));
  }).slice(0, 8);
}

function locateMessage(error: unknown, tamil: boolean) {
  if (isGeoError(error) && error.code === 1) {
    return tamil
      ? "இடம் தடுக்கப்பட்டுள்ளது. உலாவியில் இந்தத் தளத்துக்கு அனுமதி கொடுத்து, மீண்டும் தொடுங்கள்."
      : "Location is blocked. Allow it for this site in the browser, then tap again.";
  }
  return tamil
    ? "இடம் கிடைக்கவில்லை. இருப்பிடத்தை இயக்கி, ஜன்னல் அருகே நின்று, மீண்டும் தொடுங்கள்."
    : "Couldn't get a fix. Turn location on, step nearer a window, and tap again.";
}

export function Locator({
  answers,
  onsetIso,
  user,
  concern,
  lang,
  onEditTime,
  onRecheck,
  onReset,
  onUser,
}: {
  answers: Session["answers"];
  onsetIso: string | null;
  user: Session["user"];
  concern: "yes" | "unsure" | "clear" | "skipped";
  lang: Lang | null;
  onEditTime: () => void;
  onRecheck: () => void;
  onReset: () => void;
  onUser: (user: Session["user"]) => void;
}) {
  const [tier, setTier] = useState<TierFilter>("all");
  const [ownership, setOwnership] = useState<OwnFilter>("all");
  const [locating, setLocating] = useState<"search" | "tighten" | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState(
    user?.label && user.label !== "Pinned spot" && user.label !== "குறித்த இடம்" ? user.label : "",
  );
  const [placesOpen, setPlacesOpen] = useState(false);
  const matches = useMemo(() => matchPlaces(query), [query]);
  const copy = locatorCopy(lang);
  const onUserRef = useRef(onUser);
  onUserRef.current = onUser;
  const copyRef = useRef(copy);
  copyRef.current = copy;
  const pinned = useRef(Boolean(user?.label));
  const [gpsEpoch, setGpsEpoch] = useState(0);

  useEffect(() => {
    if (pinned.current && gpsEpoch === 0) return;
    setLocError(null);
    return followGps({
      onStatus: setLocating,
      onFix: applyFix,
      onError: (error) => {
        const text = copyRef.current;
        if (isGeoError(error) && error.code === 0) setLocError(text.noGeo);
        else setLocError(locateMessage(error, text.ta));
      },
    });

    function applyFix(fix: GpsFix, final: boolean) {
      onUserRef.current({
        lat: fix.lat,
        lng: fix.lng,
        at: Date.now(),
        accuracy: fix.accuracy,
      });
      setQuery("");
      setPlacesOpen(false);
      if (!final || !(fix.accuracy > 150)) return;
      const rounded =
        fix.accuracy < 1000
          ? `${Math.round(fix.accuracy / 10) * 10} m`
          : `${Math.max(1, Math.round(fix.accuracy / 1000))} km`;
      setLocError(copyRef.current.loose(rounded));
    }
  }, [gpsEpoch]);

  useEffect(() => {
    if (!locating) return;
    const id = window.setTimeout(() => {
      cancelGps();
      setLocating(null);
      setLocError(copyRef.current.noFix);
    }, 18000);
    return () => window.clearTimeout(id);
  }, [locating]);

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

  const yes = markedWords(answers, "yes", lang);
  const unsure = markedWords(answers, "unsure", lang);

  function locate() {
    pinned.current = false;
    beginGps(true);
    setGpsEpoch((epoch) => epoch + 1);
  }

  function resetPage() {
    pinned.current = true;
    cancelGps();
    setLocating(null);
    setLocError(null);
    setQuery("");
    setPlacesOpen(false);
    onReset();
  }

  function choosePlace(place: Place) {
    pinned.current = true;
    cancelGps();
    onUser({ lat: place.lat, lng: place.lng, at: Date.now(), label: place.name });
    setQuery(place.name);
    setPlacesOpen(false);
    setLocError(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {concern === "yes" ? (
        <div className={cn("mb-4 rounded-card bg-signal px-4 py-3 text-white", copy.ta && "font-tamil")}>
          <p className="font-semibold">{copy.possible(yes.join(", "))}</p>
          <p className="mt-1 text-sm">{copy.travel}</p>
        </div>
      ) : null}
      {concern === "unsure" ? (
        <div className={cn("mb-4 rounded-card bg-late-soft px-4 py-3 text-late-ink", copy.ta && "font-tamil")}>
          <p className="font-semibold">{copy.unsure(unsure.join(", "))}</p>
          <p className="mt-1 text-sm">{copy.treatUrgent}</p>
        </div>
      ) : null}
      {concern === "clear" ? (
        <div className={cn("mb-4 rounded-card border border-line bg-surface px-4 py-3 text-sm text-ink-soft", copy.ta && "font-tamil")}>
          {copy.clear}
        </div>
      ) : null}

      <Countdown onsetIso={onsetIso} onEdit={onEditTime} lang={lang} />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={locate}
          disabled={locating !== null}
          className={cn(
            "h-14 flex-1 rounded-full bg-signal text-base font-semibold text-white disabled:opacity-60",
            copy.ta && "font-tamil",
            TAP,
          )}
        >
          {locating === "tighten" ? copy.tightening : locating ? copy.finding : user ? copy.updateLocation : copy.findNearest}
        </button>
        {user ? (
          <button
            type="button"
            onClick={() => {
              pinned.current = true;
              cancelGps();
              onUser(null);
              setQuery("");
              setPlacesOpen(false);
            }}
            className={cn(
              "h-14 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink",
              copy.ta && "font-tamil",
              TAP,
            )}
          >
            {copy.cityCentre}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={resetPage}
        className={cn(
          "mt-2 flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-surface px-4 text-center text-sm font-semibold text-ink",
          copy.ta && "font-tamil",
          TAP,
        )}
      >
        {copy.reset}
      </button>
      <div className="mt-3">
        <label htmlFor="chennai-place" className={cn("text-sm font-semibold text-ink", copy.ta && "font-tamil")}>
          {copy.abroad}
        </label>
        {copy.abroadHint ? (
          <p className="font-tamil mt-1 text-sm text-ink-soft">{copy.abroadHint}</p>
        ) : null}
        <input
          id="chennai-place"
          value={query}
          placeholder={copy.placePlaceholder}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setPlacesOpen(true);
          }}
          onFocus={() => setPlacesOpen(true)}
          className="mt-2 h-12 w-full rounded-full border border-line bg-surface px-4 text-base text-ink outline-none placeholder:text-ink-soft"
        />
        {placesOpen ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {matches.map((place) => (
              <li key={place.name}>
                <button
                  type="button"
                  onClick={() => choosePlace(place)}
                  className={cn(
                    "h-10 rounded-full bg-[#1b4fad] px-3 text-sm font-semibold text-white",
                    TAP,
                  )}
                >
                  {place.name}
                </button>
              </li>
            ))}
            {matches.length === 0 ? (
              <li className={cn("text-sm text-ink-soft", copy.ta && "font-tamil")}>{copy.noArea}</li>
            ) : null}
          </ul>
        ) : null}
      </div>
      <p className={cn("mt-2 text-sm text-ink-soft", copy.ta && "font-tamil")} role="status">
        {copy.ta
          ? `${copy.hospitals(rows.length)} · ${
              user?.label
                ? copy.sortedFrom(user.label, null)
                : user
                  ? copy.sortedFrom(
                      null,
                      user.accuracy
                        ? user.accuracy < 1000
                          ? `${Math.round(user.accuracy / 10) * 10} m`
                          : `${Math.max(1, Math.round(user.accuracy / 1000))} km`
                        : null,
                    )
                  : copy.fromCentre
            }`
          : `${copy.hospitals(rows.length)} · ${copy.sorted} ${
              user?.label
                ? copy.sortedFrom(user.label, null)
                : user
                  ? copy.sortedFrom(
                      null,
                      user.accuracy
                        ? user.accuracy < 1000
                          ? `${Math.round(user.accuracy / 10) * 10} m`
                          : `${Math.max(1, Math.round(user.accuracy / 1000))} km`
                        : null,
                    )
                  : copy.fromCentre
            }`}
      </p>
      {locError ? (
        <p className="mt-2 text-sm font-semibold text-signal" role="alert">
          {locError}
        </p>
      ) : null}

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <div>
          <FilterRow
            tamil={copy.ta}
            label="Capability"
            value={tier}
            options={[
              { id: "all", label: copy.allTiers, active: "border-transparent bg-[#1b4fad] text-white" },
              { id: "comprehensive", label: copy.comprehensive, active: "border-transparent bg-[#3dff9a] text-[#062016]" },
            ]}
            onChange={setTier}
          />
          <FilterRow
            tamil={copy.ta}
            label="Hospital type"
            value={ownership}
            options={[
              { id: "all", label: copy.bothTypes, active: "border-transparent bg-[#1b4fad] text-white" },
              { id: "Government", label: copy.government, active: "border-transparent bg-[#4cc3ff] text-[#041820]" },
              { id: "Private", label: copy.private, active: "border-transparent bg-[#ffb020] text-[#2a1400]" },
            ]}
            onChange={setOwnership}
          />
          <ul className={cn("mt-3 mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-ink", copy.ta && "font-tamil")}>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[#3dff9a]" aria-hidden="true" />
              {copy.legendGovComp}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-[#d6ff4a]" aria-hidden="true" />
              {copy.legendPvtComp}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-[#4cc3ff]" aria-hidden="true" />
              {copy.legendGovReady}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-[#ffb020]" aria-hidden="true" />
              {copy.legendPvtReady}
            </li>
          </ul>
          <HospitalMap
            pins={rows}
            user={user}
            center={CHENNAI_CENTER}
            lang={lang}
            onPick={(id) => {
              setActiveId(id);
              document.getElementById(`hospital-${id}`)?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            onPlace={(lat, lng) => {
              pinned.current = true;
              cancelGps();
              onUser({ lat, lng, at: Date.now(), label: copy.pinned });
              setQuery("");
              setPlacesOpen(false);
              setLocError(null);
            }}
          />
          <p className={cn("mt-2 text-xs text-ink-soft", copy.ta && "font-tamil")}>{copy.tapMap}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <h1 className={cn("text-3xl leading-tight", copy.ta ? "font-tamil font-semibold" : "font-display")}>
              {copy.nearest}
            </h1>
            <button
              type="button"
              onClick={onRecheck}
              className={cn("mb-1 shrink-0 text-sm font-semibold text-ink-soft", copy.ta && "font-tamil")}
            >
              {copy.recheck}
            </button>
          </div>
          <p className={cn("mb-3 text-sm text-ink-soft", copy.ta && "font-tamil")}>{copy.explain}</p>
          {rows.length === 0 ? (
            <p className={cn("rounded-card border border-line bg-surface px-4 py-8 text-center font-semibold text-signal", copy.ta && "font-tamil")}>
              {copy.noMatch}
            </p>
          ) : (
            rows.map((hospital, index) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                active={activeId === hospital.id}
                fromYou={Boolean(user)}
                index={index}
                onsetIso={onsetIso}
                lang={lang}
              />
            ))
          )}
          <footer className={cn("mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft", copy.ta && "font-tamil")}>
            <p>
              <strong className="text-ink">{copy.disclaimer}</strong> {copy.noAmbulance}
            </p>
            <p className="mt-2">{copy.clocks}</p>
            <p className="mt-2">{copy.sources}</p>
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
  tamil,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; active?: string }[];
  onChange: (value: T) => void;
  tamil?: boolean;
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
              "h-11 flex-1 rounded-full border px-2 text-xs font-semibold",
              tamil && "font-tamil",
              TAP,
              value === option.id
                ? (option.active ?? "border-transparent bg-[#1b4fad] text-white")
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
  onsetIso,
  lang,
}: {
  hospital: Hospital & { dist: number };
  active: boolean;
  fromYou: boolean;
  index: number;
  onsetIso: string | null;
  lang: Lang | null;
}) {
  const copy = locatorCopy(lang);
  const callable = canCall(hospital.phone);
  const comprehensive = hospital.level === "comprehensive";
  const gov = hospital.ownership === "Government";
  const facts = hospitalFacts(hospital.id);
  const pathway = pathwayLine(hospital.id, lang);
  const services = [
    [copy.ct, facts.ct],
    [copy.mri, facts.mri],
    [copy.thrombectomy, facts.thrombectomy],
  ] as const;
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
        active && "ring-2 ring-[#1b4fad]",
      )}
    >
      <div className={cn("flex items-center justify-between gap-3 px-4 py-2.5", tab)}>
        <p className={cn("text-sm font-semibold", copy.ta && "font-tamil")}>{gov ? copy.government : copy.private}</p>
        <span className="shrink-0 rounded-full bg-[#071018]/15 px-3 py-1 text-sm font-semibold tabular-nums">
          {formatDistance(hospital.dist)}
          <span className="sr-only"> {fromYou ? copy.fromYou : copy.fromCentre}</span>
        </span>
      </div>
      <div className="p-4">
      <h2 className="text-lg leading-snug font-semibold">{hospital.name}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {hospital.address}
        {hospital.area ? ` · ${hospital.area}` : ""}
      </p>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {services.map(([label, answer]) => (
          <li key={label} className="flex items-center justify-between gap-3 bg-paper-deep px-3 py-2">
            <span className={cn("text-sm text-ink", copy.ta && "font-tamil")}>{label}</span>
            <span
              className={cn(
                "shrink-0 text-right text-sm font-semibold",
                copy.ta && "font-tamil",
                answer === "yes" && "text-ok",
                answer === "no" && "text-ink",
                answer === "check" && "text-ink-soft",
              )}
            >
              {serviceWord(answer, lang)}
            </span>
          </li>
        ))}
      </ul>
      {pathway ? (
        <p className={cn("mt-3 text-sm font-semibold text-ink", copy.ta && "font-tamil")}>{pathway}</p>
      ) : null}
      <p className={cn("text-xs font-semibold text-ink-soft", copy.ta && "font-tamil", pathway ? "mt-1" : "mt-3")}>
        {hospital.source === "clinician_verified" ? copy.reviewed : copy.publicInfo}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {callable ? (
          <a
            href={`tel:${hospital.phone}`}
            onClick={() => {
              const payload = {
                window: readClock(onsetIso, Date.now()).phase,
                target: hospital.phone === "108" ? "108" : hospital.name,
              };
              const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
              if (!navigator.sendBeacon("/api/stroke-call", blob)) {
                void recordStrokeCall({ data: payload }).catch(() => undefined);
              }
            }}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-full bg-ok text-sm font-semibold text-[#062016]",
              copy.ta && "font-tamil",
              TAP,
            )}
          >
            <Phone className="size-4" aria-hidden="true" />
            {hospital.phone.length <= 6 ? copy.call(hospital.phone) : copy.ta ? "அழை" : "Call"}
          </a>
        ) : (
          <span className={cn("flex h-11 items-center justify-center rounded-full bg-paper-deep text-sm font-semibold text-ink-soft", copy.ta && "font-tamil")}>
            {copy.noNumber}
          </span>
        )}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "flex h-11 items-center justify-center gap-2 rounded-full bg-[#1b4fad] text-sm font-semibold text-white",
            copy.ta && "font-tamil",
            TAP,
          )}
        >
          <Navigation className="size-4" aria-hidden="true" />
          {copy.navigate}
        </a>
      </div>
      </div>
    </article>
  );
}

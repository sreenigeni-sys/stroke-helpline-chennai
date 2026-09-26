export type GpsFix = { lat: number; lng: number; accuracy: number };
export type GpsStatus = "search" | "tighten" | null;

type GpsListener = {
  onStatus?: (status: GpsStatus) => void;
  onFix?: (fix: GpsFix, final: boolean) => void;
  onError?: (error: unknown) => void;
};

type GpsRun = {
  settled: boolean;
  consumed: boolean;
  status: GpsStatus;
  error: unknown | null;
  last: GpsFix | null;
  listeners: Set<GpsListener>;
  stopWatch: () => void;
};

let run: GpsRun | null = null;

function emitStatus(current: GpsRun) {
  for (const listener of current.listeners) listener.onStatus?.(current.status);
}

function emitFix(current: GpsRun, final: boolean) {
  if (!current.last) return;
  for (const listener of current.listeners) listener.onFix?.(current.last, final);
}

function emitError(current: GpsRun) {
  for (const listener of current.listeners) listener.onError?.(current.error);
}

function toFix(position: GeolocationPosition): GpsFix {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
}

/** Start a high-accuracy watch. Call this inside the tap that opens hospitals so iOS shows the prompt. */
export function beginGps(force = false) {
  if (typeof window === "undefined") return;
  if (!force && run && !run.settled) return;
  if (run) {
    run.stopWatch();
    run.settled = true;
    run.listeners.clear();
  }

  const current: GpsRun = {
    settled: false,
    consumed: false,
    status: null,
    error: null,
    last: null,
    listeners: new Set(),
    stopWatch: () => {},
  };
  run = current;

  if (!window.isSecureContext || !navigator.geolocation) {
    current.settled = true;
    current.error = Object.assign(new Error("no-geo"), { code: 0 });
    emitError(current);
    return;
  }

  let best: GeolocationPosition | null = null;
  let watchId = 0;
  const started = Date.now();
  const stop = (finish: () => void) => {
    if (current.settled) return;
    current.settled = true;
    window.clearTimeout(timer);
    if (watchId) navigator.geolocation.clearWatch(watchId);
    current.status = null;
    finish();
    emitStatus(current);
  };
  const timer = window.setTimeout(() => {
    const fix = best;
    stop(() => {
      if (!fix) {
        current.error = Object.assign(new Error("timeout"), { code: 3 });
        emitError(current);
        return;
      }
      current.last = toFix(fix);
      emitFix(current, true);
    });
  }, 16000);
  current.status = "search";
  emitStatus(current);

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      const acc = Number.isFinite(accuracy) ? accuracy : Number.POSITIVE_INFINITY;
      if (!best || acc < best.coords.accuracy) {
        best = position;
        current.last = toFix(position);
        if (acc > 80) current.status = "tighten";
        emitFix(current, false);
        emitStatus(current);
      }
      if (acc <= 50) {
        stop(() => {
          current.last = toFix(position);
          emitFix(current, true);
        });
      } else if (Date.now() - started > 12000 && best) {
        const fix = best;
        stop(() => {
          current.last = toFix(fix);
          emitFix(current, true);
        });
      }
    },
    (error) => {
      if (error.code === 1 || !best) {
        stop(() => {
          current.error = error;
          emitError(current);
        });
      }
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
  );
  current.stopWatch = () => {
    window.clearTimeout(timer);
    if (watchId) navigator.geolocation.clearWatch(watchId);
  };
}

export function followGps(listener: GpsListener) {
  if (!run || (run.settled && run.consumed)) beginGps();
  const current = run;
  if (!current) return () => {};
  current.consumed = true;
  current.listeners.add(listener);
  if (current.status) listener.onStatus?.(current.status);
  if (current.last) listener.onFix?.(current.last, current.settled && !current.error);
  if (current.error) listener.onError?.(current.error);
  if (current.settled) listener.onStatus?.(null);
  return () => {
    current.listeners.delete(listener);
  };
}

export function cancelGps() {
  if (!run || run.settled) return;
  run.stopWatch();
  run.settled = true;
  run.consumed = true;
  run.status = null;
  const listeners = [...run.listeners];
  run.listeners.clear();
  for (const listener of listeners) listener.onStatus?.(null);
}

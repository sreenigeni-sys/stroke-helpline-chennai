import { useEffect, useRef, useState } from "react";
import { useReduceMotion } from "@/lib/reduce-motion";
import { cn } from "@/lib/cn";
import type { Sign } from "@/components/stroke/signs";

export function SignVisual({ sign }: { sign: Sign }) {
  const reduce = useReduceMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [posterOk, setPosterOk] = useState(true);
  const [videoOn, setVideoOn] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const Icon = sign.icon;
  const showVideo = Boolean(sign.video) && !reduce;

  useEffect(() => {
    setPosterOk(true);
    setVideoOn(false);
    setNeedsTap(false);
  }, [sign.id]);

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const pending = video.play();
    if (pending) {
      pending.then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
    }
  }, [showVideo, sign.id]);

  return (
    <div className="relative aspect-square overflow-hidden rounded-card bg-[#152033]">
      {posterOk ? (
        <img
          src={sign.poster}
          alt={`${sign.word} demonstration`}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setPosterOk(false)}
        />
      ) : null}
      {showVideo ? (
        <video
          key={sign.id}
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            videoOn ? "opacity-100" : "opacity-0",
          )}
          src={sign.video}
          poster={sign.poster}
          muted
          loop={sign.loop !== false}
          playsInline
          autoPlay
          preload="auto"
          aria-label={`${sign.word} demonstration`}
          onPlaying={() => setVideoOn(true)}
          onCanPlay={() => setVideoOn(true)}
          onError={() => setVideoOn(false)}
        />
      ) : null}
      {!posterOk && !videoOn ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-ink">
          <Icon className="size-16" strokeWidth={1.25} aria-hidden="true" />
          <p className="font-display text-3xl">{sign.word}</p>
        </div>
      ) : null}
      <span className="absolute top-3 left-3 z-10 flex size-11 items-center justify-center rounded-full bg-[#071018] font-display text-xl text-[#f4efe6]">
        <span className="sr-only">{sign.word}. </span>
        {sign.id}
      </span>
      <p className="absolute inset-x-0 bottom-0 z-10 bg-[#071018]/85 px-4 py-3 text-sm text-[#f4efe6]">
        {sign.watch}
        <span className="font-tamil mt-1 block text-base leading-snug">{sign.watchTa}</span>
      </p>
      {needsTap && showVideo && !videoOn ? (
        <button
          type="button"
          className="absolute top-3 right-3 z-10 rounded-full bg-[#f4efe6] px-3 py-2 text-sm font-semibold text-[#071018]"
          onClick={() => {
            void videoRef.current?.play().then(() => {
              setNeedsTap(false);
              setVideoOn(true);
            });
          }}
        >
          Play
          <span className="font-tamil block text-xs">இயக்கு</span>
        </button>
      ) : null}
    </div>
  );
}
"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Chapter } from "@/lib/episodes";
import { PlayerIcon } from "./player-icons";
import { PlaybackSpeed } from "./playback-speed";

interface Player {
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getVideoLoadedFraction(): number;
  getVolume(): number;
  setVolume(volume: number): void;
  isMuted(): boolean;
  mute(): void;
  unMute(): void;
  getPlaybackRate(): number;
  setPlaybackRate(rate: number): void;
  getAvailablePlaybackRates(): number[];
  destroy(): void;
}

interface PlayerEvent { target: Player }
interface YouTubeAPI {
  Player: new (iframe: HTMLIFrameElement, options: {
    events: {
      onReady: (event: PlayerEvent) => void;
      onStateChange: (event: PlayerEvent) => void;
      onPlaybackRateChange: (event: PlayerEvent) => void;
      onAutoplayBlocked: () => void;
      onError: () => void;
    };
  }) => Player;
}

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeAPI> | undefined;

function loadAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      const script = document.createElement("script");
      const timeout = setTimeout(fail, 12000);
      function fail() {
        clearTimeout(timeout);
        script.remove();
        if (window.onYouTubeIframeAPIReady === onReady) window.onYouTubeIframeAPIReady = previousReady;
        reject(new Error("YouTube controls could not load."));
      }
      function onReady() {
        clearTimeout(timeout);
        if (window.onYouTubeIframeAPIReady === onReady) window.onYouTubeIframeAPIReady = previousReady;
        if (window.YT?.Player) resolve(window.YT);
        else fail();
        previousReady?.();
      }
      window.onYouTubeIframeAPIReady = onReady;
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = fail;
      document.head.append(script);
    }).catch((error) => {
      apiPromise = undefined;
      throw error;
    });
  }
  return apiPromise;
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = String(total % 60).padStart(2, "0");
  return minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
}

export function YouTubePlayer({ videoId, title, poster, durationLabel, chapters, started, onStart, seconds, seekRequest, onTimeChange }: {
  videoId: string;
  title: string;
  poster: string;
  durationLabel: string;
  chapters: Chapter[];
  started: boolean;
  onStart: () => void;
  seconds: number;
  seekRequest: number;
  onTimeChange: (seconds: number) => void;
}) {
  const shell = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<Player | null>(null);
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const ready = useRef(false);
  const nativeFallback = useRef(false);
  const requestedSeconds = useRef(seconds);
  const shouldPlay = useRef(true);
  const preferences = useRef({ volume: 100, muted: false, rate: 1 });
  const onTime = useRef(onTimeChange);
  const [isReady, setIsReady] = useState(false);
  const [nativeControls, setNativeControls] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [message, setMessage] = useState("");
  const [playback, setPlayback] = useState({ time: seconds, duration: 0, buffered: 0, playing: false, buffering: false, volume: 100, muted: false, rate: 1, rates: [1] });

  useEffect(() => { onTime.current = onTimeChange; }, [onTimeChange]);

  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled && shell.current?.requestFullscreen));
    const update = () => setFullscreen(document.fullscreenElement === shell.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let failed = false;
    let instance: Player | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let readyTimeout: ReturnType<typeof setTimeout> | undefined;
    ready.current = false;
    nativeFallback.current = false;
    setIsReady(false);
    setMessage("");

    function makeFrame(useNativeControls: boolean) {
      const frame = document.createElement("iframe");
      const params = new URLSearchParams({ autoplay: shouldPlay.current ? "1" : "0", controls: useNativeControls ? "1" : "0", rel: "0", playsinline: "1", enablejsapi: "1", origin: window.location.origin, start: String(Math.floor(requestedSeconds.current)) });
      frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
      frame.title = title;
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      return frame;
    }

    function fallback(text: string) {
      if (cancelled || failed) return;
      failed = true;
      clearTimeout(readyTimeout);
      clearInterval(timer);
      ready.current = false;
      nativeFallback.current = true;
      setIsReady(false);
      setMessage(text);
      instance?.destroy();
      instance = null;
      player.current = null;
      const frame = makeFrame(true);
      iframe.current = frame;
      host.current?.replaceChildren(frame);
    }

    function sync(target: Player) {
      if (cancelled || failed) return;
      const time = target.getCurrentTime();
      const duration = target.getDuration();
      const state = target.getPlayerState();
      if (!Number.isFinite(time) || !Number.isFinite(duration)) return;
      preferences.current = { volume: target.getVolume(), muted: target.isMuted(), rate: target.getPlaybackRate() };
      setPlayback({ time, duration, buffered: target.getVideoLoadedFraction(), playing: state === 1, buffering: state === 3, ...preferences.current, rates: target.getAvailablePlaybackRates() });
      onTime.current(time);
    }

    const frame = makeFrame(nativeControls);
    iframe.current = frame;
    host.current?.replaceChildren(frame);
    readyTimeout = setTimeout(() => fallback("Use the video’s controls while the custom player is unavailable."), 18000);

    loadAPI().then((api) => {
      if (cancelled || failed) return;
      instance = new api.Player(frame, { events: {
        onReady: ({ target }) => {
          if (cancelled || failed) return;
          clearTimeout(readyTimeout);
          ready.current = true;
          setIsReady(true);
          target.setVolume(preferences.current.volume);
          if (preferences.current.muted) target.mute();
          else target.unMute();
          target.setPlaybackRate(preferences.current.rate);
          target.seekTo(requestedSeconds.current, true);
          if (shouldPlay.current) target.playVideo();
          else target.pauseVideo();
          sync(target);
          timer = setInterval(() => sync(target), 250);
        },
        onStateChange: ({ target }) => {
          if (!cancelled && ready.current) {
            if (target.getPlayerState() === 1) setMessage("");
            sync(target);
          }
        },
        onPlaybackRateChange: ({ target }) => { if (ready.current) sync(target); },
        onAutoplayBlocked: () => { if (!cancelled) setMessage("Press play to continue."); },
        onError: () => fallback("Having trouble playing? Try the video’s controls or watch on YouTube."),
      } });
      player.current = instance;
    }).catch(() => fallback("Use the video’s controls while the custom player is unavailable."));

    return () => {
      cancelled = true;
      clearTimeout(readyTimeout);
      clearInterval(timer);
      ready.current = false;
      instance?.destroy();
      player.current = null;
      host.current?.replaceChildren();
      iframe.current = null;
    };
  }, [videoId, title, started, nativeControls]);

  useEffect(() => {
    requestedSeconds.current = seconds;
    shouldPlay.current = true;
    if (ready.current && player.current) {
      player.current.seekTo(seconds, true);
      player.current.playVideo();
    } else if (nativeFallback.current && iframe.current) {
      const url = new URL(iframe.current.src);
      if (url.searchParams.get("start") !== String(Math.floor(seconds))) {
        url.searchParams.set("start", String(Math.floor(seconds)));
        iframe.current.src = url.toString();
      }
    }
  }, [seconds, seekRequest]);

  function togglePlayback() {
    if (!started) { onStart(); return; }
    if (!ready.current || !player.current) return;
    setMessage("");
    const state = player.current.getPlayerState();
    if (state === 1 || state === 3) player.current.pauseVideo();
    else player.current.playVideo();
  }

  function seek(time: number) {
    if (!ready.current || !player.current) return;
    const next = Math.min(playback.duration, Math.max(0, time));
    player.current.seekTo(next, true);
    setPlayback((previous) => ({ ...previous, time: next }));
    onTime.current(next);
  }

  function toggleMute() {
    if (!ready.current || !player.current) return;
    if (player.current.isMuted() || player.current.getVolume() === 0) {
      if (player.current.getVolume() === 0) player.current.setVolume(50);
      player.current.unMute();
    } else player.current.mute();
    setPlayback((previous) => ({ ...previous, muted: player.current!.isMuted(), volume: player.current!.getVolume() }));
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === shell.current) await document.exitFullscreen();
      else await shell.current?.requestFullscreen();
    } catch { setMessage("Fullscreen isn’t available in this browser. Try the video’s fullscreen control in YouTube settings."); }
  }

  function toggleNativeControls() {
    if (player.current && ready.current) {
      requestedSeconds.current = player.current.getCurrentTime();
      const state = player.current.getPlayerState();
      shouldPlay.current = state === 1 || state === 3;
    }
    setNativeControls((previous) => !previous);
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLElement && event.target.closest("button, input, select, a")) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key.toLowerCase()) {
      case " ": case "k": event.preventDefault(); togglePlayback(); break;
      case "arrowleft": case "j": event.preventDefault(); seek(playback.time - 10); break;
      case "arrowright": case "l": event.preventDefault(); seek(playback.time + 10); break;
      case "m": event.preventDefault(); toggleMute(); break;
      case "f": if (canFullscreen) { event.preventDefault(); void toggleFullscreen(); } break;
    }
  }

  const chapter = [...chapters].reverse().find((item) => playback.time >= item.seconds);
  const busy = started && !isReady && !message;
  const progressStyle = { "--progress": `${playback.duration ? playback.time / playback.duration * 100 : 0}%`, "--buffered": `${playback.buffered * 100}%` } as CSSProperties;

  return <div className="youtube-player" ref={shell} role="region" aria-label={title} tabIndex={0} onKeyDown={handleKey}>
    <div className="player-viewport">
      {started ? <div className="player-frame" ref={host} /> : <button className="player-poster" type="button" onClick={onStart} aria-label={`Play ${title}`}>
        <Image src={poster} alt="" width={1280} height={720} priority sizes="(max-width: 900px) 100vw, 900px" />
        <span className="player-poster-play"><PlayerIcon name="play" /></span>
        <span className="player-poster-caption">Play the conversation</span>
      </button>}
    </div>
    <div className="player-controls" aria-label="Video controls">
      <div className="player-timeline" style={progressStyle}>
        <input type="range" min="0" max={playback.duration || 1} step="1" value={Math.min(playback.time, playback.duration || 0)} disabled={!isReady || !playback.duration} onChange={(event) => seek(Number(event.target.value))} aria-label="Seek through episode" aria-valuetext={`${formatTime(playback.time)}${chapter ? `, ${chapter.title}` : ""}`} />
        <div className="player-chapter-marks" aria-hidden="true">{playback.duration > 0 && chapters.filter((item) => item.seconds > 0 && item.seconds < playback.duration).map((item) => <i key={item.seconds} style={{ left: `${item.seconds / playback.duration * 100}%` }} />)}</div>
      </div>
      <div className="player-control-row">
        <button className="player-control player-play" type="button" onClick={togglePlayback} disabled={started && !isReady} aria-label={playback.playing || playback.buffering ? "Pause" : "Play"} title={playback.playing ? "Pause" : "Play"}>
          <PlayerIcon name={busy || playback.buffering ? "loading" : playback.playing ? "pause" : "play"} />
        </button>
        <div className="player-skip-controls">
          <button className="player-control" type="button" onClick={() => seek(playback.time - 10)} disabled={!isReady} aria-label="Rewind 10 seconds" title="Rewind 10 seconds"><PlayerIcon name="rewind" /></button>
          <button className="player-control" type="button" onClick={() => seek(playback.time + 10)} disabled={!isReady} aria-label="Forward 10 seconds" title="Forward 10 seconds"><PlayerIcon name="forward" /></button>
        </div>
        <span className="player-time"><span>{formatTime(playback.time)}</span><span className="player-time-divider">/</span>{playback.duration ? formatTime(playback.duration) : durationLabel}</span>
        <span className="player-current-chapter" title={chapter?.title}>{chapter?.title}</span>
        <div className="player-secondary-controls">
          <div className="player-volume" style={{ "--volume": `${playback.muted ? 0 : playback.volume}%` } as CSSProperties}>
            <button className="player-control" type="button" onClick={toggleMute} disabled={!isReady} aria-label={playback.muted || playback.volume === 0 ? "Unmute" : "Mute"} title={playback.muted || playback.volume === 0 ? "Unmute" : "Mute"}><PlayerIcon name={playback.muted || playback.volume === 0 ? "muted" : "volume"} /></button>
            <input type="range" min="0" max="100" step="1" value={playback.muted ? 0 : playback.volume} disabled={!isReady} aria-label="Volume" onChange={(event) => { const volume = Number(event.target.value); player.current?.setVolume(volume); player.current?.unMute(); setPlayback((previous) => ({ ...previous, volume, muted: false })); }} />
          </div>
          <PlaybackSpeed value={playback.rate} rates={playback.rates} disabled={!isReady} onChange={(rate) => player.current?.setPlaybackRate(rate)} />
          <button className="player-control player-settings" type="button" disabled={!isReady} aria-label={nativeControls ? "Hide YouTube controls" : "Show YouTube controls for captions and quality"} aria-pressed={nativeControls} title="YouTube settings: captions and quality" onClick={toggleNativeControls}><PlayerIcon name="settings" /></button>
          {canFullscreen && <button className="player-control" type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}><PlayerIcon name={fullscreen ? "minimize" : "fullscreen"} /></button>}
        </div>
      </div>
      <p className="sr-only" role="status">{busy ? "Loading video" : ""}</p>
      {message && <p className="player-message" role="status">{message} <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></p>}
    </div>
  </div>;
}

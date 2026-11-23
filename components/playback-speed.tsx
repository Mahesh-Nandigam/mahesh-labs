"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { PlayerIcon } from "./player-icons";

export function PlaybackSpeed({ value, rates, disabled, onChange }: {
  value: number;
  rates: number[];
  disabled: boolean;
  onChange: (rate: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const options = rates.length ? rates : [1];
  const visible = open && !disabled;

  useEffect(() => {
    if (!visible) return;
    const selected = menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    (selected ?? menu.current?.querySelector<HTMLButtonElement>("button"))?.focus();
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    };
    const dismissOnWindowBlur = () => setOpen(false);
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("blur", dismissOnWindowBlur);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("blur", dismissOnWindowBlur);
    };
  }, [visible]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    switch (event.key) {
      case "Escape": event.preventDefault(); event.stopPropagation(); close(); return;
      case "ArrowDown": case "ArrowRight": next = (index + 1) % buttons.length; break;
      case "ArrowUp": case "ArrowLeft": next = (index - 1 + buttons.length) % buttons.length; break;
      case "Home": next = 0; break;
      case "End": next = buttons.length - 1; break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
    buttons[next]?.focus();
  }

  return <div className="player-speed-control" ref={container} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button className="player-speed" type="button" ref={trigger} disabled={disabled} aria-label={`Playback speed, ${value} times`} aria-haspopup="menu" aria-expanded={visible} aria-controls={visible ? menuId : undefined} title="Playback speed" onClick={() => setOpen((previous) => !previous)} onKeyDown={(event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); }
    }}><span>{value}×</span><PlayerIcon name="chevron" /></button>
    {visible && <div className="player-speed-menu" id={menuId} ref={menu} role="menu" aria-label="Playback speed" onKeyDown={navigate}>
      <p className="player-speed-heading">Playback speed</p>
      <div className="player-speed-options" role="presentation">{options.map((rate) => <button type="button" role="menuitemradio" aria-checked={value === rate} tabIndex={-1} key={rate} onClick={() => { onChange(rate); close(); }}>
        <span>{rate}×{rate === 1 && <small>Normal</small>}</span>
        {value === rate && <PlayerIcon name="check" />}
      </button>)}</div>
    </div>}
  </div>;
}

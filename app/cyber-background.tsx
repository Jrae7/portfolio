"use client";

import { useEffect, useRef } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import land110m from "world-atlas/land-110m.json";

// Major cities [lon, lat, size]
const CITIES: [number, number, number][] = [
  [-74.0, 40.7, 3],   // New York
  [-0.1,  51.5, 3],   // London
  [37.6,  55.7, 2],   // Moscow
  [116.4, 39.9, 3],   // Beijing
  [139.7, 35.7, 2],   // Tokyo
  [151.2,-33.9, 2],   // Sydney
  [-46.6,-23.5, 2],   // São Paulo
  [3.4,   6.5,  1],   // Lagos
  [72.8,  19.0, 2],   // Mumbai
  [103.8,  1.4, 2],   // Singapore
  [55.3,  25.2, 2],   // Dubai
  [8.7,   50.0, 2],   // Frankfurt
  [-87.6, 41.8, 2],   // Chicago
  [-118.2,34.0, 2],   // Los Angeles
  [126.9, 37.6, 2],   // Seoul
  [31.2,  30.0, 1],   // Cairo
  [2.3,   48.9, 2],   // Paris
  [-99.1, 19.4, 1],   // Mexico City
  [-58.4,-34.6, 1],   // Buenos Aires
  [100.5, 13.8, 1],   // Bangkok
  [121.5, 31.2, 2],   // Shanghai
  [28.0, -26.2, 1],   // Johannesburg
  [-79.4, 43.7, 1],   // Toronto
  [18.1,  59.3, 1],   // Stockholm
  [13.4,  52.5, 1],   // Berlin
  [4.9,   52.4, 1],   // Amsterdam
];

type Arc = {
  from: number; to: number;
  color: string; alpha: number;
  startedAt: number; duration: number;
  trailPts: [number, number][];
};

type CityPulse = { cityIdx: number; startedAt: number; duration: number; color: string };

const TOKENS = ["0","1","0","1","A","B","C","D","E","F","SYN","ACK","RST","FIN","0xFF","SSH","TLS","AES","[!]","[*]"];
const TARGET_FPS = 30;

function token() { return TOKENS[Math.floor(Math.random() * TOKENS.length)]; }

function project(lon: number, lat: number, w: number, h: number): [number, number] {
  return [(lon + 180) / 360 * w, (90 - lat) / 180 * h];
}

function bezierPt(t: number, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number): [number, number] {
  const m = 1 - t;
  return [m*m*x1 + 2*m*t*cx + t*t*x2, m*m*y1 + 2*m*t*cy + t*t*y2];
}

function arcControl(x1: number, y1: number, x2: number, y2: number): [number, number] {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  return [mx - Math.sin(angle) * dist * 0.32, my - Math.abs(Math.cos(angle)) * dist * 0.38];
}

// Draw a GeoJSON geometry ring onto a canvas context using equirectangular projection
function drawRing(ctx: CanvasRenderingContext2D, ring: number[][], w: number, h: number) {
  ring.forEach(([lon, lat], i) => {
    const [x, y] = project(lon, lat, w, h);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
}

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mapCanvas = document.createElement("canvas");
    const mctx = mapCanvas.getContext("2d", { alpha: true });
    if (!mctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1;
    let animFrame = 0, lastFrame = 0;

    let arcs: Arc[] = [];
    let nextArcAt = performance.now() + 800;
    let cityPulses: CityPulse[] = [];
    let nextCityPulseAt = performance.now() + 1200;

    type Col = { x: number; chars: string[]; offset: number; phase: number; speed: number; spacing: number; lastMut: number };
    let cols: Col[] = [];

    // Decode the bundled world map so the background never depends on a runtime CDN.
    const topology = land110m as unknown as Topology;
    const geojson = feature(topology, topology.objects.land as GeometryCollection);
    const features = "features" in geojson ? geojson.features : [geojson];
    const landFeatures = features.map(f => f.geometry) as { type: string; coordinates: number[][][][] }[];

    const buildMap = () => {
      if (!W || !H) return;
      mctx.clearRect(0, 0, W, H);

      // Lat/lon grid
      mctx.strokeStyle = "rgba(0,191,255,0.028)";
      mctx.lineWidth = 0.6;
      for (let lat = -90; lat <= 90; lat += 30) {
        const [, y] = project(0, lat, W, H);
        mctx.beginPath(); mctx.moveTo(0, y); mctx.lineTo(W, y); mctx.stroke();
      }
      for (let lon = -180; lon <= 180; lon += 30) {
        const [x] = project(lon, 0, W, H);
        mctx.beginPath(); mctx.moveTo(x, 0); mctx.lineTo(x, H); mctx.stroke();
      }

      if (landFeatures.length === 0) return;

      // Draw land polygons
      landFeatures.forEach(geom => {
        if (!geom) return;
        const polys: number[][][][] =
          geom.type === "Polygon"
            ? [(geom as unknown as { coordinates: number[][][] }).coordinates]
            : (geom as { coordinates: number[][][][] }).coordinates;

        polys.forEach(poly => {
          mctx.beginPath();
          poly.forEach(ring => drawRing(mctx, ring, W, H));
          mctx.closePath();
          mctx.fillStyle = "rgba(0,191,255,0.055)";
          mctx.fill();
          mctx.strokeStyle = "rgba(0,191,255,0.11)";
          mctx.lineWidth = 0.7;
          mctx.stroke();
        });
      });
    };

    const buildCols = () => {
      const count = 8;
      const lane = W / count;
      cols = Array.from({ length: count }, (_, i) => {
        const spacing = 20 + Math.random() * 8;
        return {
          x: lane * (i + 0.5) + (Math.random() - 0.5) * lane * 0.5,
          chars: Array.from({ length: Math.ceil(H / spacing) + 8 }, token),
          offset: -Math.random() * H,
          phase: Math.random() * Math.PI * 2,
          speed: 7 + Math.random() * 8,
          spacing,
          lastMut: performance.now(),
        };
      });
    };

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      [canvas, mapCanvas].forEach(c => {
        c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
        c.style.width = `${W}px`; c.style.height = `${H}px`;
      });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildMap();
      buildCols();
    };

    const spawnArc = (now: number) => {
      const from = Math.floor(Math.random() * CITIES.length);
      let to = Math.floor(Math.random() * CITIES.length);
      if (to === from) to = (from + 1) % CITIES.length;
      const r = Math.random();
      const color = r > 0.55 ? "#00FF41" : r > 0.25 ? "#00BFFF" : "#BF5FFF";
      arcs.push({ from, to, color, alpha: 0.65 + Math.random() * 0.25, startedAt: now, duration: 2200 + Math.random() * 2000, trailPts: [] });
    };

    const drawStreams = (now: number) => {
      ctx.save();
      ctx.fillStyle = "#00FF41";
      ctx.font = '500 8px "JetBrains Mono", monospace';
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      cols.forEach(col => {
        if (now - col.lastMut > 950 + col.phase * 80) {
          col.chars[Math.floor(Math.random() * col.chars.length)] = token();
          col.lastMut = now;
        }
        const sh = col.chars.length * col.spacing;
        const top = (col.offset + now * col.speed / 1000) % (H + sh) - sh;
        const breath = 0.022 + (Math.sin(now * 0.0004 + col.phase) + 1) * 0.008;
        col.chars.forEach((ch, idx) => {
          const p = idx / Math.max(1, col.chars.length - 1);
          ctx.globalAlpha = breath * Math.sin(Math.PI * p);
          ctx.fillText(ch, col.x, top + idx * col.spacing);
        });
      });
      ctx.restore();
    };

    const drawArcs = (now: number) => {
      arcs.forEach(arc => {
        const [x1, y1] = project(...CITIES[arc.from].slice(0, 2) as [number, number], W, H);
        const [x2, y2] = project(...CITIES[arc.to].slice(0, 2) as [number, number], W, H);
        const [cx, cy] = arcControl(x1, y1, x2, y2);

        // Faint full arc wire
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.strokeStyle = arc.color;
        ctx.globalAlpha = 0.06;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();

        // Animated packet
        const elapsed = (now - arc.startedAt) / arc.duration;
        const t = Math.min(1, elapsed);
        const [px, py] = bezierPt(t, x1, y1, cx, cy, x2, y2);

        arc.trailPts.push([px, py]);
        if (arc.trailPts.length > 18) arc.trailPts.shift();

        ctx.save();
        arc.trailPts.forEach(([tx, ty], i) => {
          ctx.beginPath();
          ctx.arc(tx, ty, 1.5 * (i / arc.trailPts.length), 0, Math.PI * 2);
          ctx.fillStyle = arc.color;
          ctx.globalAlpha = (i / arc.trailPts.length) * arc.alpha * 0.5;
          ctx.fill();
        });
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = arc.color;
        ctx.globalAlpha = arc.alpha;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });
    };

    const drawCityNodes = (now: number) => {
      CITIES.forEach(([lon, lat, size], idx) => {
        const [x, y] = project(lon, lat, W, H);
        const isActive = arcs.some(a => a.from === idx || a.to === idx);
        const color = isActive ? "#00FF41" : "#00BFFF";
        const r = size * 1.4 + (isActive ? 1 : 0);

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = isActive ? 0.7 : 0.28;
        ctx.shadowColor = color;
        ctx.shadowBlur = isActive ? 12 : 5;
        ctx.fill();
        ctx.restore();

        cityPulses.filter(p => p.cityIdx === idx).forEach(p => {
          const prog = Math.min(1, (now - p.startedAt) / p.duration);
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, r + prog * 18, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (1 - prog) * 0.45;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        });
      });
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(mapCanvas, 0, 0, W, H);
      drawStreams(now);
      drawArcs(now);
      drawCityNodes(now);

      if (!reducedMotion) {
        if (now >= nextArcAt) {
          spawnArc(now);
          nextArcAt = now + 1000 + Math.random() * 1800;
        }
        arcs = arcs.filter(a => (now - a.startedAt) < a.duration + 400);
        if (arcs.length > 6) arcs = arcs.slice(-6);

        arcs.forEach(a => {
          const elapsed = (now - a.startedAt) / a.duration;
          if (elapsed >= 0.97 && elapsed < 1.05) {
            const alreadyPulsing = cityPulses.some(p => p.cityIdx === a.to && now - p.startedAt < 200);
            if (!alreadyPulsing) cityPulses.push({ cityIdx: a.to, startedAt: now, duration: 900, color: a.color });
          }
        });
        cityPulses = cityPulses.filter(p => now - p.startedAt < p.duration);

        if (now >= nextCityPulseAt) {
          cityPulses.push({ cityIdx: Math.floor(Math.random() * CITIES.length), startedAt: now, duration: 900, color: Math.random() > 0.5 ? "#00FF41" : "#00BFFF" });
          nextCityPulseAt = now + 1500 + Math.random() * 2000;
        }
      }
    };

    const animate = (now: number) => {
      if (now - lastFrame >= 1000 / TARGET_FPS) { lastFrame = now; draw(now); }
      animFrame = requestAnimationFrame(animate);
    };

    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(animFrame); animFrame = 0; }
      else if (!reducedMotion && !animFrame) { lastFrame = performance.now(); animFrame = requestAnimationFrame(animate); }
    };

    const handleResize = () => {
      resize();
      if (reducedMotion) draw(performance.now());
    };

    resize();
    if (reducedMotion) draw(performance.now());
    else animFrame = requestAnimationFrame(animate);
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <div className="cyber-background" aria-hidden="true">
        <div className="cyber-background__orb cyber-background__orb--purple" />
        <div className="cyber-background__orb cyber-background__orb--teal" />
        <div className="cyber-background__orb cyber-background__orb--cyan" />
        <canvas ref={canvasRef} />
      </div>
      <i className="hud-corner hud-corner--tl" />
      <i className="hud-corner hud-corner--tr" />
      <i className="hud-corner hud-corner--bl" />
      <i className="hud-corner hud-corner--br" />
      <div className="cyber-scanlines" />
    </>
  );
}

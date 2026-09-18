'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { SceneMeta } from '@/types/game';

// ─── Internal canvas dimensions (scaled up with CSS) ─────────────────────────
const W = 192;
const H = 64;

interface PixelSceneProps {
  sceneMeta: SceneMeta | null;
  theme: 'dark-fantasy' | 'eldritch-horror';
}

// ─── Colour palettes ─────────────────────────────────────────────────────────

function parseLighting(lighting: string): { top: string; bottom: string } {
  const l = lighting.toLowerCase();
  if (l.includes('blood') || l.includes('crimson') || l.includes('red'))
    return { top: '#1a0010', bottom: '#3a0820' };
  if (l.includes('dawn') || l.includes('dusk') || l.includes('sunset'))
    return { top: '#1a0a00', bottom: '#3d1800' };
  if (l.includes('pale') || l.includes('moonlit') || l.includes('moonlight'))
    return { top: '#080818', bottom: '#10102a' };
  if (l.includes('torch') || l.includes('fire') || l.includes('amber'))
    return { top: '#120800', bottom: '#281400' };
  if (l.includes('void') || l.includes('dark') || l.includes('pitch'))
    return { top: '#000005', bottom: '#05000a' };
  if (l.includes('fog') || l.includes('overcast') || l.includes('grey'))
    return { top: '#0d0d12', bottom: '#141420' };
  // default: deep night
  return { top: '#08080f', bottom: '#10101e' };
}

// ─── Sky layer ────────────────────────────────────────────────────────────────

function drawSky(
  ctx: CanvasRenderingContext2D,
  lighting: string,
  tick: number
): void {
  const { top, bottom } = parseLighting(lighting);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Moon / blood moon
  const l = lighting.toLowerCase();
  if (l.includes('blood') || l.includes('crimson') || l.includes('moon')) {
    const pulse = 0.85 + Math.sin(tick * 0.04) * 0.15;
    const moonColor = l.includes('blood') || l.includes('crimson')
      ? `rgba(220,40,60,${pulse})`
      : `rgba(200,200,230,${pulse})`;
    ctx.beginPath();
    ctx.arc(W - 28, 14, 8, 0, Math.PI * 2);
    ctx.fillStyle = moonColor;
    ctx.fill();
    // Moon glow
    const glow = ctx.createRadialGradient(W - 28, 14, 4, W - 28, 14, 20);
    glow.addColorStop(0, l.includes('blood') ? 'rgba(200,20,40,0.3)' : 'rgba(180,180,220,0.15)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(W - 50, 0, 44, 36);
  }

  // Stars
  if (!l.includes('dawn') && !l.includes('fire')) {
    ctx.fillStyle = 'rgba(220,215,240,0.7)';
    const stars = [
      [12, 6], [34, 3], [55, 8], [78, 4], [98, 7], [115, 2],
      [140, 9], [158, 5], [170, 11], [20, 15], [62, 12], [130, 14],
    ];
    stars.forEach(([x, y]) => {
      const twinkle = Math.sin(tick * 0.06 + x * 0.3) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle;
      ctx.fillRect(x, y, 1, 1);
    });
    ctx.globalAlpha = 1;
  }
}

// ─── Weather layer ────────────────────────────────────────────────────────────

function drawWeather(
  ctx: CanvasRenderingContext2D,
  weather: string,
  tick: number
): void {
  const w = weather.toLowerCase();

  if (w.includes('mist') || w.includes('fog')) {
    // Scrolling horizontal mist strips
    for (let i = 0; i < 4; i++) {
      const offset = ((tick * (0.3 + i * 0.08) + i * 48) % (W + 48)) - 48;
      const y = 28 + i * 7;
      const stripGrad = ctx.createLinearGradient(offset, 0, offset + 80, 0);
      stripGrad.addColorStop(0, 'transparent');
      stripGrad.addColorStop(0.3, 'rgba(160,155,180,0.18)');
      stripGrad.addColorStop(0.7, 'rgba(160,155,180,0.18)');
      stripGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = stripGrad;
      ctx.fillRect(offset, y, 80, 4);
    }
  }

  if (w.includes('rain') || w.includes('storm')) {
    ctx.strokeStyle = 'rgba(140,160,200,0.5)';
    ctx.lineWidth = 1;
    const count = w.includes('storm') ? 28 : 16;
    for (let i = 0; i < count; i++) {
      const x = ((i * 37 + tick * 2) % (W + 10)) - 5;
      const yBase = ((tick * 3 + i * 19) % (H + 10)) - 5;
      ctx.beginPath();
      ctx.moveTo(x, yBase);
      ctx.lineTo(x - 1, yBase + 5);
      ctx.stroke();
    }
  }

  if (w.includes('snow')) {
    ctx.fillStyle = 'rgba(230,235,255,0.8)';
    for (let i = 0; i < 18; i++) {
      const x = ((i * 43 + tick * 0.5) % W);
      const y = ((tick * 1 + i * 27) % H);
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }
  }

  if (w.includes('ash') || w.includes('ember')) {
    ctx.fillStyle = 'rgba(200,120,60,0.7)';
    for (let i = 0; i < 12; i++) {
      const x = ((i * 53 + tick * 0.8 + Math.sin(tick * 0.1 + i) * 6) % W);
      const y = ((tick * 0.6 + i * 31) % H);
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
  }
}

// ─── Silhouette layer ─────────────────────────────────────────────────────────

function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  biome: string,
  theme: string,
  tick: number
): void {
  const b = biome.toLowerCase();
  const color = 'rgba(0,0,0,0.92)';
  ctx.fillStyle = color;

  if (b.includes('dungeon') || b.includes('crypt') || b.includes('catacomb')) {
    // Stone floor
    ctx.fillRect(0, 52, W, 12);
    // Archway
    ctx.fillRect(72, 22, 48, 30);
    ctx.beginPath();
    ctx.arc(96, 22, 24, Math.PI, 0, false);
    ctx.fill();
    // Cut out arch interior
    ctx.fillStyle = 'rgba(30,0,20,0.8)';
    ctx.fillRect(78, 28, 36, 24);
    ctx.beginPath();
    ctx.arc(96, 28, 18, Math.PI, 0, false);
    ctx.fill();
    ctx.fillStyle = color;
    // Chains
    for (let i = 0; i < 3; i++) {
      const cx = 82 + i * 14;
      for (let j = 0; j < 5; j++) {
        ctx.fillRect(cx, 26 + j * 4, 2, 2);
      }
    }
    // Flanking walls
    ctx.fillRect(0, 30, 68, 34);
    ctx.fillRect(148, 30, W - 148, 34);

  } else if (b.includes('dock') || b.includes('harbour') || b.includes('harbor') || b.includes('port') || b.includes('sea') || b.includes('coastal')) {
    // Water
    ctx.fillRect(0, 56, W, 8);
    for (let i = 0; i < 4; i++) {
      const waveX = ((tick * 0.5 + i * 48) % (W + 10)) - 5;
      ctx.fillRect(waveX, 54, 28, 2);
    }
    // Dock planks
    ctx.fillRect(20, 50, 160, 6);
    // Mast 1
    ctx.fillRect(40, 14, 3, 36);
    // Rigging
    ctx.beginPath();
    ctx.moveTo(41, 14); ctx.lineTo(70, 46);
    ctx.moveTo(41, 14); ctx.lineTo(20, 40);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    // Sail
    ctx.fillRect(44, 18, 22, 20);
    // Mast 2
    ctx.fillRect(120, 18, 3, 32);
    ctx.fillRect(124, 22, 18, 16);
    // Hull
    ctx.fillRect(28, 46, 60, 10);
    ctx.fillRect(108, 46, 40, 8);

  } else if (b.includes('forest') || b.includes('moor') || b.includes('swamp') || b.includes('woods')) {
    // Ground
    ctx.fillRect(0, 50, W, 14);
    // Jagged treeline
    const treeProfile = [
      [0, 50], [8, 28], [14, 38], [22, 18], [30, 32], [40, 20],
      [48, 35], [58, 15], [68, 28], [78, 12], [90, 26], [100, 18],
      [112, 30], [122, 14], [132, 24], [144, 10], [156, 28], [166, 20],
      [178, 35], [192, 22], [192, 50],
    ];
    ctx.beginPath();
    ctx.moveTo(0, 64);
    treeProfile.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(W, 64);
    ctx.closePath();
    ctx.fill();

  } else if (b.includes('spire') || b.includes('tower') || b.includes('castle') || b.includes('city') || b.includes('citadel')) {
    // Ground / wall base
    ctx.fillRect(0, 52, W, 12);
    // Central spire
    ctx.fillRect(86, 10, 20, 42);
    ctx.beginPath();
    ctx.moveTo(86, 10); ctx.lineTo(96, 0); ctx.lineTo(106, 10);
    ctx.closePath(); ctx.fill();
    // Battlements
    for (let i = 0; i < 5; i++) ctx.fillRect(87 + i * 4, 10, 2, 4);
    // Left tower
    ctx.fillRect(30, 28, 14, 24);
    ctx.beginPath();
    ctx.moveTo(30, 28); ctx.lineTo(37, 18); ctx.lineTo(44, 28);
    ctx.closePath(); ctx.fill();
    // Right tower
    ctx.fillRect(148, 24, 14, 28);
    ctx.beginPath();
    ctx.moveTo(148, 24); ctx.lineTo(155, 14); ctx.lineTo(162, 24);
    ctx.closePath(); ctx.fill();
    // Connecting walls
    ctx.fillRect(44, 42, 42, 10);
    ctx.fillRect(106, 42, 42, 10);

  } else if (b.includes('cathedral') || b.includes('chapel') || b.includes('church')) {
    ctx.fillRect(0, 52, W, 12);
    // Nave
    ctx.fillRect(46, 24, 100, 28);
    // Rose window cutout
    ctx.fillStyle = 'rgba(40,0,20,0.9)';
    ctx.beginPath();
    ctx.arc(96, 36, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    // Steeple
    ctx.fillRect(84, 8, 24, 16);
    ctx.beginPath();
    ctx.moveTo(84, 8); ctx.lineTo(96, -2); ctx.lineTo(108, 8);
    ctx.closePath(); ctx.fill();
    // Buttresses
    ctx.fillRect(30, 36, 16, 16);
    ctx.fillRect(46, 32, 8, 20);
    ctx.fillRect(146, 36, 16, 16);
    ctx.fillRect(138, 32, 8, 20);

  } else if (b.includes('void') || b.includes('abyss') || b.includes('plane') || b.includes('realm')) {
    // Eldritch swirling eye
    const cx = W / 2, cy = H / 2 + 6;
    const pulse = 1 + Math.sin(tick * 0.05) * 0.1;
    ctx.fillStyle = 'rgba(80,0,40,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 50 * pulse, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tentacle silhouettes
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + tick * 0.02;
      const len = 20 + Math.sin(tick * 0.07 + i) * 6;
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(angle) * 30,
        cy + Math.sin(angle) * 10,
        4, len, angle + Math.PI / 2, 0, Math.PI * 2
      );
      ctx.fill();
    }
    // Ground void
    ctx.fillStyle = color;
    ctx.fillRect(0, 56, W, 8);

  } else {
    // Default: silhouetted horizon with rocky outcrops
    ctx.fillRect(0, 50, W, 14);
    const outcrops = [[15, 40, 20, 10], [55, 38, 14, 12], [90, 44, 18, 6], [130, 36, 22, 14], [170, 42, 16, 8]];
    outcrops.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PixelScene({ sceneMeta, theme }: PixelSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tickRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    const tick = tickRef.current;

    const biome = sceneMeta?.biome ?? (theme === 'eldritch-horror' ? 'void' : 'dungeon');
    const lighting = sceneMeta?.lighting ?? (theme === 'eldritch-horror' ? 'void' : 'moonlit');
    const weather = sceneMeta?.weather ?? 'mist';

    drawSky(ctx, lighting, tick);
    drawWeather(ctx, weather, tick);
    drawSilhouette(ctx, biome, theme, tick);

    tickRef.current += 1;
    rafRef.current = requestAnimationFrame(draw);
  }, [sceneMeta, theme]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className="pixel-scene" aria-hidden="true">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="pixel-canvas"
      />
      {/* Gradient overlay to blend into the main background */}
      <div className="pixel-scene__vignette" />
    </div>
  );
}

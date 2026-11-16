import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ExternalLink,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Monitor,
  RotateCcw,
  Share2,
  Smartphone,
  Tablet,
  Youtube,
  RefreshCw,
} from 'lucide-react';
import { hexToRgbaString } from '../core/contrast';
import type { ThemeConfig, ThemeProject } from '../core/types';

const DEMO_AVATAR_URL = '/src/assets/images/demo_avatar_futuristic_1794859273831.jpg';
const BG_OBSIDIAN_URL = '/src/assets/images/bg_obsidian_architecture_1794859274188.jpg';
const BG_AURORA_URL = '/src/assets/images/bg_aurora_nebula_1794859274083.jpg';

export interface DevicePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  category: 'mobile' | 'tablet' | 'desktop';
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'mobile-compact', label: 'Mobile compacto', width: 320, height: 568, category: 'mobile' },
  { id: 'mobile-std', label: 'Mobile padrão', width: 375, height: 812, category: 'mobile' },
  { id: 'mobile-wide', label: 'Mobile amplo', width: 430, height: 932, category: 'mobile' },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024, category: 'tablet' },
  { id: 'desktop', label: 'Desktop', width: 1440, height: 900, category: 'desktop' },
  { id: 'desktop-fhd', label: 'Desktop Full HD', width: 1920, height: 1080, category: 'desktop' },
];

interface LinkStackSimulatorProps {
  project: ThemeProject;
}

function GeometricOverlaySvg({ config }: { config: ThemeConfig }) {
  const { geometry, colors } = config;
  if (geometry.layer === 'none') return null;

  const style = {
    opacity: geometry.opacity,
    transform: `scale(${geometry.scale})`,
    transition: 'opacity 0.25s ease, transform 0.25s ease',
  };

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        geometry.animated ? 'animate-[pulse_7s_ease-in-out_infinite]' : ''
      }`}
      style={style}
      aria-hidden="true"
    >
      {geometry.layer === 'hexagons' && (
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ls-hex" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon
                points="30,2 56,16 56,40 30,50 4,40 4,16"
                fill="none"
                stroke={colors.accentPrimary}
                strokeWidth="0.9"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ls-hex)" />
        </svg>
      )}

      {geometry.layer === 'luminous-circles' && (
        <svg className="h-full w-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
          <circle cx="300" cy="180" r="140" fill="none" stroke={colors.accentPrimary} strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="300" cy="180" r="215" fill="none" stroke={colors.accentSecondary} strokeWidth="0.8" />
          <circle cx="300" cy="760" r="240" fill="none" stroke={colors.accentPrimary} strokeWidth="0.7" opacity="0.6" />
        </svg>
      )}

      {geometry.layer === 'tech-frames' && (
        <div className="relative h-full w-full p-4">
          <div
            className="h-full w-full border relative"
            style={{ borderColor: hexToRgbaString(colors.accentPrimary, 0.25) }}
          >
            <span
              className="absolute -top-px -left-px border-t-2 border-l-2"
              style={{
                width: geometry.frameCornerSizePx,
                height: geometry.frameCornerSizePx,
                borderColor: colors.accentPrimary,
              }}
            />
            <span
              className="absolute -top-px -right-px border-t-2 border-r-2"
              style={{
                width: geometry.frameCornerSizePx,
                height: geometry.frameCornerSizePx,
                borderColor: colors.accentPrimary,
              }}
            />
            <span
              className="absolute -bottom-px -left-px border-b-2 border-l-2"
              style={{
                width: geometry.frameCornerSizePx,
                height: geometry.frameCornerSizePx,
                borderColor: colors.accentSecondary,
              }}
            />
            <span
              className="absolute -bottom-px -right-px border-b-2 border-r-2"
              style={{
                width: geometry.frameCornerSizePx,
                height: geometry.frameCornerSizePx,
                borderColor: colors.accentSecondary,
              }}
            />
          </div>
        </div>
      )}

      {geometry.layer === 'diagonal-lines' && (
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ls-diag" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="32" stroke={colors.accentPrimary} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ls-diag)" />
        </svg>
      )}

      {geometry.layer === 'dynamic-borders' && (
        <div
          className="absolute inset-3 rounded-2xl border-2"
          style={{
            borderColor: colors.accentPrimary,
            boxShadow: `inset 0 0 32px ${hexToRgbaString(colors.accentSecondary, 0.35)}`,
          }}
        />
      )}

      {geometry.layer === 'holographic-shards' && (
        <svg className="h-full w-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
          <polygon points="40,80 180,20 130,210" fill={hexToRgbaString(colors.accentPrimary, 0.14)} stroke={colors.accentPrimary} strokeWidth="0.8" />
          <polygon points="550,140 420,240 570,350" fill={hexToRgbaString(colors.accentSecondary, 0.14)} stroke={colors.accentSecondary} strokeWidth="0.8" />
          <polygon points="80,680 220,760 60,840" fill={hexToRgbaString(colors.accentSecondary, 0.12)} stroke={colors.accentPrimary} strokeWidth="0.8" />
        </svg>
      )}

      {geometry.layer === 'depth-layers' && (
        <div className="h-full w-full relative">
          <div
            className="absolute left-1/2 top-16 -translate-x-1/2 h-72 w-72 rounded-3xl rotate-12 border"
            style={{ borderColor: hexToRgbaString(colors.accentPrimary, 0.35) }}
          />
          <div
            className="absolute left-1/2 top-24 -translate-x-1/2 h-72 w-72 rounded-3xl -rotate-6 border"
            style={{ borderColor: hexToRgbaString(colors.accentSecondary, 0.3) }}
          />
        </div>
      )}

      {geometry.layer === 'abstract-waves' && (
        <svg className="h-full w-full" viewBox="0 0 600 900" preserveAspectRatio="none">
          <path d="M0,180 C160,110 380,260 600,160" fill="none" stroke={colors.accentPrimary} strokeWidth="1.4" />
          <path d="M0,220 C200,150 400,300 600,200" fill="none" stroke={colors.accentSecondary} strokeWidth="1" />
          <path d="M0,740 C220,660 390,820 600,720" fill="none" stroke={colors.accentPrimary} strokeWidth="1.2" />
        </svg>
      )}
    </div>
  );
}

export function LinkStackSimulator({ project }: LinkStackSimulatorProps) {
  const [deviceId, setDeviceId] = useState<string>('mobile-std');
  const [landscape, setLandscape] = useState(false);
  const [denseContent, setDenseContent] = useState(false);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [replaySeed, setReplaySeed] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [stageWidth, setStageWidth] = useState(800);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const preset = DEVICE_PRESETS.find((d) => d.id === deviceId) ?? DEVICE_PRESETS[1];
  const frameWidth = landscape ? preset.height : preset.width;
  const frameHeight = landscape ? preset.width : preset.height;

  // Responsive scale factor so large desktop presets (1440x900 / 1920x1080) fit cleanly inside the studio viewport
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        setStageWidth(Math.max(280, stageRef.current.clientWidth - 24));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const scale = useMemo(() => {
    if (frameWidth <= stageWidth) return 1;
    return Math.max(0.28, Number((stageWidth / frameWidth).toFixed(3)));
  }, [frameWidth, stageWidth]);

  // Canvas background renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cfg = project.config;
    const w = (canvas.width = frameWidth);
    const h = (canvas.height = frameHeight);
    const count = Math.max(18, Math.round((cfg.background.intensity / 100) * 58));

    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.7 * cfg.background.speed,
      vy: (Math.random() - 0.5) * 0.7 * cfg.background.speed,
      r: 1.2 + Math.random() * 2.2,
    }));

    let rafId = 0;
    let tick = 0;

    const draw = () => {
      tick += 0.015 * cfg.background.speed;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = cfg.background.opacity;

      const effect = cfg.background.effect;

      if (effect === 'digital-grid' || effect === 'tech-pattern') {
        const step = effect === 'tech-pattern' ? 32 : 44;
        ctx.strokeStyle = hexToRgbaString(cfg.colors.accentPrimary, 0.24);
        ctx.lineWidth = 1;
        const offset = forceReducedMotion ? 0 : (tick * 24) % step;
        for (let x = 0; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = offset; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      } else if (effect === 'futuristic-lines') {
        ctx.strokeStyle = hexToRgbaString(cfg.colors.accentPrimary, 0.35);
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 12; i++) {
          const yBase = (i / 12) * h + (forceReducedMotion ? 0 : Math.sin(tick + i) * 14);
          ctx.beginPath();
          ctx.moveTo(0, yBase);
          ctx.lineTo(w, yBase - 40);
          ctx.stroke();
        }
      } else if (effect === 'geometric-waves') {
        for (let l = 0; l < 4; l++) {
          ctx.strokeStyle =
            l % 2 === 0
              ? hexToRgbaString(cfg.colors.accentPrimary, 0.42)
              : hexToRgbaString(cfg.colors.accentSecondary, 0.35);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 12) {
            const y =
              h * 0.35 +
              l * 65 +
              Math.sin(x * 0.014 + tick + l) * (18 + cfg.background.intensity * 0.25);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (effect === 'particles-network') {
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          if (!forceReducedMotion) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
          }
          ctx.fillStyle = i % 2 === 0 ? cfg.colors.accentPrimary : cfg.colors.accentSecondary;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

          for (let j = i + 1; j < pts.length; j++) {
            const q = pts[j];
            const dist = Math.hypot(p.x - q.x, p.y - q.y);
            if (dist < 85) {
              ctx.strokeStyle = hexToRgbaString(cfg.colors.accentPrimary, (1 - dist / 85) * 0.35);
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.stroke();
            }
          }
        }
      }

      if (!forceReducedMotion) {
        rafId = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [project.config, frameWidth, frameHeight, forceReducedMotion]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

  const cfg = project.config;
  const demoLinks = useMemo(() => {
    const base = [
      { id: 'l1', title: 'Portfólio & Arquitetura Digital', sub: 'Projetos selecionados 2026', kind: 'primary' },
      { id: 'l2', title: 'Canal de Engenharia & UI', sub: 'Estudos de caso em vídeo', kind: 'external' },
      { id: 'l3', title: 'Repositório Open Source', sub: 'Componentes e utilitários', kind: 'external' },
      { id: 'l4', title: 'Consultoria & Contato Direto', sub: 'Agenda aberta', kind: 'external' },
    ];
    if (!denseContent) return base;
    return [
      ...base,
      { id: 'l5', title: 'Sistema de Design Modular', sub: 'Tokens e acessibilidade', kind: 'external' },
      { id: 'l6', title: 'Newsletter Técnica Semanal', sub: 'Arquitetura web e performance', kind: 'external' },
      { id: 'l7', title: 'Kit de Ícones Vetoriais', sub: 'Download gratuito MIT', kind: 'external' },
    ];
  }, [denseContent]);

  const backgroundStyle = useMemo(() => {
    const c = cfg.colors;
    if (cfg.background.effect === 'aurora') {
      return {
        backgroundImage: `radial-gradient(ellipse 80% 50% at 20% 15%, ${hexToRgbaString(
          c.accentPrimary,
          0.32 * cfg.background.opacity,
        )}, transparent 65%), radial-gradient(ellipse 75% 55% at 85% 75%, ${hexToRgbaString(
          c.accentSecondary,
          0.26 * cfg.background.opacity,
        )}, transparent 65%), radial-gradient(ellipse at bottom, ${c.backgroundSecondary} 0%, ${c.backgroundPrimary} 100%)`,
      };
    }
    if (cfg.background.effect === 'depth-glow') {
      return {
        backgroundImage: `radial-gradient(circle at 50% 18%, ${hexToRgbaString(
          c.accentPrimary,
          0.35 * cfg.background.opacity,
        )}, transparent 52%), linear-gradient(180deg, ${c.backgroundPrimary} 0%, ${c.backgroundSecondary} 100%)`,
      };
    }
    if (cfg.background.effect === 'animated-gradient') {
      return {
        backgroundImage: `linear-gradient(135deg, ${c.backgroundPrimary}, ${c.backgroundSecondary}, ${hexToRgbaString(
          c.accentPrimary,
          0.25,
        )}, ${c.backgroundPrimary})`,
        backgroundSize: '260% 260%',
      };
    }
    return {
      background: `radial-gradient(ellipse at top, ${c.backgroundSecondary} 0%, ${c.backgroundPrimary} 100%)`,
    };
  }, [cfg]);

  const getButtonStyle = (index: number): React.CSSProperties => {
    const c = cfg.colors;
    const b = cfg.buttons;
    const delayMs =
      cfg.animations.entrance === 'staggered'
        ? cfg.animations.entranceDelayMs + index * cfg.animations.staggerStepMs
        : cfg.animations.entranceDelayMs;

    const base: React.CSSProperties = {
      borderRadius: `${b.borderRadiusPx}px`,
      minHeight: `${b.minHeightPx}px`,
      color: c.buttonText,
      letterSpacing: `${b.letterSpacingEm}em`,
      borderWidth: `${b.borderWidthPx}px`,
      borderStyle: 'solid',
      borderColor: hexToRgbaString(c.buttonBorder, 0.65),
      animationDelay: forceReducedMotion ? '0ms' : `${delayMs}ms`,
      animationDuration: forceReducedMotion ? '0ms' : `${cfg.animations.entranceDurationMs}ms`,
      boxShadow: `0 10px 24px -10px rgba(0,0,0,${((b.shadowIntensity / 100) * 0.6).toFixed(2)})`,
    };

    if (b.style === 'glassmorphism') {
      base.background = `linear-gradient(135deg, ${hexToRgbaString(c.buttonBg, c.buttonBgOpacity)}, ${hexToRgbaString(
        c.backgroundSecondary,
        0.45,
      )})`;
      base.backdropFilter = `blur(${b.glassBlurPx}px)`;
    } else if (b.style === 'gradient-fill') {
      base.background = `linear-gradient(120deg, ${hexToRgbaString(c.buttonBg, 0.94)}, ${hexToRgbaString(
        c.accentSecondary,
        0.34,
      )})`;
    } else if (b.style === 'neon-border') {
      base.backgroundColor = hexToRgbaString(c.buttonBg, 0.42);
      base.boxShadow = `0 0 ${Math.round(b.glowSpreadPx * 0.45)}px ${hexToRgbaString(
        c.buttonBorder,
        0.4,
      )}, inset 0 0 10px ${hexToRgbaString(c.buttonBorder, 0.14)}`;
    } else if (b.style === 'cyber-bevel') {
      base.backgroundColor = hexToRgbaString(c.buttonBg, c.buttonBgOpacity);
      base.clipPath =
        'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)';
    } else if (b.style === 'holographic-rim') {
      base.background = `linear-gradient(135deg, ${hexToRgbaString(c.buttonBg, 0.88)}, ${hexToRgbaString(
        c.backgroundSecondary,
        0.9,
      )})`;
      base.borderColor = c.accentPrimary;
      base.boxShadow = `0 0 14px ${hexToRgbaString(c.accentSecondary, 0.3)}`;
    } else {
      base.backgroundColor = hexToRgbaString(c.buttonBg, c.buttonBgOpacity);
    }

    return base;
  };

  const entranceClass = useMemo(() => {
    if (forceReducedMotion || cfg.animations.entrance === 'none') return '';
    switch (cfg.animations.entrance) {
      case 'fade-in':
        return 'animate-[fadeIn_0.5s_ease_both]';
      case 'slide-down':
        return 'animate-[slideDownSim_0.5s_ease_both]';
      case 'zoom-in':
        return 'animate-[zoomInSim_0.45s_ease_both]';
      case 'blur-to-focus':
        return 'animate-[blurFocusSim_0.6s_ease_both]';
      default:
        return 'animate-[slideUpSim_0.55s_cubic-bezier(0.16,1,0.3,1)_both]';
    }
  }, [cfg.animations.entrance, forceReducedMotion]);

  const backdropImageUrl =
    cfg.background.effect === 'image-backdrop' || cfg.background.imagePreset !== 'none'
      ? cfg.background.imagePreset === 'aurora'
        ? BG_AURORA_URL
        : BG_OBSIDIAN_URL
      : null;

  return (
    <div className="flex h-full flex-col">
      {/* Device & Simulation Toolbar */}
      <div className="flex flex-col gap-2 border-b border-slate-800/80 bg-[#0D111A] px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {/* Mobile compact device selector + desktop preset buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto studio-scroll">
          <div className="sm:hidden flex-1 min-w-[165px]">
            <label htmlFor="sim-device-select" className="sr-only">
              Dispositivo simulado
            </label>
            <select
              id="sim-device-select"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
            >
              {DEVICE_PRESETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} ({d.width}×{d.height})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex flex-wrap items-center gap-1.5">
            {DEVICE_PRESETS.map((d) => {
              const active = d.id === deviceId;
              const Icon =
                d.category === 'mobile' ? Smartphone : d.category === 'tablet' ? Tablet : Monitor;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDeviceId(d.id)}
                  title={`${d.label} (${d.width}×${d.height})`}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{d.label}</span>
                  <span className="font-mono text-[11px] tabular-nums opacity-80">
                    {d.width}×{d.height}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto studio-scroll">
          <button
            type="button"
            onClick={() => setLandscape((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{landscape ? 'Horizontal' : 'Vertical'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDenseContent((v) => !v)}
            className={`rounded-md border px-2.5 py-1.5 text-xs cursor-pointer whitespace-nowrap shrink-0 ${
              denseContent
                ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
            }`}
          >
            {denseContent ? 'Rolagem Longa' : 'Conteúdo Padrão'}
          </button>

          <button
            type="button"
            onClick={() => setForceReducedMotion((v) => !v)}
            className={`rounded-md border px-2.5 py-1.5 text-xs cursor-pointer whitespace-nowrap shrink-0 ${
              forceReducedMotion
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
            }`}
          >
            {forceReducedMotion ? 'Mov. Reduzido: ON' : 'Movimento Normal'}
          </button>

          <button
            type="button"
            onClick={() => setReplaySeed((s) => s + 1)}
            title="Reproduzir animação de entrada"
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Simulator Viewport Stage */}
      <div
        ref={stageRef}
        className="relative flex-1 overflow-auto bg-[#07090F] p-3 sm:p-6 flex flex-col items-center"
      >
        <style>{`
          @keyframes slideUpSim { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideDownSim { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes zoomInSim { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
          @keyframes blurFocusSim { from { opacity: 0; filter: blur(8px); transform: translateY(10px); } to { opacity: 1; filter: blur(0); transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>

        <div className="mb-2 flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">
          <span>
            Viewport: {frameWidth}×{frameHeight}px
          </span>
          {scale < 1 && <span>· Escala {Math.round(scale * 100)}%</span>}
        </div>

        {/* Scaled Device Frame */}
        <div
          style={{
            width: `${Math.round(frameWidth * scale)}px`,
            height: `${Math.round(frameHeight * scale)}px`,
          }}
          className="relative shrink-0"
        >
          <div
            data-testid="linkstack-simulator-frame"
            style={{
              width: `${frameWidth}px`,
              height: `${frameHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              fontFamily: `'${cfg.typography.fontFamily}', system-ui, sans-serif`,
              fontSize: `${cfg.typography.baseFontSizePx}px`,
              ...backgroundStyle,
            }}
            className="relative overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-700/80 shadow-2xl studio-scroll"
          >
            {/* Optional Generated Image Backdrop */}
            {backdropImageUrl && (
              <img
                src={backdropImageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style={{ opacity: cfg.background.opacity * 0.55 }}
              />
            )}

            {/* Live Canvas Layer */}
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            />

            {/* Geometric Overlay Layer */}
            <GeometricOverlaySvg config={cfg} />

            {/* Authentic LinkStack Page DOM Structure */}
            <div key={replaySeed} className="relative z-10 min-h-full flex flex-col justify-between pb-6">
              <div>
                {/* Share Button (.sharediv / .sharebutton) */}
                <div className="flex justify-end px-4 pt-4">
                  <button
                    type="button"
                    onClick={() => showToast('Link da página LinkStack copiado (simulação).')}
                    style={{
                      borderColor: hexToRgbaString(cfg.colors.buttonBorder, 0.6),
                      borderWidth: `${cfg.buttons.borderWidthPx}px`,
                      borderRadius: `${Math.min(cfg.buttons.borderRadiusPx, 14)}px`,
                      backgroundColor: hexToRgbaString(cfg.colors.buttonBg, cfg.colors.buttonBgOpacity),
                      color: cfg.colors.buttonText,
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold backdrop-blur-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Compartilhar</span>
                  </button>
                </div>

                {/* Main .container */}
                <div
                  className="mx-auto px-4"
                  style={{
                    maxWidth: `${cfg.layout.containerMaxWidthPx}px`,
                    paddingTop: `${Math.max(12, cfg.layout.verticalPaddingPx - 20)}px`,
                    textAlign: cfg.typography.alignment,
                  }}
                >
                  {/* Avatar (.rounded-avatar) */}
                  <div
                    className={`mb-4 flex ${
                      cfg.typography.alignment === 'left' ? 'justify-start' : 'justify-center'
                    } ${entranceClass}`}
                  >
                    {avatarBroken ? (
                      <div
                        className="flex items-center justify-center font-bold text-xl"
                        style={{
                          width: `${cfg.layout.avatarSizePx}px`,
                          height: `${cfg.layout.avatarSizePx}px`,
                          borderRadius: `${cfg.layout.avatarRadiusPercent}%`,
                          border: `${cfg.layout.avatarBorderPx}px solid ${cfg.colors.buttonBorder}`,
                          backgroundColor: cfg.colors.buttonBg,
                          color: cfg.colors.accentPrimary,
                        }}
                      >
                        AV
                      </div>
                    ) : (
                      <img
                        src={DEMO_AVATAR_URL}
                        alt="Avatar demonstrativo Alex Vance"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarBroken(true)}
                        className="object-cover"
                        style={{
                          width: `${cfg.layout.avatarSizePx}px`,
                          height: `${cfg.layout.avatarSizePx}px`,
                          borderRadius: `${cfg.layout.avatarRadiusPercent}%`,
                          border: `${cfg.layout.avatarBorderPx}px solid ${cfg.colors.buttonBorder}`,
                          boxShadow: cfg.layout.avatarGlow
                            ? `0 0 24px ${hexToRgbaString(cfg.colors.accentPrimary, 0.45)}`
                            : '0 8px 20px rgba(0,0,0,0.35)',
                        }}
                      />
                    )}
                  </div>

                  {/* Profile Title (h1) */}
                  <h1
                    className={entranceClass}
                    style={{
                      color: cfg.colors.titleColor,
                      fontSize: `${cfg.typography.titleSizeRem}rem`,
                      fontWeight: cfg.typography.titleWeight,
                      letterSpacing: `${cfg.typography.titleLetterSpacingRem}rem`,
                      textTransform: cfg.typography.titleUppercase ? 'uppercase' : 'none',
                      lineHeight: 1.18,
                      marginBottom: '8px',
                    }}
                  >
                    Alex Vance
                  </h1>

                  {/* Description (p) */}
                  <p
                    className={entranceClass}
                    style={{
                      color: cfg.colors.descriptionColor,
                      fontSize: `${cfg.typography.descriptionSizeRem}rem`,
                      lineHeight: cfg.typography.descriptionLineHeight,
                      marginBottom: '18px',
                    }}
                  >
                    Engenheiro de Interfaces · Sistemas Interativos &amp; Arquitetura Web
                  </p>

                  {/* Social Icons (.social-icon-div) */}
                  <div
                    className={`flex flex-wrap gap-3 pb-6 ${
                      cfg.typography.alignment === 'left' ? 'justify-start' : 'justify-center'
                    }`}
                  >
                    {[
                      { icon: Github, label: 'GitHub' },
                      { icon: Youtube, label: 'YouTube' },
                      { icon: Linkedin, label: 'LinkedIn' },
                      { icon: Instagram, label: 'Instagram' },
                      { icon: Globe, label: 'Website' },
                    ].map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        type="button"
                        aria-label={`Simular ícone social ${label}`}
                        onClick={() => showToast(`Link social simulado: ${label}`)}
                        style={{ color: cfg.colors.socialIconColor }}
                        className="p-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>

                  {/* Section Header Block */}
                  <div
                    className="mb-3 text-xs font-semibold tracking-wider uppercase opacity-80"
                    style={{ color: cfg.colors.accentPrimary }}
                  >
                    Conexões &amp; Projetos
                  </div>

                  {/* Custom Buttons (.button.button-entrance.button-hover) */}
                  <div className="flex flex-col" style={{ gap: `${cfg.layout.buttonGapPx}px` }}>
                    {demoLinks.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => showToast(`Navegação simulada para "${item.title}"`)}
                        style={getButtonStyle(idx)}
                        className={`group relative w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer ${entranceClass}`}
                      >
                        <span className="min-w-0 pr-3">
                          <span className="block text-sm font-semibold truncate">{item.title}</span>
                          <span className="block text-xs opacity-75 truncate">{item.sub}</span>
                        </span>
                        <ExternalLink
                          className="h-4 w-4 shrink-0 opacity-75 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Text Block */}
                  <div
                    className="mt-5 rounded-xl border p-3.5 text-xs leading-relaxed"
                    style={{
                      borderColor: hexToRgbaString(cfg.colors.accentPrimary, 0.25),
                      backgroundColor: hexToRgbaString(cfg.colors.buttonBg, 0.4),
                      color: cfg.colors.descriptionColor,
                    }}
                  >
                    Bloco de texto demonstrativo do LinkStack para validar espaçadores, contraste tipográfico e comportamento de rolagem.
                  </div>
                </div>
              </div>

              {/* .credit-footer */}
              <div className="mt-8 flex justify-center px-4">
                <div
                  className="rounded-lg px-3.5 py-2 text-xs font-medium"
                  style={{
                    backgroundColor: hexToRgbaString(cfg.colors.footerBg, 0.72),
                    color: cfg.colors.footerText,
                  }}
                >
                  Tema {project.name} · v{project.version} · LinkStack
                </div>
              </div>
            </div>

            {/* Simulated Share Toast (.toastbox) */}
            {toastMsg && (
              <div
                role="status"
                className="sticky bottom-4 mx-auto w-72 rounded-lg border px-3 py-2 text-center text-xs font-medium shadow-lg z-30 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: hexToRgbaString(cfg.colors.backgroundSecondary, 0.94),
                  borderColor: cfg.colors.accentPrimary,
                  color: cfg.colors.titleColor,
                }}
              >
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.colors.accentPrimary }} />
                <span>{toastMsg}</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 max-w-xl text-center text-[11px] text-slate-500">
          Simulação isolada no navegador reproduzindo a estrutura DOM e seletores CSS reais do LinkStack. Diretivas Laravel Blade/PHP são simuladas sem alterar o servidor principal.
        </p>
      </div>
    </div>
  );
}

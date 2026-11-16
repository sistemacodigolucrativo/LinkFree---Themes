import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Maximize2,
  Monitor,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Tablet,
} from 'lucide-react';
import type { ThemeProject } from '../core/types';
import { LinkStackTemplateView } from './LinkStackTemplateView';

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
  onOpenFullscreen?: () => void;
}

export function LinkStackSimulator({ project, onOpenFullscreen }: LinkStackSimulatorProps) {
  const [deviceId, setDeviceId] = useState<string>('mobile-std');
  const [landscape, setLandscape] = useState(false);
  const [denseContent, setDenseContent] = useState(false);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [replaySeed, setReplaySeed] = useState(0);
  const [stageWidth, setStageWidth] = useState(800);

  const stageRef = useRef<HTMLDivElement | null>(null);

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

          {onOpenFullscreen && (
            <button
              type="button"
              onClick={onOpenFullscreen}
              title="Abrir simulador em tela cheia"
              className="inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/25 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tela Cheia</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulator Viewport Stage */}
      <div
        ref={stageRef}
        className="relative flex-1 overflow-auto bg-[#07090F] p-3 sm:p-6 flex flex-col items-center"
      >
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
          <LinkStackTemplateView
            project={project}
            frameWidth={frameWidth}
            frameHeight={frameHeight}
            denseContent={denseContent}
            forceReducedMotion={forceReducedMotion}
            replaySeed={replaySeed}
            className="rounded-2xl border border-slate-700/80 shadow-2xl"
            style={{
              width: `${frameWidth}px`,
              height: `${frameHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </div>

        <p className="mt-3 max-w-xl text-center text-[11px] text-slate-500">
          Simulação isolada no navegador reproduzindo a estrutura DOM e seletores CSS reais do LinkStack. Diretivas Laravel Blade/PHP são simuladas sem alterar o servidor principal.
        </p>
      </div>
    </div>
  );
}

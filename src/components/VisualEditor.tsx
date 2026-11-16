import { useState } from 'react';
import { Redo2, RotateCcw, Save, Undo2 } from 'lucide-react';
import { contrastRatio, getContrastRating, hexToRgbaString, normalizeToHex } from '../core/contrast';
import { applyPaletteToConfig, FUTURISTIC_PALETTES } from '../core/palettes';
import type {
  BackgroundEffectType,
  ButtonSurfaceStyle,
  ContinuousAnimationType,
  EntranceAnimationType,
  GeometricLayerType,
  MicroInteractionType,
  ThemeConfig,
  ThemeFontFamily,
  ThemeProject,
} from '../core/types';

type EditorSection =
  | 'palette'
  | 'background'
  | 'buttons'
  | 'geometry'
  | 'typography'
  | 'animations'
  | 'metadata';

interface VisualEditorProps {
  project: ThemeProject;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  saving: boolean;
  onUpdateProject: (updater: (prev: ThemeProject) => ThemeProject) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSave: () => void;
}

function ColorControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const hexValue = normalizeToHex(value, '#000000');
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <label htmlFor={id} className="text-xs text-slate-300 truncate">
        {label}
      </label>
      <div className="flex items-center gap-2 shrink-0">
        <input
          id={`${id}-picker`}
          type="color"
          aria-label={`Seletor visual para ${label}`}
          value={hexValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border border-slate-700 bg-transparent p-0"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-md border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-200 focus:border-cyan-500/60 focus:outline-none"
        />
      </div>
    </div>
  );
}

function SliderControl({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-1.5 py-1.5">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={id} className="text-slate-300">
          {label}
        </label>
        <span className="font-mono tabular-nums text-cyan-300">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer"
      />
    </div>
  );
}

export function VisualEditor({
  project,
  canUndo,
  canRedo,
  isDirty,
  saving,
  onUpdateProject,
  onUndo,
  onRedo,
  onReset,
  onSave,
}: VisualEditorProps) {
  const [section, setSection] = useState<EditorSection>('palette');
  const cfg = project.config;

  const updateConfig = (patch: (c: ThemeConfig) => ThemeConfig) => {
    onUpdateProject((prev) => ({
      ...prev,
      editCount: prev.editCount + 1,
      config: patch(prev.config),
    }));
  };

  const titleContrast = contrastRatio(cfg.colors.titleColor, cfg.colors.backgroundPrimary);
  const buttonContrast = contrastRatio(
    cfg.colors.buttonText,
    cfg.colors.buttonBg,
    cfg.colors.backgroundPrimary,
  );

  const tabs: { id: EditorSection; label: string }[] = [
    { id: 'palette', label: 'Paletas' },
    { id: 'background', label: 'Fundo' },
    { id: 'buttons', label: 'Botões' },
    { id: 'geometry', label: 'Geometria' },
    { id: 'typography', label: 'Texto' },
    { id: 'animations', label: 'Animações' },
    { id: 'metadata', label: 'Config PHP' },
  ];

  return (
    <aside
      aria-label="Editor visual de propriedades do tema"
      className="flex h-full flex-col border-l border-slate-800/80 bg-[#0F131D]"
    >
      {/* Top Action Bar (Undo / Redo / Reset / Save) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">{project.name}</p>
          <p className="text-[11px] font-mono tabular-nums text-slate-400 truncate">
            {project.slug}/ · v{project.version} · {isDirty ? 'Alterações pendentes' : 'Salvo'}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Desfazer"
            aria-label="Desfazer última alteração"
            className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Refazer"
            aria-label="Refazer alteração"
            className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onReset}
            title="Restaurar padrões"
            aria-label="Restaurar parâmetros padrão"
            className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{saving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-800/80 px-3 py-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSection(t.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              section === t.id
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 studio-scroll">
        {section === 'palette' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Paletas Futurísticas
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {FUTURISTIC_PALETTES.map((pal) => {
                  const active = cfg.paletteId === pal.id;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => updateConfig((c) => applyPaletteToConfig(c, pal.id))}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-cyan-500/60 bg-cyan-500/10'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-slate-100">{pal.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{pal.description}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
                        <span className="h-4 w-4 rounded-full border border-white/15" style={{ backgroundColor: pal.backgroundPrimary }} />
                        <span className="h-4 w-4 rounded-full border border-white/15" style={{ backgroundColor: pal.accentPrimary }} />
                        <span className="h-4 w-4 rounded-full border border-white/15" style={{ backgroundColor: pal.accentSecondary }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Personalização Manual (HEX / RGBA)
              </h3>
              <ColorControl
                id="color-bg-1"
                label="Fundo Primário"
                value={cfg.colors.backgroundPrimary}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, backgroundPrimary: v } }))
                }
              />
              <ColorControl
                id="color-bg-2"
                label="Fundo Secundário"
                value={cfg.colors.backgroundSecondary}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, backgroundSecondary: v } }))
                }
              />
              <ColorControl
                id="color-acc-1"
                label="Destaque Principal"
                value={cfg.colors.accentPrimary}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, accentPrimary: v } }))
                }
              />
              <ColorControl
                id="color-acc-2"
                label="Destaque Secundário"
                value={cfg.colors.accentSecondary}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, accentSecondary: v } }))
                }
              />
              <ColorControl
                id="color-title"
                label="Cor do Título"
                value={cfg.colors.titleColor}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, titleColor: v } }))
                }
              />
              <ColorControl
                id="color-desc"
                label="Cor da Descrição"
                value={cfg.colors.descriptionColor}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, descriptionColor: v } }))
                }
              />
              <ColorControl
                id="color-btn-bg"
                label="Fundo do Botão"
                value={cfg.colors.buttonBg}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, buttonBg: v } }))
                }
              />
              <ColorControl
                id="color-btn-text"
                label="Texto do Botão"
                value={cfg.colors.buttonText}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, buttonText: v } }))
                }
              />
              <ColorControl
                id="color-btn-border"
                label="Borda do Botão"
                value={cfg.colors.buttonBorder}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, paletteId: 'custom', colors: { ...c.colors, buttonBorder: v } }))
                }
              />
              <SliderControl
                id="btn-opacity"
                label="Opacidade do Botão"
                value={cfg.colors.buttonBgOpacity}
                min={0.15}
                max={1}
                step={0.05}
                onChange={(v) =>
                  updateConfig((c) => ({ ...c, colors: { ...c.colors, buttonBgOpacity: v } }))
                }
              />
              <p className="text-[11px] font-mono text-slate-500">
                RGBA aplicado: {hexToRgbaString(cfg.colors.buttonBg, cfg.colors.buttonBgOpacity)}
              </p>
            </div>

            {/* WCAG Contrast Readout */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Contraste Título / Fundo</span>
                <span className="font-mono tabular-nums text-slate-100">
                  {titleContrast}:1 ({getContrastRating(titleContrast)})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Contraste Texto / Botão</span>
                <span className="font-mono tabular-nums text-slate-100">
                  {buttonContrast}:1 ({getContrastRating(buttonContrast)})
                </span>
              </div>
            </div>
          </div>
        )}

        {section === 'background' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="bg-effect" className="block text-xs font-medium text-slate-300 mb-1.5">
                Modo de Plano de Fundo
              </label>
              <select
                id="bg-effect"
                value={cfg.background.effect}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    background: { ...c.background, effect: e.target.value as BackgroundEffectType },
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="particles-network">Rede de Partículas Digitais</option>
                <option value="animated-gradient">Gradiente Animado</option>
                <option value="aurora">Aurora Orbital</option>
                <option value="digital-grid">Grade Digital</option>
                <option value="futuristic-lines">Linhas Futurísticas</option>
                <option value="geometric-waves">Ondas Geométricas</option>
                <option value="tech-pattern">Padrão Tecnológico</option>
                <option value="depth-glow">Brilho e Profundidade</option>
                <option value="glassmorphism">Glassmorphism Atmosférico</option>
                <option value="image-backdrop">Fundo com Imagem Gerada</option>
              </select>
            </div>

            <div>
              <label htmlFor="bg-image-preset" className="block text-xs font-medium text-slate-300 mb-1.5">
                Imagem de Fundo (Opcional)
              </label>
              <select
                id="bg-image-preset"
                value={cfg.background.imagePreset}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    background: {
                      ...c.background,
                      imagePreset: e.target.value as 'none' | 'obsidian' | 'aurora',
                    },
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="none">Sem imagem (somente vetorial/canvas)</option>
                <option value="obsidian">Arquitetura Obsidian &amp; Titânio</option>
                <option value="aurora">Nebulosa Aurora Esmeralda</option>
              </select>
            </div>

            <SliderControl
              id="bg-intensity"
              label="Intensidade do Efeito"
              value={cfg.background.intensity}
              min={10}
              max={100}
              unit="%"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, background: { ...c.background, intensity: v } }))
              }
            />
            <SliderControl
              id="bg-speed"
              label="Velocidade"
              value={cfg.background.speed}
              min={0.2}
              max={3.0}
              step={0.1}
              unit="x"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, background: { ...c.background, speed: v } }))
              }
            />
            <SliderControl
              id="bg-opacity"
              label="Opacidade da Camada"
              value={cfg.background.opacity}
              min={0.1}
              max={1.0}
              step={0.05}
              onChange={(v) =>
                updateConfig((c) => ({ ...c, background: { ...c.background, opacity: v } }))
              }
            />
          </div>
        )}

        {section === 'buttons' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="btn-style" className="block text-xs font-medium text-slate-300 mb-1.5">
                Superfície do Botão
              </label>
              <select
                id="btn-style"
                value={cfg.buttons.style}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    buttons: { ...c.buttons, style: e.target.value as ButtonSurfaceStyle },
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="glassmorphism">Glassmorphism</option>
                <option value="neon-border">Borda Neon Luminosa</option>
                <option value="gradient-fill">Preenchimento Gradiente</option>
                <option value="cyber-bevel">Chanfro Cyber (Bevel)</option>
                <option value="holographic-rim">Borda Holográfica</option>
                <option value="solid-minimal">Sólido Minimalista</option>
              </select>
            </div>

            <SliderControl
              id="btn-radius"
              label="Arredondamento"
              value={cfg.buttons.borderRadiusPx}
              min={0}
              max={32}
              unit="px"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, buttons: { ...c.buttons, borderRadiusPx: v } }))
              }
            />
            <SliderControl
              id="btn-border-w"
              label="Espessura da Borda"
              value={cfg.buttons.borderWidthPx}
              min={0}
              max={4}
              unit="px"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, buttons: { ...c.buttons, borderWidthPx: v } }))
              }
            />
            <SliderControl
              id="btn-height"
              label="Altura Mínima (Toque Mobile)"
              value={cfg.buttons.minHeightPx}
              min={44}
              max={84}
              unit="px"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, buttons: { ...c.buttons, minHeightPx: v } }))
              }
            />
            <SliderControl
              id="btn-blur"
              label="Desfoque Glassmorphism"
              value={cfg.buttons.glassBlurPx}
              min={0}
              max={24}
              unit="px"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, buttons: { ...c.buttons, glassBlurPx: v } }))
              }
            />
            <SliderControl
              id="btn-glow"
              label="Brilho / Glow Neon"
              value={cfg.buttons.glowSpreadPx}
              min={0}
              max={32}
              unit="px"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, buttons: { ...c.buttons, glowSpreadPx: v } }))
              }
            />
            <SliderControl
              id="btn-shadow"
              label="Intensidade da Sombra"
              value={cfg.buttons.shadowIntensity}
              min={0}
              max={100}
              unit="%"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, buttons: { ...c.buttons, shadowIntensity: v } }))
              }
            />
          </div>
        )}

        {section === 'geometry' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="geo-layer" className="block text-xs font-medium text-slate-300 mb-1.5">
                Elemento Geométrico
              </label>
              <select
                id="geo-layer"
                value={cfg.geometry.layer}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    geometry: { ...c.geometry, layer: e.target.value as GeometricLayerType },
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="none">Nenhum</option>
                <option value="tech-frames">Molduras Tecnológicas</option>
                <option value="hexagons">Malha de Hexágonos</option>
                <option value="luminous-circles">Círculos Luminosos</option>
                <option value="diagonal-lines">Linhas Diagonais</option>
                <option value="dynamic-borders">Bordas Dinâmicas</option>
                <option value="holographic-shards">Fragmentos Holográficos</option>
                <option value="depth-layers">Camadas com Profundidade</option>
                <option value="abstract-waves">Formas Abstratas</option>
              </select>
            </div>

            <SliderControl
              id="geo-opacity"
              label="Opacidade Geométrica"
              value={cfg.geometry.opacity}
              min={0.05}
              max={0.85}
              step={0.05}
              onChange={(v) =>
                updateConfig((c) => ({ ...c, geometry: { ...c.geometry, opacity: v } }))
              }
            />
            <SliderControl
              id="geo-scale"
              label="Escala da Camada"
              value={cfg.geometry.scale}
              min={0.6}
              max={1.6}
              step={0.05}
              unit="x"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, geometry: { ...c.geometry, scale: v } }))
              }
            />
            <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-xs text-slate-200 cursor-pointer">
              <span>Animar geometria suavemente</span>
              <input
                type="checkbox"
                checked={cfg.geometry.animated}
                onChange={(e) =>
                  updateConfig((c) => ({ ...c, geometry: { ...c.geometry, animated: e.target.checked } }))
                }
                className="accent-cyan-400"
              />
            </label>
          </div>
        )}

        {section === 'typography' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="font-family" className="block text-xs font-medium text-slate-300 mb-1.5">
                Família Tipográfica
              </label>
              <select
                id="font-family"
                value={cfg.typography.fontFamily}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    typography: { ...c.typography, fontFamily: e.target.value as ThemeFontFamily },
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="Outfit">Outfit (Geométrica Moderna)</option>
                <option value="Syne">Syne (Display Futurista)</option>
                <option value="Orbitron">Orbitron (Sci-Fi Técnico)</option>
                <option value="Rajdhani">Rajdhani (Modular Condensada)</option>
                <option value="Chakra Petch">Chakra Petch (Cyber Industrial)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Karla">Karla (Padrão Galaxy)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {(['center', 'left'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() =>
                    updateConfig((c) => ({ ...c, typography: { ...c.typography, alignment: align } }))
                  }
                  className={`flex-1 rounded-md border py-1.5 text-xs font-medium cursor-pointer ${
                    cfg.typography.alignment === align
                      ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  {align === 'center' ? 'Centralizado' : 'Alinhado à Esquerda'}
                </button>
              ))}
            </div>

            <SliderControl
              id="title-size"
              label="Tamanho do Título"
              value={cfg.typography.titleSizeRem}
              min={1.4}
              max={3.6}
              step={0.05}
              unit="rem"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, typography: { ...c.typography, titleSizeRem: v } }))
              }
            />
            <SliderControl
              id="container-w"
              label="Largura Máxima do Container"
              value={cfg.layout.containerMaxWidthPx}
              min={420}
              max={760}
              step={10}
              unit="px"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, layout: { ...c.layout, containerMaxWidthPx: v } }))
              }
            />
            <SliderControl
              id="btn-gap"
              label="Espaçamento entre Botões"
              value={cfg.layout.buttonGapPx}
              min={6}
              max={28}
              unit="px"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, layout: { ...c.layout, buttonGapPx: v } }))
              }
            />
            <SliderControl
              id="avatar-size"
              label="Tamanho do Avatar"
              value={cfg.layout.avatarSizePx}
              min={72}
              max={168}
              unit="px"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, layout: { ...c.layout, avatarSizePx: v } }))
              }
            />
            <SliderControl
              id="avatar-radius"
              label="Arredondamento do Avatar"
              value={cfg.layout.avatarRadiusPercent}
              min={8}
              max={50}
              unit="%"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, layout: { ...c.layout, avatarRadiusPercent: v } }))
              }
            />
          </div>
        )}

        {section === 'animations' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="anim-entrance" className="block text-xs font-medium text-slate-300 mb-1.5">
                Animação de Entrada
              </label>
              <select
                id="anim-entrance"
                value={cfg.animations.entrance}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    animations: { ...c.animations, entrance: e.target.value as EntranceAnimationType },
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="staggered">Entrada Escalonada (Staggered)</option>
                <option value="fade-in">Fade-in Suave</option>
                <option value="slide-up">Slide-up</option>
                <option value="slide-down">Slide-down</option>
                <option value="zoom-in">Zoom-in</option>
                <option value="reveal">Reveal</option>
                <option value="blur-to-focus">Blur-to-Focus</option>
                <option value="none">Desativada</option>
              </select>
            </div>

            <SliderControl
              id="anim-dur"
              label="Duração da Entrada"
              value={cfg.animations.entranceDurationMs}
              min={150}
              max={1500}
              step={50}
              unit="ms"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, animations: { ...c.animations, entranceDurationMs: v } }))
              }
            />
            <SliderControl
              id="anim-delay"
              label="Atraso Inicial"
              value={cfg.animations.entranceDelayMs}
              min={0}
              max={800}
              step={20}
              unit="ms"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, animations: { ...c.animations, entranceDelayMs: v } }))
              }
            />

            <div>
              <label htmlFor="anim-continuous" className="block text-xs font-medium text-slate-300 mb-1.5">
                Animação Contínua
              </label>
              <select
                id="anim-continuous"
                value={cfg.animations.continuous}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    animations: { ...c.animations, continuous: e.target.value as ContinuousAnimationType },
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="moving-border-light">Luz em Movimento nas Bordas</option>
                <option value="pulse-glow">Pulsação Luminosa</option>
                <option value="ambient-glow">Brilho Ambiente</option>
                <option value="holographic-shift">Transição Holográfica</option>
                <option value="particles">Partículas</option>
                <option value="ripples">Ondulações</option>
                <option value="none">Nenhuma</option>
              </select>
            </div>

            <div>
              <label htmlFor="anim-micro" className="block text-xs font-medium text-slate-300 mb-1.5">
                Microinteração (Hover / Toque)
              </label>
              <select
                id="anim-micro"
                value={cfg.animations.microInteraction}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    animations: { ...c.animations, microInteraction: e.target.value as MicroInteractionType },
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="neon-flare">Neon Flare + Elevação</option>
                <option value="lift">Elevação Sutil</option>
                <option value="magnetic-press">Pressão Magnética</option>
                <option value="scale-pop">Scale Pop</option>
                <option value="border-trace">Traço de Borda</option>
                <option value="holographic-sweep">Varredura Holográfica</option>
              </select>
            </div>

            <SliderControl
              id="anim-cont-speed"
              label="Ciclo Contínuo"
              value={cfg.animations.continuousSpeedSec}
              min={2}
              max={14}
              step={1}
              unit="s"
              onChange={(v) =>
                updateConfig((c) => ({ ...c, animations: { ...c.animations, continuousSpeedSec: v } }))
              }
            />

            <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-xs text-slate-200 cursor-pointer">
              <span>Respeitar prefers-reduced-motion</span>
              <input
                type="checkbox"
                checked={cfg.animations.respectReducedMotion}
                onChange={(e) =>
                  updateConfig((c) => ({
                    ...c,
                    animations: { ...c.animations, respectReducedMotion: e.target.checked },
                  }))
                }
                className="accent-cyan-400"
              />
            </label>
          </div>
        )}

        {section === 'metadata' && (
          <div className="space-y-3.5">
            <div>
              <label htmlFor="meta-name" className="block text-xs text-slate-300 mb-1">
                Nome do Tema
              </label>
              <input
                id="meta-name"
                type="text"
                value={project.name}
                onChange={(e) =>
                  onUpdateProject((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="meta-slug" className="block text-xs text-slate-300 mb-1">
                  Diretório (Slug)
                </label>
                <input
                  id="meta-slug"
                  type="text"
                  value={project.slug}
                  onChange={(e) =>
                    onUpdateProject((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="meta-version" className="block text-xs text-slate-300 mb-1">
                  Versão
                </label>
                <input
                  id="meta-version"
                  type="text"
                  value={project.version}
                  onChange={(e) =>
                    onUpdateProject((prev) => ({ ...prev, version: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="meta-author" className="block text-xs text-slate-300 mb-1">
                Autor (Preservação de Crédito)
              </label>
              <input
                id="meta-author"
                type="text"
                value={project.author}
                onChange={(e) =>
                  onUpdateProject((prev) => ({ ...prev, author: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="meta-license" className="block text-xs text-slate-300 mb-1">
                Licença (readme.md)
              </label>
              <select
                id="meta-license"
                value={project.license}
                onChange={(e) =>
                  onUpdateProject((prev) => ({
                    ...prev,
                    license: e.target.value as ThemeProject['license'],
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="MIT">MIT</option>
                <option value="GPLv3">GPLv3</option>
                <option value="Apache-2.0">Apache-2.0</option>
              </select>
            </div>

            <div className="border-t border-slate-800/80 pt-3 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Flags do config.php
              </h4>
              {(
                [
                  { key: 'allow_custom_buttons', label: 'allow_custom_buttons' },
                  { key: 'open_links_in_same_tab', label: 'open_links_in_same_tab' },
                  { key: 'enable_custom_code', label: 'enable_custom_code' },
                  { key: 'enable_custom_head', label: 'enable_custom_head' },
                  { key: 'enable_custom_body', label: 'enable_custom_body' },
                  { key: 'enable_custom_body_end', label: 'enable_custom_body_end' },
                  { key: 'use_custom_icons', label: 'use_custom_icons' },
                ] as const
              ).map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-mono text-slate-300 cursor-pointer"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(cfg.phpConfig[key])}
                    onChange={(e) =>
                      updateConfig((c) => ({
                        ...c,
                        phpConfig: { ...c.phpConfig, [key]: e.target.checked },
                      }))
                    }
                    className="accent-cyan-400"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

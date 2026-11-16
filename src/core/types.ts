export type PaletteId =
  | 'cyberpunk'
  | 'golden-tech'
  | 'emerald-future'
  | 'electric-blue'
  | 'crimson-matrix'
  | 'aurora-neon'
  | 'holographic'
  | 'custom';

export type BackgroundEffectType =
  | 'animated-gradient'
  | 'particles-network'
  | 'digital-grid'
  | 'futuristic-lines'
  | 'geometric-waves'
  | 'aurora'
  | 'glassmorphism'
  | 'tech-pattern'
  | 'image-backdrop'
  | 'depth-glow';

export type ButtonSurfaceStyle =
  | 'neon-border'
  | 'glassmorphism'
  | 'gradient-fill'
  | 'cyber-bevel'
  | 'solid-minimal'
  | 'holographic-rim';

export type GeometricLayerType =
  | 'none'
  | 'hexagons'
  | 'luminous-circles'
  | 'tech-frames'
  | 'diagonal-lines'
  | 'dynamic-borders'
  | 'holographic-shards'
  | 'depth-layers'
  | 'abstract-waves';

export type EntranceAnimationType =
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in'
  | 'reveal'
  | 'blur-to-focus'
  | 'staggered';

export type ContinuousAnimationType =
  | 'none'
  | 'pulse-glow'
  | 'ambient-glow'
  | 'animated-gradient'
  | 'particles'
  | 'ripples'
  | 'moving-border-light'
  | 'holographic-shift';

export type MicroInteractionType =
  | 'lift'
  | 'neon-flare'
  | 'magnetic-press'
  | 'border-trace'
  | 'holographic-sweep'
  | 'scale-pop';

export type ThemeFontFamily =
  | 'Outfit'
  | 'Syne'
  | 'Orbitron'
  | 'Rajdhani'
  | 'Chakra Petch'
  | 'Plus Jakarta Sans'
  | 'DM Sans'
  | 'Karla';

export interface ThemePalette {
  id: PaletteId;
  name: string;
  description: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  accentPrimary: string;
  accentSecondary: string;
  titleColor: string;
  descriptionColor: string;
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
  buttonHoverText: string;
  buttonBorder: string;
  socialIconColor: string;
  footerBg: string;
  footerText: string;
}

export interface LinkStackPhpConfig {
  allow_custom_buttons: boolean;
  open_links_in_same_tab: boolean;
  enable_custom_code: boolean;
  enable_custom_head: boolean;
  enable_custom_body: boolean;
  enable_custom_body_end: boolean;
  use_custom_icons: boolean;
  custom_icon_extension: string;
}

export interface ThemeConfig {
  paletteId: PaletteId;
  colors: {
    backgroundPrimary: string;
    backgroundSecondary: string;
    backgroundOpacity: number;
    accentPrimary: string;
    accentSecondary: string;
    titleColor: string;
    descriptionColor: string;
    buttonBg: string;
    buttonBgOpacity: number;
    buttonText: string;
    buttonHoverBg: string;
    buttonHoverText: string;
    buttonBorder: string;
    socialIconColor: string;
    footerBg: string;
    footerText: string;
  };
  typography: {
    fontFamily: ThemeFontFamily;
    baseFontSizePx: number;
    titleSizeRem: number;
    titleLetterSpacingRem: number;
    titleWeight: 600 | 700 | 800;
    titleUppercase: boolean;
    descriptionSizeRem: number;
    descriptionLineHeight: number;
    alignment: 'center' | 'left';
  };
  layout: {
    containerMaxWidthPx: number;
    verticalPaddingPx: number;
    buttonGapPx: number;
    avatarSizePx: number;
    avatarRadiusPercent: number;
    avatarBorderPx: number;
    avatarGlow: boolean;
  };
  background: {
    effect: BackgroundEffectType;
    intensity: number; // 0 - 100
    speed: number; // 0.2 - 3.0
    opacity: number; // 0.1 - 1.0
    imagePreset: 'none' | 'obsidian' | 'aurora';
  };
  buttons: {
    style: ButtonSurfaceStyle;
    borderRadiusPx: number;
    borderWidthPx: number;
    minHeightPx: number;
    shadowIntensity: number; // 0 - 100
    glassBlurPx: number; // 0 - 24
    glowSpreadPx: number; // 0 - 32
    letterSpacingEm: number;
    animatedShine: boolean;
    pressDepthPx: number;
  };
  geometry: {
    layer: GeometricLayerType;
    opacity: number; // 0.05 - 0.85
    scale: number; // 0.5 - 2.0
    animated: boolean;
    frameCornerSizePx: number;
  };
  animations: {
    entrance: EntranceAnimationType;
    entranceDurationMs: number;
    entranceDelayMs: number;
    staggerStepMs: number;
    continuous: ContinuousAnimationType;
    continuousSpeedSec: number;
    continuousIntensity: number; // 0 - 100
    iterationCount: 'infinite' | '1' | '3';
    microInteraction: MicroInteractionType;
    respectReducedMotion: boolean;
  };
  phpConfig: LinkStackPhpConfig;
}

export interface ThemeProject {
  id: string;
  slug: string;
  name: string;
  version: string;
  date: string;
  author: string;
  authorUri: string;
  license: 'MIT' | 'GPLv3' | 'Apache-2.0';
  sourceType: 'base' | 'preset' | 'imported' | 'custom';
  baseThemeSlug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  editCount: number;
  config: ThemeConfig;
  preservedAssets: string[];
  importWarnings: string[];
}

export interface GeneratedThemeFile {
  path: string;
  content: string;
  kind: 'php' | 'css' | 'markdown' | 'blade' | 'html' | 'binary-preview';
  sizeBytes: number;
}

export interface ValidationCheckItem {
  id: string;
  category: 'structure' | 'syntax' | 'assets' | 'security' | 'contrast' | 'responsive' | 'performance';
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

export interface ValidationReport {
  overallStatus: 'compatible' | 'warnings' | 'incompatible';
  checks: ValidationCheckItem[];
  contrastTitle: number;
  contrastButton: number;
  estimatedZipKb: number;
  simulationNotice: string;
}

export interface ZipEntryInfo {
  path: string;
  sizeBytes: number;
  compressedBytes: number;
  isDir: boolean;
  safe: boolean;
  reason?: string;
}

export interface ZipInspectionResult {
  valid: boolean;
  themeRootFolder: string;
  detectedName: string;
  detectedVersion: string;
  detectedAuthor: string;
  detectedLicense: string;
  parsedPhpConfig: Partial<LinkStackPhpConfig>;
  detectedCssVars: Record<string, string>;
  files: ZipEntryInfo[];
  assets: string[];
  bladeFiles: string[];
  securityErrors: string[];
  compatibilityWarnings: string[];
  missingRequiredFiles: string[];
}

export interface BaseThemeSummary {
  slug: string;
  name: string;
  version: string;
  author: string;
  license: 'MIT' | 'GPLv3';
  description: string;
  filesCount: number;
  assetsCount: number;
  phpConfig: LinkStackPhpConfig;
  cssVariables: Record<string, string>;
}

import type { PaletteId, ThemeConfig, ThemePalette, ThemeProject } from './types';

export const FUTURISTIC_PALETTES: ThemePalette[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Preto profundo, magenta neon e roxo elétrico de alto contraste.',
    backgroundPrimary: '#08070f',
    backgroundSecondary: '#1a0b2e',
    accentPrimary: '#ff007f',
    accentSecondary: '#8b5cf6',
    titleColor: '#f8fafc',
    descriptionColor: '#cbd5e1',
    buttonBg: '#160d29',
    buttonText: '#f8fafc',
    buttonHoverBg: '#ff007f',
    buttonHoverText: '#ffffff',
    buttonBorder: '#ff007f',
    socialIconColor: '#f472b6',
    footerBg: '#0c0917',
    footerText: '#94a3b8',
  },
  {
    id: 'golden-tech',
    name: 'Golden Tech',
    description: 'Preto carbono, dourado metálico e reflexos âmbar arquitetônicos.',
    backgroundPrimary: '#09090b',
    backgroundSecondary: '#1c1608',
    accentPrimary: '#f59e0b',
    accentSecondary: '#fde047',
    titleColor: '#fefce8',
    descriptionColor: '#d6d3d1',
    buttonBg: '#18140c',
    buttonText: '#fef3c7',
    buttonHoverBg: '#d97706',
    buttonHoverText: '#09090b',
    buttonBorder: '#f59e0b',
    socialIconColor: '#fbbf24',
    footerBg: '#0d0c09',
    footerText: '#a8a29e',
  },
  {
    id: 'emerald-future',
    name: 'Emerald Future',
    description: 'Grafite escuro, verde esmeralda luminoso e matriz ciano.',
    backgroundPrimary: '#050c0a',
    backgroundSecondary: '#072219',
    accentPrimary: '#10b981',
    accentSecondary: '#34d399',
    titleColor: '#ecfdf5',
    descriptionColor: '#a7f3d0',
    buttonBg: '#091f17',
    buttonText: '#ecfdf5',
    buttonHoverBg: '#10b981',
    buttonHoverText: '#03120d',
    buttonBorder: '#34d399',
    socialIconColor: '#34d399',
    footerBg: '#06130f',
    footerText: '#6ee7b7',
  },
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    description: 'Grafite técnico, azul elétrico e telemetria ciano.',
    backgroundPrimary: '#070b14',
    backgroundSecondary: '#0d1b36',
    accentPrimary: '#06b6d4',
    accentSecondary: '#3b82f6',
    titleColor: '#f0f9ff',
    descriptionColor: '#bae6fd',
    buttonBg: '#0e172a',
    buttonText: '#f0f9ff',
    buttonHoverBg: '#0284c7',
    buttonHoverText: '#ffffff',
    buttonBorder: '#22d3ee',
    socialIconColor: '#38bdf8',
    footerBg: '#090f1d',
    footerText: '#7dd3fc',
  },
  {
    id: 'crimson-matrix',
    name: 'Crimson Matrix',
    description: 'Preto absoluto, carmesim digital e linhas de varredura precisas.',
    backgroundPrimary: '#0a0507',
    backgroundSecondary: '#240810',
    accentPrimary: '#f43f5e',
    accentSecondary: '#fb7185',
    titleColor: '#fff1f2',
    descriptionColor: '#fecdd3',
    buttonBg: '#1c090e',
    buttonText: '#fff1f2',
    buttonHoverBg: '#e11d48',
    buttonHoverText: '#ffffff',
    buttonBorder: '#f43f5e',
    socialIconColor: '#fb7185',
    footerBg: '#110609',
    footerText: '#fda4af',
  },
  {
    id: 'aurora-neon',
    name: 'Aurora Neon',
    description: 'Gradientes atmosféricos de roxo orbital, azul e esmeralda.',
    backgroundPrimary: '#060913',
    backgroundSecondary: '#111936',
    accentPrimary: '#2dd4bf',
    accentSecondary: '#818cf8',
    titleColor: '#f8fafc',
    descriptionColor: '#cbd5e1',
    buttonBg: '#11182c',
    buttonText: '#f1f5f9',
    buttonHoverBg: '#2dd4bf',
    buttonHoverText: '#041214',
    buttonBorder: '#5eead4',
    socialIconColor: '#5eead4',
    footerBg: '#090d1b',
    footerText: '#94a3b8',
  },
  {
    id: 'holographic',
    name: 'Holographic',
    description: 'Iridescência prismática multicolorida sobre superfície obsidian.',
    backgroundPrimary: '#080910',
    backgroundSecondary: '#151828',
    accentPrimary: '#38bdf8',
    accentSecondary: '#e879f9',
    titleColor: '#ffffff',
    descriptionColor: '#e2e8f0',
    buttonBg: '#131626',
    buttonText: '#ffffff',
    buttonHoverBg: '#38bdf8',
    buttonHoverText: '#070910',
    buttonBorder: '#c084fc',
    socialIconColor: '#a5f3fc',
    footerBg: '#0c0e18',
    footerText: '#cbd5e1',
  },
];

export function applyPaletteToConfig(config: ThemeConfig, paletteId: PaletteId): ThemeConfig {
  const palette = FUTURISTIC_PALETTES.find((p) => p.id === paletteId);
  if (!palette) {
    return { ...config, paletteId: 'custom' };
  }
  return {
    ...config,
    paletteId: palette.id,
    colors: {
      ...config.colors,
      backgroundPrimary: palette.backgroundPrimary,
      backgroundSecondary: palette.backgroundSecondary,
      accentPrimary: palette.accentPrimary,
      accentSecondary: palette.accentSecondary,
      titleColor: palette.titleColor,
      descriptionColor: palette.descriptionColor,
      buttonBg: palette.buttonBg,
      buttonText: palette.buttonText,
      buttonHoverBg: palette.buttonHoverBg,
      buttonHoverText: palette.buttonHoverText,
      buttonBorder: palette.buttonBorder,
      socialIconColor: palette.socialIconColor,
      footerBg: palette.footerBg,
      footerText: palette.footerText,
    },
  };
}

export function createDefaultThemeConfig(paletteId: PaletteId = 'electric-blue'): ThemeConfig {
  const base: ThemeConfig = {
    paletteId,
    colors: {
      backgroundPrimary: '#070b14',
      backgroundSecondary: '#0d1b36',
      backgroundOpacity: 1,
      accentPrimary: '#06b6d4',
      accentSecondary: '#3b82f6',
      titleColor: '#f0f9ff',
      descriptionColor: '#bae6fd',
      buttonBg: '#0e172a',
      buttonBgOpacity: 0.78,
      buttonText: '#f0f9ff',
      buttonHoverBg: '#0284c7',
      buttonHoverText: '#ffffff',
      buttonBorder: '#22d3ee',
      socialIconColor: '#38bdf8',
      footerBg: '#090f1d',
      footerText: '#7dd3fc',
    },
    typography: {
      fontFamily: 'Outfit',
      baseFontSizePx: 16,
      titleSizeRem: 2.35,
      titleLetterSpacingRem: 0.08,
      titleWeight: 700,
      titleUppercase: false,
      descriptionSizeRem: 1.0,
      descriptionLineHeight: 1.6,
      alignment: 'center',
    },
    layout: {
      containerMaxWidthPx: 580,
      verticalPaddingPx: 48,
      buttonGapPx: 14,
      avatarSizePx: 116,
      avatarRadiusPercent: 50,
      avatarBorderPx: 3,
      avatarGlow: true,
    },
    background: {
      effect: 'particles-network',
      intensity: 65,
      speed: 1.0,
      opacity: 0.85,
      imagePreset: 'none',
    },
    buttons: {
      style: 'glassmorphism',
      borderRadiusPx: 14,
      borderWidthPx: 1,
      minHeightPx: 56,
      shadowIntensity: 45,
      glassBlurPx: 12,
      glowSpreadPx: 14,
      letterSpacingEm: 0.04,
      animatedShine: true,
      pressDepthPx: 2,
    },
    geometry: {
      layer: 'tech-frames',
      opacity: 0.32,
      scale: 1.0,
      animated: true,
      frameCornerSizePx: 18,
    },
    animations: {
      entrance: 'staggered',
      entranceDurationMs: 550,
      entranceDelayMs: 80,
      staggerStepMs: 70,
      continuous: 'moving-border-light',
      continuousSpeedSec: 5,
      continuousIntensity: 55,
      iterationCount: 'infinite',
      microInteraction: 'neon-flare',
      respectReducedMotion: true,
    },
    phpConfig: {
      allow_custom_buttons: false,
      open_links_in_same_tab: false,
      enable_custom_code: true,
      enable_custom_head: true,
      enable_custom_body: true,
      enable_custom_body_end: true,
      use_custom_icons: false,
      custom_icon_extension: '.svg',
    },
  };
  return applyPaletteToConfig(base, paletteId);
}

export function createStarterPresets(): ThemeProject[] {
  const now = new Date().toISOString().slice(0, 10);

  const polySleekFuture = createDefaultThemeConfig('electric-blue');
  polySleekFuture.colors = {
    ...polySleekFuture.colors,
    backgroundPrimary: '#1e1f26',
    backgroundSecondary: '#141724',
    accentPrimary: '#03dac6',
    accentSecondary: '#ff0266',
    titleColor: '#ffffff',
    descriptionColor: '#cbd5e1',
    buttonBg: '#222840',
    buttonBgOpacity: 0.86,
    buttonText: '#ffffff',
    buttonHoverBg: '#222840',
    buttonHoverText: '#03dac6',
    buttonBorder: '#03dac6',
    socialIconColor: '#ffffff',
    footerBg: '#1f232e',
    footerText: '#ffffff',
  };
  polySleekFuture.background = {
    effect: 'particles-network',
    intensity: 70,
    speed: 1.0,
    opacity: 0.9,
    imagePreset: 'none',
  };
  polySleekFuture.buttons.style = 'neon-border';
  polySleekFuture.geometry.layer = 'diagonal-lines';

  const galaxyFuture = createDefaultThemeConfig('aurora-neon');
  galaxyFuture.colors = {
    ...galaxyFuture.colors,
    backgroundPrimary: '#090a0f',
    backgroundSecondary: '#223344',
    accentPrimary: '#ffffff',
    accentSecondary: '#38bdf8',
    titleColor: '#ffffff',
    descriptionColor: '#dbeafe',
    buttonBg: '#0f172a',
    buttonBgOpacity: 0.45,
    buttonText: '#ffffff',
    buttonHoverBg: '#ffffff',
    buttonHoverText: '#090a0f',
    buttonBorder: '#ffffff',
    socialIconColor: '#ffffff',
    footerBg: '#090a0f',
    footerText: '#cbd5e1',
  };
  galaxyFuture.typography.fontFamily = 'Karla';
  galaxyFuture.background = {
    effect: 'aurora',
    intensity: 75,
    speed: 0.9,
    opacity: 0.9,
    imagePreset: 'none',
  };
  galaxyFuture.buttons.style = 'neon-border';
  galaxyFuture.buttons.borderRadiusPx = 10;
  galaxyFuture.buttons.borderWidthPx = 2;
  galaxyFuture.geometry.layer = 'luminous-circles';

  const cyberGrid = createDefaultThemeConfig('cyberpunk');
  cyberGrid.typography.fontFamily = 'Orbitron';
  cyberGrid.typography.titleUppercase = true;
  cyberGrid.background = {
    effect: 'digital-grid',
    intensity: 75,
    speed: 1.2,
    opacity: 0.85,
    imagePreset: 'none',
  };
  cyberGrid.buttons.style = 'cyber-bevel';
  cyberGrid.buttons.borderRadiusPx = 6;
  cyberGrid.geometry.layer = 'hexagons';
  cyberGrid.animations.entrance = 'blur-to-focus';
  cyberGrid.animations.continuous = 'moving-border-light';

  const obsidianGold = createDefaultThemeConfig('golden-tech');
  obsidianGold.typography.fontFamily = 'Syne';
  obsidianGold.background = {
    effect: 'image-backdrop',
    intensity: 55,
    speed: 0.8,
    opacity: 0.85,
    imagePreset: 'obsidian',
  };
  obsidianGold.buttons.style = 'glassmorphism';
  obsidianGold.buttons.borderRadiusPx = 16;
  obsidianGold.geometry.layer = 'tech-frames';
  obsidianGold.animations.entrance = 'slide-up';
  obsidianGold.animations.continuous = 'ambient-glow';

  const holoMatrix = createDefaultThemeConfig('holographic');
  holoMatrix.typography.fontFamily = 'Chakra Petch';
  holoMatrix.background = {
    effect: 'geometric-waves',
    intensity: 80,
    speed: 1.1,
    opacity: 0.9,
    imagePreset: 'none',
  };
  holoMatrix.buttons.style = 'holographic-rim';
  holoMatrix.buttons.borderRadiusPx = 18;
  holoMatrix.geometry.layer = 'holographic-shards';
  holoMatrix.animations.continuous = 'holographic-shift';

  return [
    {
      id: 'base-polysleek',
      slug: 'PolySleek',
      name: 'PolySleek (Base Auditada)',
      version: '1.2',
      date: '2023-02-23',
      author: 'JulianPrieber & LinkStack Team',
      authorUri: 'https://github.com/JulianPrieber',
      license: 'MIT',
      sourceType: 'base',
      baseThemeSlug: 'PolySleek',
      description: 'Tema-base oficial auditado com Particles.js, paleta escura #1e1f26 e acentos #03dac6.',
      createdAt: '2023-02-23T00:00:00.000Z',
      updatedAt: '2023-02-23T00:00:00.000Z',
      editCount: 0,
      config: polySleekFuture,
      preservedAssets: ['particles.min.js'],
      importWarnings: [],
    },
    {
      id: 'base-galaxy',
      slug: 'galaxy',
      name: 'Galaxy (Base Auditada)',
      version: '2.1',
      date: '2022-06-09',
      author: 'JulianPrieber & LinkStack Team',
      authorUri: 'https://github.com/JulianPrieber',
      license: 'GPLv3',
      sourceType: 'base',
      baseThemeSlug: 'galaxy',
      description: 'Tema-base oficial auditado com gradiente espacial radial, tipografia Karla e bordas nítidas.',
      createdAt: '2022-06-09T00:00:00.000Z',
      updatedAt: '2022-06-09T00:00:00.000Z',
      editCount: 0,
      config: galaxyFuture,
      preservedAssets: [],
      importWarnings: [],
    },
    {
      id: 'preset-cyber-horizon',
      slug: 'CyberHorizon',
      name: 'Cyber Horizon',
      version: '1.0',
      date: now,
      author: 'LinkStack Theme Studio',
      authorUri: 'https://linkstack.org',
      license: 'MIT',
      sourceType: 'preset',
      baseThemeSlug: 'PolySleek',
      description: 'Grade digital perspectiva, chanfros futuristas, hexágonos geométricos e brilho magenta neon.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editCount: 1,
      config: cyberGrid,
      preservedAssets: [],
      importWarnings: [],
    },
    {
      id: 'preset-obsidian-gold',
      slug: 'ObsidianGold',
      name: 'Obsidian Gold',
      version: '1.0',
      date: now,
      author: 'LinkStack Theme Studio',
      authorUri: 'https://linkstack.org',
      license: 'MIT',
      sourceType: 'preset',
      baseThemeSlug: 'PolySleek',
      description: 'Arquitetura obsidian com molduras tecnológicas douradas, glassmorphism e micro-elevação.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editCount: 1,
      config: obsidianGold,
      preservedAssets: [],
      importWarnings: [],
    },
    {
      id: 'preset-holo-prism',
      slug: 'HoloPrism',
      name: 'Holo Prism',
      version: '1.0',
      date: now,
      author: 'LinkStack Theme Studio',
      authorUri: 'https://linkstack.org',
      license: 'MIT',
      sourceType: 'preset',
      baseThemeSlug: 'PolySleek',
      description: 'Ondas geométricas iridescentes, bordas holográficas animadas e entrada escalonada.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editCount: 1,
      config: holoMatrix,
      preservedAssets: [],
      importWarnings: [],
    },
  ];
}

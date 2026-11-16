import type { LinkStackPhpConfig, ZipEntryInfo, ZipInspectionResult } from './types';

export const MAX_ZIP_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_ENTRY_COUNT = 250;

const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.sh',
  '.bash',
  '.bat',
  '.cmd',
  '.ps1',
  '.vbs',
  '.phar',
  '.phtml',
  '.php3',
  '.php4',
  '.php5',
  '.htaccess',
  '.cgi',
  '.pl',
];

const REQUIRED_LINKSTACK_FILES = [
  'config.php',
  'readme.md',
  'skeleton-auto.css',
  'brands.css',
  'animations.css',
  'share.button.css',
];

export function validateZipEntryPath(rawPath: string): { safe: boolean; reason?: string } {
  if (!rawPath || rawPath.includes('\0')) {
    return { safe: false, reason: 'Caminho vazio ou contendo null byte.' };
  }
  const normalized = rawPath.replace(/\\/g, '/');
  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    return { safe: false, reason: `Caminho absoluto proibido: ${rawPath}` };
  }
  const segments = normalized.split('/');
  if (segments.some((seg) => seg === '..')) {
    return { safe: false, reason: `Tentativa de Path Traversal (..) detectada: ${rawPath}` };
  }
  const lower = normalized.toLowerCase();
  if (DANGEROUS_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return { safe: false, reason: `Extensão de arquivo potencialmente perigosa: ${rawPath}` };
  }
  return { safe: true };
}

/**
 * Parses LinkStack config.php strictly via static regex without ever executing PHP.
 */
export function parseConfigPhpStatically(phpSource: string): {
  parsed: Partial<LinkStackPhpConfig>;
  suspiciousCalls: string[];
} {
  const suspiciousCalls: string[] = [];
  const dangerPatterns = [
    /\b(eval|exec|shell_exec|system|passthru|proc_open|popen|curl_exec|file_put_contents|unlink|rmdir)\s*\(/gi,
    /`[^`]+`/g,
  ];
  for (const pat of dangerPatterns) {
    const match = phpSource.match(pat);
    if (match) {
      suspiciousCalls.push(...match.map((m) => m.trim()));
    }
  }

  const readBool = (key: string): boolean | undefined => {
    const re = new RegExp(`['"]${key}['"]\\s*=>\\s*['"]?(true|false)['"]?`, 'i');
    const m = re.exec(phpSource);
    if (!m) return undefined;
    return m[1].toLowerCase() === 'true';
  };

  const readStr = (key: string): string | undefined => {
    const re = new RegExp(`['"]${key}['"]\\s*=>\\s*['"]([^'"]*)['"]`, 'i');
    const m = re.exec(phpSource);
    return m ? m[1] : undefined;
  };

  const parsed: Partial<LinkStackPhpConfig> = {};
  const boolKeys: (keyof Omit<LinkStackPhpConfig, 'custom_icon_extension'>)[] = [
    'allow_custom_buttons',
    'open_links_in_same_tab',
    'enable_custom_code',
    'enable_custom_head',
    'enable_custom_body',
    'enable_custom_body_end',
    'use_custom_icons',
  ];

  for (const k of boolKeys) {
    const v = readBool(k);
    if (v !== undefined) parsed[k] = v;
  }
  const ext = readStr('custom_icon_extension');
  if (ext !== undefined) parsed.custom_icon_extension = ext;

  return { parsed, suspiciousCalls };
}

export function parseReadmeMetadata(readmeSource: string): {
  name: string;
  version: string;
  author: string;
  license: string;
} {
  const extract = (label: string, fallback: string) => {
    const re = new RegExp(`(?:^|\\n)\\s*(?:\\*|-)\\s*${label}\\s*:\\s*(.+)`, 'i');
    const m = re.exec(readmeSource);
    return m ? m[1].trim() : fallback;
  };
  return {
    name: extract('Theme Name', 'ImportedTheme'),
    version: extract('Theme Version', '1.0'),
    author: extract('Theme Author', 'Unknown Author'),
    license: extract('Theme License', 'MIT'),
  };
}

export function parseCssRootVariables(cssSource: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const rootMatch = /:root\s*\{([\s\S]*?)\}/m.exec(cssSource);
  const target = rootMatch ? rootMatch[1] : cssSource;
  const varRe = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = varRe.exec(target)) !== null) {
    vars[m[1].trim()] = m[2].trim();
  }
  return vars;
}

export function inspectThemeArchiveEntries(
  rawEntries: {
    path: string;
    sizeBytes: number;
    compressedBytes: number;
    isDir: boolean;
    unixPermissions?: number | null;
  }[],
  textContents: Record<string, string>,
): ZipInspectionResult {
  const securityErrors: string[] = [];
  const compatibilityWarnings: string[] = [];
  const entries: ZipEntryInfo[] = [];

  if (rawEntries.length === 0) {
    securityErrors.push('O arquivo ZIP está vazio.');
  }
  if (rawEntries.length > MAX_ENTRY_COUNT) {
    securityErrors.push(`O ZIP excede o limite de segurança de ${MAX_ENTRY_COUNT} entradas.`);
  }

  let totalUncompressed = 0;

  for (const raw of rawEntries) {
    totalUncompressed += raw.sizeBytes;
    const pathCheck = validateZipEntryPath(raw.path);

    // Check symlink bit in UNIX external attributes (0120000 octal = 0xA000)
    const isSymlink =
      typeof raw.unixPermissions === 'number' && (raw.unixPermissions & 0o170000) === 0o120000;

    if (isSymlink) {
      securityErrors.push(`Link simbólico proibido detectado no ZIP: ${raw.path}`);
    }

    if (!pathCheck.safe && pathCheck.reason) {
      securityErrors.push(pathCheck.reason);
    }

    entries.push({
      path: raw.path,
      sizeBytes: raw.sizeBytes,
      compressedBytes: raw.compressedBytes,
      isDir: raw.isDir,
      safe: pathCheck.safe && !isSymlink,
      reason: isSymlink ? 'Symlink proibido' : pathCheck.reason,
    });
  }

  if (totalUncompressed > MAX_ZIP_BYTES * 3) {
    securityErrors.push('Tamanho total descomprimido excede o limite seguro (45 MB).');
  }

  // Detect theme root folder: either "<ThemeName>/config.php" or "themes/<ThemeName>/config.php" or root "config.php"
  const filePaths = rawEntries.filter((e) => !e.isDir).map((e) => e.path.replace(/\\/g, '/'));
  let themeRootFolder = '';

  const configMatch = filePaths.find((p) => p.endsWith('/config.php') || p === 'config.php');
  if (configMatch) {
    if (configMatch === 'config.php') {
      themeRootFolder = '';
      compatibilityWarnings.push(
        'O config.php está na raiz do ZIP sem pasta de tema envolvente (o ideal no LinkStack é <NomeDoTema>/config.php).',
      );
    } else {
      themeRootFolder = configMatch.slice(0, configMatch.length - '/config.php'.length);
    }
  } else {
    // Fallback to top-level directory name
    const topDirs = Array.from(
      new Set(filePaths.map((p) => (p.includes('/') ? p.split('/')[0] : '')).filter(Boolean)),
    );
    themeRootFolder = topDirs[0] || '';
  }

  const prefix = themeRootFolder ? `${themeRootFolder}/` : '';
  const relativeFiles = filePaths
    .filter((p) => !prefix || p.startsWith(prefix))
    .map((p) => (prefix ? p.slice(prefix.length) : p));

  const missingRequiredFiles = REQUIRED_LINKSTACK_FILES.filter(
    (req) => !relativeFiles.includes(req),
  );

  if (missingRequiredFiles.length > 0) {
    compatibilityWarnings.push(
      `Arquivos padrão do LinkStack ausentes: ${missingRequiredFiles.join(', ')}.`,
    );
  }

  const getRelText = (relPath: string): string => {
    const full = prefix ? `${prefix}${relPath}` : relPath;
    return textContents[full] ?? '';
  };

  const configPhpText = getRelText('config.php');
  let parsedPhpConfig: Partial<LinkStackPhpConfig> = {};
  if (configPhpText) {
    const { parsed, suspiciousCalls } = parseConfigPhpStatically(configPhpText);
    parsedPhpConfig = parsed;
    if (suspiciousCalls.length > 0) {
      securityErrors.push(
        `Chamadas PHP potencialmente inseguras encontradas em config.php: ${suspiciousCalls.join(', ')}`,
      );
    }
  }

  const readmeText = getRelText('readme.md');
  const meta = readmeText
    ? parseReadmeMetadata(readmeText)
    : {
        name: themeRootFolder.split('/').pop() || 'TemaImportado',
        version: '1.0',
        author: 'Desconhecido',
        license: 'MIT',
      };

  const skeletonCss = getRelText('skeleton-auto.css');
  const brandsCss = getRelText('brands.css');
  const headBlade = getRelText('extra/custom-head.blade.php');
  const detectedCssVars = {
    ...parseCssRootVariables(skeletonCss),
    ...parseCssRootVariables(brandsCss),
    ...parseCssRootVariables(headBlade),
  };

  const assets = relativeFiles
    .filter((p) => p.startsWith('extra/custom-assets/'))
    .map((p) => p.slice('extra/custom-assets/'.length))
    .filter(Boolean);

  const bladeFiles = relativeFiles.filter((p) => p.endsWith('.blade.php'));

  // Check for unresolved {{themeAsset('...')}} references and dangerous PHP tags in Blade
  for (const bladeRel of bladeFiles) {
    const content = getRelText(bladeRel);
    if (/<\?php|\b(eval|exec|shell_exec|system)\s*\(/i.test(content)) {
      securityErrors.push(`Código PHP executável ou função sensível detectada em ${bladeRel}.`);
    }
    const assetRefRe = /themeAsset\(\s*['"]([^'"]+)['"]\s*\)/g;
    let m: RegExpExecArray | null;
    while ((m = assetRefRe.exec(content)) !== null) {
      if (!assets.includes(m[1])) {
        compatibilityWarnings.push(
          `${bladeRel} referencia themeAsset('${m[1]}'), mas o arquivo não está em extra/custom-assets/.`,
        );
      }
    }
  }

  const valid = securityErrors.length === 0 && missingRequiredFiles.length < REQUIRED_LINKSTACK_FILES.length;

  return {
    valid,
    themeRootFolder,
    detectedName: meta.name,
    detectedVersion: meta.version,
    detectedAuthor: meta.author,
    detectedLicense: meta.license,
    parsedPhpConfig,
    detectedCssVars,
    files: entries,
    assets,
    bladeFiles,
    securityErrors,
    compatibilityWarnings,
    missingRequiredFiles,
  };
}

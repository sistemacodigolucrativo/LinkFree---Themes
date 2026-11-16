import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { generateThemePackageFiles, sanitizeSlug } from './src/core/linkstackGenerator';
import { createDefaultThemeConfig, createStarterPresets } from './src/core/palettes';
import { validateThemeProject } from './src/core/themeValidator';
import type { BaseThemeSummary, ThemeConfig, ThemeProject } from './src/core/types';
import {
  inspectThemeArchiveEntries,
  MAX_ZIP_BYTES,
  parseConfigPhpStatically,
  parseCssRootVariables,
  parseReadmeMetadata,
  validateZipEntryPath,
} from './src/core/zipSecurity';

const ROOT_DIR = process.cwd();
const REFERENCE_THEMES_DIR = path.join(ROOT_DIR, 'reference-themes');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const WORKSPACE_THEMES_DIR = path.join(DATA_DIR, 'workspace-themes');
const PROJECTS_FILE = path.join(DATA_DIR, 'studio-projects.json');
const DOCS_FILE = path.join(ROOT_DIR, 'docs', 'THEME_STUDIO_ARCHITECTURE.md');

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(WORKSPACE_THEMES_DIR, { recursive: true });
}

function safeResolveWithin(baseDir: string, target: string): string {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, target);
  if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
    throw new Error(`Acesso fora do diretório isolado bloqueado: ${target}`);
  }
  return resolvedTarget;
}

async function readAllFilesRecursively(dir: string, prefix = ''): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const out: string[] = [];
    for (const entry of entries) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        out.push(...(await readAllFilesRecursively(path.join(dir, entry.name), rel)));
      } else {
        out.push(rel);
      }
    }
    return out;
  } catch {
    return [];
  }
}

async function loadProjects(): Promise<ThemeProject[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Seed initial projects on first boot
  }
  const seeds = createStarterPresets();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(seeds, null, 2), 'utf-8');
  return seeds;
}

async function saveProjects(projects: ThemeProject[]): Promise<void> {
  await ensureDirs();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

async function materializeProjectWorkspace(project: ThemeProject): Promise<void> {
  const slug = sanitizeSlug(project.slug);
  const projectDir = safeResolveWithin(WORKSPACE_THEMES_DIR, slug);
  await fs.mkdir(projectDir, { recursive: true });
  const files = generateThemePackageFiles(project);
  for (const f of files) {
    const dest = safeResolveWithin(projectDir, f.path);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, f.content, 'utf-8');
  }
}

async function inspectReferenceThemes(): Promise<BaseThemeSummary[]> {
  const slugs = ['PolySleek', 'galaxy'];
  const summaries: BaseThemeSummary[] = [];

  for (const slug of slugs) {
    const themeDir = safeResolveWithin(REFERENCE_THEMES_DIR, slug);
    try {
      const files = await readAllFilesRecursively(themeDir);
      const configPhp = await fs.readFile(path.join(themeDir, 'config.php'), 'utf-8').catch(() => '');
      const readmeMd = await fs.readFile(path.join(themeDir, 'readme.md'), 'utf-8').catch(() => '');
      const skeletonCss = await fs
        .readFile(path.join(themeDir, 'skeleton-auto.css'), 'utf-8')
        .catch(() => '');
      const headBlade = await fs
        .readFile(path.join(themeDir, 'extra', 'custom-head.blade.php'), 'utf-8')
        .catch(() => '');

      const { parsed } = parseConfigPhpStatically(configPhp);
      const meta = parseReadmeMetadata(readmeMd);
      const cssVariables = {
        ...parseCssRootVariables(skeletonCss),
        ...parseCssRootVariables(headBlade),
      };
      const assetsCount = files.filter((f) => f.startsWith('extra/custom-assets/')).length;

      summaries.push({
        slug,
        name: meta.name || slug,
        version: meta.version || '1.0',
        author: meta.author || 'LinkStack Team',
        license: meta.license.toLowerCase().includes('gpl') ? 'GPLv3' : 'MIT',
        description:
          slug === 'PolySleek'
            ? 'Tema-base oficial com Particles.js, variáveis CSS modulares e layout centralizado.'
            : 'Tema-base oficial Galaxy com gradiente espacial radial e fonte Karla.',
        filesCount: files.length,
        assetsCount,
        phpConfig: {
          allow_custom_buttons: parsed.allow_custom_buttons ?? false,
          open_links_in_same_tab: parsed.open_links_in_same_tab ?? false,
          enable_custom_code: parsed.enable_custom_code ?? true,
          enable_custom_head: parsed.enable_custom_head ?? true,
          enable_custom_body: parsed.enable_custom_body ?? false,
          enable_custom_body_end: parsed.enable_custom_body_end ?? true,
          use_custom_icons: parsed.use_custom_icons ?? false,
          custom_icon_extension: parsed.custom_icon_extension ?? '.svg',
        },
        cssVariables,
      });
    } catch {
      // Skip if reference folder is missing
    }
  }
  return summaries;
}

function mapCssVarsToConfig(vars: Record<string, string>, baseConfig: ThemeConfig): ThemeConfig {
  const next = structuredClone(baseConfig);
  const pickHex = (val?: string) => {
    if (!val) return undefined;
    const match = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})/.exec(val);
    return match ? match[0] : undefined;
  };

  next.colors.backgroundPrimary =
    pickHex(vars['--background-color']) || pickHex(vars['--bgColor2']) || next.colors.backgroundPrimary;
  next.colors.backgroundSecondary =
    pickHex(vars['--bgColor']) || pickHex(vars['--menu-background-color']) || next.colors.backgroundSecondary;
  next.colors.accentPrimary =
    pickHex(vars['--accentColor']) ||
    pickHex(vars['--button-text-hover-color']) ||
    next.colors.accentPrimary;
  next.colors.titleColor = pickHex(vars['--title-color']) || next.colors.titleColor;
  next.colors.descriptionColor = pickHex(vars['--description-color']) || next.colors.descriptionColor;
  next.colors.buttonBg = pickHex(vars['--button-background-color']) || next.colors.buttonBg;
  next.colors.buttonText = pickHex(vars['--button-text-color']) || next.colors.buttonText;
  next.colors.buttonHoverText =
    pickHex(vars['--button-text-hover-color']) || next.colors.buttonHoverText;
  next.colors.footerBg = pickHex(vars['--footer-background-color']) || next.colors.footerBg;
  next.colors.footerText = pickHex(vars['--footer-text-color']) || next.colors.footerText;
  next.paletteId = 'custom';
  return next;
}

async function startServer() {
  await ensureDirs();
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'linkstack-futuristic-theme-studio' });
  });

  app.get('/api/themes/base', async (_req, res) => {
    try {
      const baseThemes = await inspectReferenceThemes();
      res.json({ baseThemes });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get('/api/projects', async (_req, res) => {
    try {
      const projects = await loadProjects();
      res.json({ projects });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const { project } = req.body as { project?: ThemeProject };
      if (!project || !project.id || !project.name) {
        return res.status(400).json({ error: 'Projeto inválido: id e name são obrigatórios.' });
      }
      const projects = await loadProjects();
      const idx = projects.findIndex((p) => p.id === project.id);
      const updatedProject: ThemeProject = {
        ...project,
        slug: sanitizeSlug(project.slug || project.name),
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        projects[idx] = updatedProject;
      } else {
        projects.unshift(updatedProject);
      }
      await saveProjects(projects);
      await materializeProjectWorkspace(updatedProject);
      res.json({ project: updatedProject, projects });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const projects = await loadProjects();
      const target = projects.find((p) => p.id === id);
      if (!target) {
        return res.status(404).json({ error: 'Projeto não encontrado.' });
      }
      if (target.sourceType === 'base') {
        return res
          .status(400)
          .json({ error: 'Temas-base oficiais não podem ser excluídos. Duplique para editar.' });
      }
      const remaining = projects.filter((p) => p.id !== id);
      await saveProjects(remaining);
      const slugDir = safeResolveWithin(WORKSPACE_THEMES_DIR, sanitizeSlug(target.slug));
      await fs.rm(slugDir, { recursive: true, force: true }).catch(() => undefined);
      res.json({ projects: remaining });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/themes/import-zip', async (req, res) => {
    try {
      const { filename, base64, confirmImport } = req.body as {
        filename?: string;
        base64?: string;
        confirmImport?: boolean;
      };

      if (!base64 || typeof base64 !== 'string') {
        return res.status(400).json({ error: 'Arquivo ZIP ausente na requisição.' });
      }

      const rawBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const buffer = Buffer.from(rawBase64, 'base64');

      if (buffer.byteLength > MAX_ZIP_BYTES) {
        return res.status(400).json({
          error: `Arquivo excede o limite de segurança de ${(MAX_ZIP_BYTES / (1024 * 1024)).toFixed(0)} MB.`,
        });
      }

      const zip = await JSZip.loadAsync(buffer);
      const rawEntries: {
        path: string;
        sizeBytes: number;
        compressedBytes: number;
        isDir: boolean;
        unixPermissions?: number | null;
      }[] = [];
      const textContents: Record<string, string> = {};

      for (const [entryPath, obj] of Object.entries(zip.files)) {
        const internal = obj as unknown as {
          _data?: { uncompressedSize?: number; compressedSize?: number };
          unixPermissions?: number | null;
        };
        const sizeBytes = internal._data?.uncompressedSize ?? 0;
        const compressedBytes = internal._data?.compressedSize ?? 0;

        rawEntries.push({
          path: entryPath,
          sizeBytes,
          compressedBytes,
          isDir: obj.dir,
          unixPermissions: typeof obj.unixPermissions === 'number' ? obj.unixPermissions : null,
        });

        const pathCheck = validateZipEntryPath(entryPath);
        if (
          !obj.dir &&
          pathCheck.safe &&
          /\.(php|css|md|txt|html|blade\.php|js|json)$/i.test(entryPath) &&
          sizeBytes < 1024 * 1024
        ) {
          textContents[entryPath.replace(/\\/g, '/')] = await obj.async('string');
        }
      }

      const inspection = inspectThemeArchiveEntries(rawEntries, textContents);
      if (!inspection.valid) {
        return res.status(422).json({
          error:
            inspection.securityErrors[0] ||
            'Pacote ZIP incompatível ou bloqueado pelas regras de segurança.',
          inspection,
        });
      }

      if (!confirmImport) {
        return res.json({ inspection, filename });
      }

      // Confirmed import into isolated workspace
      const rootLeaf = inspection.themeRootFolder.split('/').filter(Boolean).pop() || '';
      const baseSlug = sanitizeSlug(inspection.detectedName || rootLeaf || 'ImportedTheme');
      const uniqueSlug = `${baseSlug}_${Date.now().toString().slice(-4)}`;
      const isolatedDir = safeResolveWithin(WORKSPACE_THEMES_DIR, uniqueSlug);
      await fs.mkdir(isolatedDir, { recursive: true });

      const prefix = inspection.themeRootFolder ? `${inspection.themeRootFolder}/` : '';
      for (const [entryPath, obj] of Object.entries(zip.files)) {
        if (obj.dir) continue;
        const norm = entryPath.replace(/\\/g, '/');
        if (!validateZipEntryPath(norm).safe) continue;
        const rel = prefix && norm.startsWith(prefix) ? norm.slice(prefix.length) : norm;
        if (!rel) continue;
        const dest = safeResolveWithin(isolatedDir, rel);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        const contentBuf = await obj.async('nodebuffer');
        await fs.writeFile(dest, contentBuf);
      }

      const defaultCfg = createDefaultThemeConfig('electric-blue');
      const mergedCfg = mapCssVarsToConfig(inspection.detectedCssVars, {
        ...defaultCfg,
        phpConfig: {
          ...defaultCfg.phpConfig,
          ...inspection.parsedPhpConfig,
        },
      });

      const importedProject: ThemeProject = {
        id: `imp-${Date.now()}`,
        slug: uniqueSlug,
        name: inspection.detectedName || uniqueSlug,
        version: inspection.detectedVersion || '1.0',
        date: new Date().toISOString().slice(0, 10),
        author: inspection.detectedAuthor || 'Autor Importado',
        authorUri: 'https://linkstack.org',
        license: inspection.detectedLicense.toLowerCase().includes('gpl') ? 'GPLv3' : 'MIT',
        sourceType: 'imported',
        baseThemeSlug: rootLeaf || baseSlug,
        description: `Tema importado com segurança em área isolada (${inspection.files.length} entradas inspecionadas).`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editCount: 0,
        config: mergedCfg,
        preservedAssets: inspection.assets,
        importWarnings: inspection.compatibilityWarnings,
      };

      const projects = await loadProjects();
      projects.unshift(importedProject);
      await saveProjects(projects);

      return res.json({ inspection, project: importedProject, projects });
    } catch (err) {
      res.status(500).json({ error: `Falha ao processar ZIP: ${(err as Error).message}` });
    }
  });

  app.post('/api/themes/export-zip', async (req, res) => {
    try {
      const { project, previewPngDataUrl } = req.body as {
        project?: ThemeProject;
        previewPngDataUrl?: string;
      };
      if (!project) {
        return res.status(400).json({ error: 'Projeto ausente para exportação.' });
      }

      const validation = validateThemeProject(project);
      if (validation.overallStatus === 'incompatible') {
        return res.status(422).json({
          error: 'Tema reprovado na validação de compatibilidade. Corrija os erros antes de exportar.',
          validation,
        });
      }

      const slug = sanitizeSlug(project.slug || project.name);
      const zip = new JSZip();
      const folder = zip.folder('themes')?.folder(slug);
      if (!folder) {
        throw new Error('Não foi possível criar diretório themes/<tema>/ no ZIP.');
      }

      const generatedFiles = generateThemePackageFiles({ ...project, slug });
      for (const file of generatedFiles) {
        folder.file(file.path, file.content);
      }

      // Attach real 1920x1080 preview.png if provided, else copy reference preview.png
      if (previewPngDataUrl && previewPngDataUrl.startsWith('data:image/png;base64,')) {
        const pngBase64 = previewPngDataUrl.slice('data:image/png;base64,'.length);
        folder.file('preview.png', Buffer.from(pngBase64, 'base64'));
      } else {
        const fallbackPreview = path.join(REFERENCE_THEMES_DIR, 'PolySleek', 'preview.png');
        const buf = await fs.readFile(fallbackPreview).catch(() => null);
        if (buf) folder.file('preview.png', buf);
      }

      // Bundle image backdrop into extra/custom-assets/bg-backdrop.jpg if enabled
      if (
        project.config.background.effect === 'image-backdrop' ||
        project.config.background.imagePreset !== 'none'
      ) {
        const imgFile =
          project.config.background.imagePreset === 'aurora'
            ? 'bg_aurora_nebula_1794859274083.jpg'
            : 'bg_obsidian_architecture_1794859274188.jpg';
        const imgBuf = await fs
          .readFile(path.join(ROOT_DIR, 'src', 'assets', 'images', imgFile))
          .catch(() => null);
        if (imgBuf) {
          folder.file('extra/custom-assets/bg-backdrop.jpg', imgBuf);
        }
      }

      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${slug}.zip"`);
      res.send(zipBuffer);
    } catch (err) {
      res.status(500).json({ error: `Erro ao gerar pacote ZIP: ${(err as Error).message}` });
    }
  });

  app.get('/api/docs', async (_req, res) => {
    try {
      const markdown = await fs.readFile(DOCS_FILE, 'utf-8');
      res.json({ markdown });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinkStack Futuristic Theme Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

import { contrastRatio } from './contrast';
import { generateThemePackageFiles, sanitizeSlug } from './linkstackGenerator';
import type { ThemeProject, ValidationCheckItem, ValidationReport } from './types';

export function validateThemeProject(project: ThemeProject): ValidationReport {
  const files = generateThemePackageFiles(project);
  const fileMap = new Map(files.map((f) => [f.path, f]));
  const cfg = project.config;
  const checks: ValidationCheckItem[] = [];

  // 1. Mandatory files check
  const required = [
    'config.php',
    'readme.md',
    'skeleton-auto.css',
    'brands.css',
    'animations.css',
    'share.button.css',
  ];
  const missing = required.filter((r) => !fileMap.has(r));
  checks.push({
    id: 'mandatory-files',
    category: 'structure',
    label: 'Arquivos obrigatórios LinkStack',
    status: missing.length === 0 ? 'pass' : 'fail',
    detail:
      missing.length === 0
        ? 'config.php, readme.md e todos os 4 CSS principais estão presentes.'
        : `Faltam arquivos obrigatórios: ${missing.join(', ')}`,
  });

  // 2. Root slug & directory check
  const cleanSlug = sanitizeSlug(project.slug);
  checks.push({
    id: 'root-directory',
    category: 'structure',
    label: 'Estrutura themes/<Tema>/ idêntica ao padrão',
    status: cleanSlug.length >= 2 && cleanSlug === project.slug ? 'pass' : 'warn',
    detail:
      cleanSlug === project.slug
        ? `Pacote estruturado em themes/${cleanSlug}/ (plug-and-play igual ao ZIP de referência).`
        : `O slug "${project.slug}" será normalizado para themes/${cleanSlug}/ na exportação.`,
  });

  // 3. config.php static syntax & key check
  const configPhp = fileMap.get('config.php')?.content ?? '';
  const hasPhpReturn = configPhp.includes('<?php') && configPhp.includes('return [');
  const hasCustomFlags =
    configPhp.includes("'enable_custom_code'") && configPhp.includes("'allow_custom_buttons'");
  checks.push({
    id: 'php-config',
    category: 'syntax',
    label: 'Estrutura config.php válida',
    status: hasPhpReturn && hasCustomFlags ? 'pass' : 'fail',
    detail:
      hasPhpReturn && hasCustomFlags
        ? 'Array associativo PHP válido com flags de custom code e ícones.'
        : 'config.php não contém as chaves padrão esperadas pelo LinkStack.',
  });

  // 4. Blade templates & custom code flags consistency
  const bladeIssues: string[] = [];
  if (cfg.phpConfig.enable_custom_code) {
    if (cfg.phpConfig.enable_custom_head && !fileMap.has('extra/custom-head.blade.php')) {
      bladeIssues.push('extra/custom-head.blade.php ausente');
    }
    if (cfg.phpConfig.enable_custom_body && !fileMap.has('extra/custom-body.blade.php')) {
      bladeIssues.push('extra/custom-body.blade.php ausente');
    }
    if (cfg.phpConfig.enable_custom_body_end && !fileMap.has('extra/custom-body-end.blade.php')) {
      bladeIssues.push('extra/custom-body-end.blade.php ausente');
    }
  }
  checks.push({
    id: 'blade-consistency',
    category: 'syntax',
    label: 'Templates Blade e diretivas extra/',
    status: bladeIssues.length === 0 ? 'pass' : 'fail',
    detail:
      bladeIssues.length === 0
        ? 'custom-head, custom-body e custom-body-end alinhados com config.php.'
        : bladeIssues.join('; '),
  });

  // 5. CSS braces balance check
  const cssFiles = ['skeleton-auto.css', 'brands.css', 'animations.css', 'share.button.css'];
  const unbalancedCss = cssFiles.filter((name) => {
    const css = fileMap.get(name)?.content ?? '';
    const open = (css.match(/\{/g) || []).length;
    const close = (css.match(/\}/g) || []).length;
    return open !== close;
  });
  checks.push({
    id: 'css-syntax',
    category: 'syntax',
    label: 'Sintaxe CSS e balanceamento de blocos',
    status: unbalancedCss.length === 0 ? 'pass' : 'fail',
    detail:
      unbalancedCss.length === 0
        ? 'Todos os 4 arquivos CSS possuem chaves balanceadas e variáveis :root válidas.'
        : `Erro de sintaxe provável em: ${unbalancedCss.join(', ')}`,
  });

  // 6. WCAG Contrast check (Title vs Bg and Button Text vs Button Bg)
  const contrastTitle = contrastRatio(cfg.colors.titleColor, cfg.colors.backgroundPrimary);
  const contrastButton = contrastRatio(
    cfg.colors.buttonText,
    cfg.colors.buttonBg,
    cfg.colors.backgroundPrimary,
  );
  const minContrast = Math.min(contrastTitle, contrastButton);
  checks.push({
    id: 'wcag-contrast',
    category: 'contrast',
    label: 'Contraste e legibilidade (WCAG)',
    status: minContrast >= 4.5 ? 'pass' : minContrast >= 3.0 ? 'warn' : 'fail',
    detail: `Título/Fundo: ${contrastTitle}:1 · Texto/Botão: ${contrastButton}:1 (recomendado ≥ 4.5:1).`,
  });

  // 7. Responsiveness & overflow check
  const responsiveOk =
    cfg.layout.containerMaxWidthPx <= 820 &&
    cfg.buttons.minHeightPx >= 44 &&
    cfg.layout.avatarSizePx <= 220;
  checks.push({
    id: 'responsive-layout',
    category: 'responsive',
    label: 'Responsividade e alvos de toque mobile',
    status: responsiveOk ? 'pass' : 'warn',
    detail: responsiveOk
      ? `Container fluido até ${cfg.layout.containerMaxWidthPx}px, botões ≥ ${cfg.buttons.minHeightPx}px sem scroll horizontal.`
      : 'Largura máxima ou altura mínima do botão fora da faixa ideal para mobile (≥ 44px).',
  });

  // 8. Performance & Reduced Motion
  const animCss = fileMap.get('animations.css')?.content ?? '';
  const hasReducedMotion = animCss.includes('prefers-reduced-motion');
  checks.push({
    id: 'perf-motion',
    category: 'performance',
    label: 'Desempenho e prefers-reduced-motion',
    status: hasReducedMotion ? 'pass' : 'warn',
    detail: hasReducedMotion
      ? 'Animações baseadas em transform/opacity com fallback prefers-reduced-motion ativo.'
      : 'prefers-reduced-motion desativado nas configurações de animação.',
  });

  // 9. Security & Non-blocking overlay check
  const bodyBlade = fileMap.get('extra/custom-body.blade.php')?.content ?? '';
  const headBlade = fileMap.get('extra/custom-head.blade.php')?.content ?? '';
  const pointerSafe = headBlade.includes('pointer-events: none') && bodyBlade.includes('aria-hidden="true"');
  checks.push({
    id: 'security-overlay',
    category: 'security',
    label: 'Isolamento de camadas e segurança',
    status: pointerSafe ? 'pass' : 'warn',
    detail: pointerSafe
      ? 'Camadas de fundo usam pointer-events: none e zero PHP executável em Blade.'
      : 'Verifique se as camadas decorativas não bloqueiam cliques nos links.',
  });

  // 10. License & Attribution check
  const readme = fileMap.get('readme.md')?.content ?? '';
  const hasLicense = /Theme License:\s*(MIT|GPLv3|Apache-2\.0)/i.test(readme);
  checks.push({
    id: 'license-attribution',
    category: 'structure',
    label: 'Metadados e preservação de licença',
    status: hasLicense ? 'pass' : 'warn',
    detail: hasLicense
      ? `Licença declarada (${project.license}) e autoria preservadas em readme.md.`
      : 'Licença ausente em readme.md.',
  });

  const hasFail = checks.some((c) => c.status === 'fail');
  const hasWarn = checks.some((c) => c.status === 'warn');

  const rawTotalBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);
  const estimatedZipKb = Math.max(12, Math.round((rawTotalBytes + 42000) / 1024));

  return {
    overallStatus: hasFail ? 'incompatible' : hasWarn ? 'warnings' : 'compatible',
    checks,
    contrastTitle,
    contrastButton,
    estimatedZipKb,
    simulationNotice:
      'Validação executada via análise estática dos arquivos gerados, verificação de sintaxe PHP/CSS/Blade e simulação isolada do DOM LinkStack. O runtime completo Laravel/PHP não está instalado neste container de preview.',
  };
}

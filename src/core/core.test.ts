import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio, hexToRgbaString, parseColor } from './contrast';
import { generateThemePackageFiles } from './linkstackGenerator';
import { applyPaletteToConfig, createStarterPresets } from './palettes';
import { evaluateHorizontalSwipe, stepProjectIndex } from './swipeNavigation';
import { validateThemeProject } from './themeValidator';
import {
  inspectThemeArchiveEntries,
  parseConfigPhpStatically,
  parseReadmeMetadata,
  validateZipEntryPath,
} from './zipSecurity';

test('color parser and WCAG contrast calculations work accurately', () => {
  const parsed = parseColor('#03dac6');
  assert.deepEqual(parsed, { r: 3, g: 218, b: 198, a: 1 });
  assert.equal(hexToRgbaString('#03dac6', 0.5), 'rgba(3, 218, 198, 0.5)');
  const blackWhite = contrastRatio('#ffffff', '#000000');
  assert.equal(blackWhite, 21);
});

test('zipSecurity blocks path traversal, absolute paths, and dangerous extensions', () => {
  assert.equal(validateZipEntryPath('MyTheme/config.php').safe, true);
  assert.equal(validateZipEntryPath('../etc/passwd').safe, false);
  assert.equal(validateZipEntryPath('/abs/path/config.php').safe, false);
  assert.equal(validateZipEntryPath('MyTheme/evil.sh').safe, false);
  assert.equal(validateZipEntryPath('MyTheme/shell.phtml').safe, false);
});

test('static PHP config and readme parsers extract metadata without executing PHP', () => {
  const php = `<?php return [ 'allow_custom_buttons' => 'false', 'enable_custom_code' => 'true', 'custom_icon_extension' => '.svg' ];`;
  const { parsed, suspiciousCalls } = parseConfigPhpStatically(php);
  assert.equal(suspiciousCalls.length, 0);
  assert.equal(parsed.allow_custom_buttons, false);
  assert.equal(parsed.enable_custom_code, true);
  assert.equal(parsed.custom_icon_extension, '.svg');

  const dangerous = `<?php system('rm -rf /'); return [];`;
  const dangerRes = parseConfigPhpStatically(dangerous);
  assert.ok(dangerRes.suspiciousCalls.length > 0);

  const meta = parseReadmeMetadata(`* Theme Name: NovaNeon\n* Theme Version: 2.0\n* Theme Author: Studio\n* Theme License: MIT`);
  assert.equal(meta.name, 'NovaNeon');
  assert.equal(meta.version, '2.0');
  assert.equal(meta.license, 'MIT');
});

test('inspectThemeArchiveEntries validates valid LinkStack ZIP and flags missing files or symlinks', () => {
  const validResult = inspectThemeArchiveEntries(
    [
      { path: 'CyberNova/config.php', sizeBytes: 120, compressedBytes: 80, isDir: false },
      { path: 'CyberNova/readme.md', sizeBytes: 120, compressedBytes: 80, isDir: false },
      { path: 'CyberNova/skeleton-auto.css', sizeBytes: 500, compressedBytes: 200, isDir: false },
      { path: 'CyberNova/brands.css', sizeBytes: 300, compressedBytes: 120, isDir: false },
      { path: 'CyberNova/animations.css', sizeBytes: 250, compressedBytes: 100, isDir: false },
      { path: 'CyberNova/share.button.css', sizeBytes: 220, compressedBytes: 90, isDir: false },
      { path: 'CyberNova/extra/custom-head.blade.php', sizeBytes: 100, compressedBytes: 60, isDir: false },
    ],
    {
      'CyberNova/config.php': "<?php return ['enable_custom_code' => 'true'];",
      'CyberNova/readme.md': '* Theme Name: CyberNova\n* Theme Version: 1.4\n* Theme License: MIT',
      'CyberNova/skeleton-auto.css': ':root { --background-color: #090a0f; --accentColor: #03dac6; }',
      'CyberNova/extra/custom-head.blade.php': '<style>body{}</style>',
    },
  );
  assert.equal(validResult.valid, true);
  assert.equal(validResult.detectedName, 'CyberNova');
  assert.equal(validResult.missingRequiredFiles.length, 0);

  const symlinkResult = inspectThemeArchiveEntries(
    [{ path: 'Bad/link', sizeBytes: 10, compressedBytes: 10, isDir: false, unixPermissions: 0o120777 }],
    {},
  );
  assert.equal(symlinkResult.valid, false);
  assert.ok(symlinkResult.securityErrors.length > 0);
});

test('linkstackGenerator produces complete valid files and validator passes starter presets', () => {
  const presets = createStarterPresets();
  const base = presets[2]; // CyberHorizon
  const files = generateThemePackageFiles(base);
  const paths = files.map((f) => f.path);

  assert.ok(paths.includes('config.php'));
  assert.ok(paths.includes('readme.md'));
  assert.ok(paths.includes('skeleton-auto.css'));
  assert.ok(paths.includes('brands.css'));
  assert.ok(paths.includes('animations.css'));
  assert.ok(paths.includes('share.button.css'));
  assert.ok(paths.includes('extra/custom-head.blade.php'));
  assert.ok(paths.includes('extra/custom-body.blade.php'));
  assert.ok(paths.includes('extra/custom-body-end.blade.php'));
  assert.ok(paths.includes('extra/custom-assets/theme-effects.js'));

  const updated = { ...base, config: applyPaletteToConfig(base.config, 'emerald-future') };
  const report = validateThemeProject(updated);
  assert.equal(report.overallStatus, 'compatible');

  // Verify themes/<Slug>/ round-trip matches delivered ZIP organization with zero warnings
  const textMap: Record<string, string> = {};
  const entries = files.map((f) => {
    const full = `themes/${base.slug}/${f.path}`;
    textMap[full] = f.content;
    return { path: full, sizeBytes: f.sizeBytes, compressedBytes: f.sizeBytes, isDir: false };
  });
  const roundTrip = inspectThemeArchiveEntries(entries, textMap);
  assert.equal(roundTrip.valid, true);
  assert.equal(roundTrip.themeRootFolder, `themes/${base.slug}`);
  assert.equal(roundTrip.compatibilityWarnings.length, 0);
});

test('swipeNavigation steps circularly across templates and distinguishes horizontal swipes from vertical scroll', () => {
  assert.equal(stepProjectIndex(0, 5, -1), 4);
  assert.equal(stepProjectIndex(4, 5, 1), 0);
  assert.equal(stepProjectIndex(2, 5, 1), 3);
  assert.equal(evaluateHorizontalSwipe(-120, 10, 320), 'next');
  assert.equal(evaluateHorizontalSwipe(95, -12, 350), 'prev');
  assert.equal(evaluateHorizontalSwipe(-42, 4, 180), 'next');
  assert.equal(evaluateHorizontalSwipe(-25, 80, 200), null);
  assert.equal(evaluateHorizontalSwipe(-10, 2, 100), null);
});

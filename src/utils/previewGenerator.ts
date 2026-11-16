import type { ThemeProject } from '../core/types';

/**
 * Renders an authentic 1920x1080 preview.png image matching the exact
 * customized theme palette, background style, avatar frame, and buttons.
 */
export function renderThemePreviewPng(project: ThemeProject): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const { colors, buttons, layout, typography } = project.config;

  // 1. Background gradient
  const grad = ctx.createRadialGradient(960, 260, 80, 960, 540, 1200);
  grad.addColorStop(0, colors.backgroundSecondary);
  grad.addColorStop(1, colors.backgroundPrimary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1920, 1080);

  // 2. Subtle grid / accent glow
  ctx.save();
  ctx.strokeStyle = colors.accentPrimary;
  ctx.globalAlpha = 0.08;
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1920; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1080);
    ctx.stroke();
  }
  for (let y = 0; y <= 1080; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1920, y);
    ctx.stroke();
  }
  ctx.restore();

  // Accent radial glow behind avatar
  const glow = ctx.createRadialGradient(960, 250, 20, 960, 250, 320);
  glow.addColorStop(0, colors.accentPrimary + '44');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(500, 0, 920, 600);

  // 3. Avatar circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(960, 210, 74, 0, Math.PI * 2);
  ctx.fillStyle = colors.buttonBg;
  ctx.fill();
  ctx.lineWidth = Math.max(3, layout.avatarBorderPx);
  ctx.strokeStyle = colors.buttonBorder;
  ctx.stroke();
  ctx.fillStyle = colors.accentPrimary;
  ctx.font = '700 44px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(project.name.slice(0, 2).toUpperCase(), 960, 212);
  ctx.restore();

  // 4. Title & Description
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.titleColor;
  ctx.font = `700 46px ${typography.fontFamily}, sans-serif`;
  ctx.fillText(project.name, 960, 340);

  ctx.fillStyle = colors.descriptionColor;
  ctx.font = `400 22px ${typography.fontFamily}, sans-serif`;
  ctx.fillText(`LinkStack Theme · v${project.version} · ${project.license}`, 960, 390);

  // 5. Simulated Buttons (4 cards)
  const labels = ['Portfólio Digital', 'Canal Técnico', 'Documentação Aberta', 'Contato Direto'];
  const btnWidth = 640;
  const btnHeight = 74;
  const startY = 460;
  const radius = Math.min(buttons.borderRadiusPx * 1.4, 28);

  labels.forEach((label, idx) => {
    const x = 960 - btnWidth / 2;
    const y = startY + idx * 96;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, btnWidth, btnHeight, radius);
    ctx.fillStyle = colors.buttonBg;
    ctx.globalAlpha = 0.88;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = Math.max(1.5, buttons.borderWidthPx);
    ctx.strokeStyle = idx === 0 ? colors.accentPrimary : colors.buttonBorder;
    ctx.stroke();

    ctx.fillStyle = colors.buttonText;
    ctx.font = `600 22px ${typography.fontFamily}, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 960, y + btnHeight / 2);
    ctx.restore();
  });

  // 6. Footer mark
  ctx.fillStyle = colors.footerText;
  ctx.globalAlpha = 0.75;
  ctx.font = '500 18px JetBrains Mono, monospace';
  ctx.fillText(`LinkStack Futuristic Theme Studio · ${project.slug}`, 960, 990);

  return canvas.toDataURL('image/png');
}

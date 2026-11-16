import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileCode2, X, XCircle } from 'lucide-react';
import { generateThemePackageFiles, sanitizeSlug } from '../core/linkstackGenerator';
import { validateThemeProject } from '../core/themeValidator';
import type { ThemeProject } from '../core/types';
import { renderThemePreviewPng } from '../utils/previewGenerator';

interface ExportZipModalProps {
  open: boolean;
  project: ThemeProject;
  onClose: () => void;
}

export function ExportZipModal({ open, project, onClose }: ExportZipModalProps) {
  const [selectedPath, setSelectedPath] = useState<string>('config.php');
  const [previewPng, setPreviewPng] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const report = useMemo(() => validateThemeProject(project), [project]);
  const generatedFiles = useMemo(() => generateThemePackageFiles(project), [project]);
  const slug = sanitizeSlug(project.slug || project.name);

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      const dataUrl = renderThemePreviewPng(project);
      setPreviewPng(dataUrl);
    }
  }, [open, project]);

  if (!open) return null;

  const activeFile = generatedFiles.find((f) => f.path === selectedPath) ?? generatedFiles[0];

  const handleDownloadZip = async () => {
    setDownloading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/themes/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          previewPngDataUrl: previewPng,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Falha ao gerar pacote ZIP.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0F131D] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 id="export-modal-title" className="font-display text-lg font-bold text-slate-100">
              Validar e Exportar Pacote LinkStack ({slug}.zip)
            </h2>
            <p className="text-xs text-slate-400">
              Compatível com LinkStack → Temas → Importar temas · Tamanho estimado: ~{report.estimatedZipKb} KB
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar modal de exportação"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 studio-scroll">
          {/* Validation Banner */}
          <div
            className={`rounded-xl border p-4 text-xs ${
              report.overallStatus === 'compatible'
                ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                : report.overallStatus === 'warnings'
                ? 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
            }`}
          >
            <div className="font-semibold text-sm mb-1">
              {report.overallStatus === 'compatible'
                ? 'Tema aprovado na validação estática de 10 pontos'
                : report.overallStatus === 'warnings'
                ? 'Tema exportável com recomendações de ajuste'
                : 'Tema incompatível — corrija os itens reprovados antes de exportar'}
            </div>
            <p className="opacity-90">{report.simulationNotice}</p>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
              {errorMsg}
            </div>
          )}

          {/* 10-Point Compatibility Matrix + 1920x1080 preview.png */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Checklist de Compatibilidade LinkStack (10 verificações)
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {report.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs"
                  >
                    {chk.status === 'pass' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : chk.status === 'warn' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200">{chk.label}</div>
                      <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        {chk.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  preview.png Gerado (1920×1080)
                </h3>
                <div className="aspect-video w-full rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center">
                  {previewPng ? (
                    <img
                      src={previewPng}
                      alt={`Prévia 1920x1080 de ${project.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-500 p-6">Gerando preview.png...</span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                Incluído automaticamente em <span className="font-mono text-slate-300">themes/{slug}/preview.png</span> — mesma estrutura do pacote original LinkStack.
              </p>
            </div>
          </div>

          {/* Exported Tree & Code Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden min-h-[260px]">
            <div className="border-b lg:border-b-0 lg:border-r border-slate-800 p-3">
              <h3 className="text-xs font-semibold text-slate-300 mb-2 font-mono">
                themes/{slug}/
              </h3>
              <div className="space-y-1">
                {generatedFiles.map((f) => (
                  <button
                    key={f.path}
                    type="button"
                    onClick={() => setSelectedPath(f.path)}
                    className={`w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left font-mono text-xs transition-colors cursor-pointer ${
                      selectedPath === f.path
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <FileCode2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{f.path}</span>
                    </span>
                    <span className="text-[10px] tabular-nums opacity-70 shrink-0">
                      {f.sizeBytes}B
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/60">
                <span className="font-mono text-xs text-cyan-300">
                  themes/{slug}/{activeFile.path}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-slate-400">
                  {activeFile.sizeBytes} bytes
                </span>
              </div>
              <pre className="h-64 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-slate-300 studio-scroll">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            disabled={report.overallStatus === 'incompatible' || downloading}
            onClick={handleDownloadZip}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{downloading ? 'Gerando ZIP...' : `Baixar ${slug}.zip`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

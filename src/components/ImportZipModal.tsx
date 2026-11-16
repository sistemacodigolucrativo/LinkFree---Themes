import { useState } from 'react';
import { AlertTriangle, CheckCircle2, FileArchive, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import type { ThemeProject, ZipInspectionResult } from '../core/types';

interface ImportZipModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (project: ThemeProject, allProjects: ThemeProject[]) => void;
}

export function ImportZipModal({ open, onClose, onImported }: ImportZipModalProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inspection, setInspection] = useState<ZipInspectionResult | null>(null);

  if (!open) return null;

  const resetState = () => {
    setFileName(null);
    setBase64Data(null);
    setErrorMsg(null);
    setInspection(null);
  };

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setInspection(null);
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Selecione um arquivo válido com extensão .zip.');
      return;
    }

    setLoading(true);
    setFileName(file.name);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Falha ao ler arquivo selecionado.'));
        reader.readAsDataURL(file);
      });

      setBase64Data(dataUrl);

      const res = await fetch('/api/themes/import-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          base64: dataUrl,
          confirmImport: false,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setInspection(json.inspection ?? null);
        setErrorMsg(json.error || 'Pacote rejeitado na inspeção de segurança.');
      } else {
        setInspection(json.inspection);
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!base64Data || !fileName) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/themes/import-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileName,
          base64: base64Data,
          confirmImport: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Falha ao importar pacote para a área isolada.');
        return;
      }
      onImported(json.project, json.projects);
      resetState();
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0F131D] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 id="import-modal-title" className="font-display text-lg font-bold text-slate-100">
              Importar Tema LinkStack (.zip)
            </h2>
            <p className="text-xs text-slate-400">
              Inspeção estática isolada sem execução de PHP e sem alterar temas de produção.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar modal de importação"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 studio-scroll">
          <label
            htmlFor="zip-file-input"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) void handleFile(dropped);
            }}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 px-4 py-8 text-center transition-colors hover:border-cyan-500/60 cursor-pointer"
          >
            <FileArchive className="h-9 w-9 text-cyan-400 mb-2" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-200">
              {fileName ? `Arquivo selecionado: ${fileName}` : 'Clique ou arraste um pacote .zip compatível com LinkStack'}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              Limite seguro: 15 MB · Validação contra Path Traversal, symlinks e PHP malicioso
            </span>
            <input
              id="zip-file-input"
              type="file"
              accept=".zip"
              className="sr-only"
              onChange={(e) => {
                const chosen = e.target.files?.[0];
                if (chosen) void handleFile(chosen);
              }}
            />
          </label>

          {loading && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs text-cyan-300">
              Inspecionando estrutura, metadados e segurança do pacote ZIP...
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-200 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Pacote rejeitado na validação</span>
              </div>
              <p>{errorMsg}</p>
            </div>
          )}

          {inspection && (
            <div className="space-y-4">
              {/* Metadata Summary */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    {inspection.valid ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-rose-400" aria-hidden="true" />
                    )}
                    <span>
                      {inspection.valid
                        ? 'Inspeção de Segurança Aprovada'
                        : 'Falha na Inspeção de Segurança'}
                    </span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-slate-400">
                    {inspection.files.length} entradas
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Nome Detectado</dt>
                    <dd className="font-semibold text-slate-100">{inspection.detectedName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Versão / Licença</dt>
                    <dd className="font-mono text-slate-200">
                      v{inspection.detectedVersion} · {inspection.detectedLicense}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Autor</dt>
                    <dd className="text-slate-200">{inspection.detectedAuthor}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Pasta Raiz no ZIP</dt>
                    <dd className="font-mono text-slate-200">
                      {inspection.themeRootFolder || '(raiz)'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Warnings */}
              {inspection.compatibilityWarnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3.5 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Avisos de Compatibilidade</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {inspection.compatibilityWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* File list preview */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Arquivos identificados no pacote ({inspection.files.filter((f) => !f.isDir).length})
                </p>
                <ul className="max-h-40 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-400 studio-scroll">
                  {inspection.files
                    .filter((f) => !f.isDir)
                    .slice(0, 60)
                    .map((entry) => (
                      <li key={entry.path} className="flex items-center justify-between gap-2">
                        <span className="truncate">{entry.path}</span>
                        <span className="shrink-0 tabular-nums text-slate-500">
                          {entry.sizeBytes} B
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-5 py-3.5">
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!inspection?.valid || loading}
            onClick={handleConfirmImport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>Importar para Área Isolada</span>
          </button>
        </div>
      </div>
    </div>
  );
}

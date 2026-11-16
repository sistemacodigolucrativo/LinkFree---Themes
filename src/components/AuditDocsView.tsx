import { useEffect, useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import type { BaseThemeSummary } from '../core/types';

interface AuditDocsViewProps {
  baseThemes: BaseThemeSummary[];
}

export function AuditDocsView({ baseThemes }: AuditDocsViewProps) {
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/docs')
      .then((r) => r.json())
      .then((d) => setMarkdown(d.markdown || ''))
      .catch(() => setMarkdown('Não foi possível carregar a documentação técnica do servidor.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:py-8 space-y-8">
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100">
          Auditoria Técnica LinkStack &amp; Documentação
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Resultados da inspeção estrutural dos temas de referência, contrato de arquivos exportados e garantias de segurança.
        </p>
      </div>

      {/* Live Base Theme Audit Cards */}
      <section aria-labelledby="audit-themes-heading" className="space-y-4">
        <h2 id="audit-themes-heading" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          <span>Temas de Referência Auditados no Ambiente ({baseThemes.length})</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {baseThemes.map((t) => (
            <div
              key={t.slug}
              className="rounded-xl border border-slate-800 bg-[#111622] p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-slate-100">
                  themes/{t.slug}/
                </h3>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  v{t.version} · {t.license}
                </span>
              </div>
              <p className="text-xs text-slate-400">{t.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-800/80 pt-3">
                <div>
                  <span className="text-slate-500 block">Arquivos</span>
                  <span className="text-slate-200 tabular-nums">{t.filesCount} itens</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Custom Assets</span>
                  <span className="text-slate-200 tabular-nums">{t.assetsCount} itens</span>
                </div>
                <div>
                  <span className="text-slate-500 block">enable_custom_code</span>
                  <span className="text-cyan-300">{String(t.phpConfig.enable_custom_code)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">allow_custom_buttons</span>
                  <span className="text-cyan-300">{String(t.phpConfig.allow_custom_buttons)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & Continuity Markdown */}
      <section aria-labelledby="docs-md-heading" className="space-y-3">
        <h2 id="docs-md-heading" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          <span>Documentação de Arquitetura, Segurança e Continuidade (docs/THEME_STUDIO_ARCHITECTURE.md)</span>
        </h2>

        <div className="rounded-xl border border-slate-800 bg-[#0D111A] p-5">
          {loading ? (
            <p className="text-xs text-slate-400">Carregando documentação...</p>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-300">
              {markdown}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}

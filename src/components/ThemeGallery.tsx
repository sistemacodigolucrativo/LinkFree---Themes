import { useState } from 'react';
import {
  Copy,
  Edit3,
  FolderUp,
  GitBranch,
  Plus,
  Search,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import type { BaseThemeSummary, ThemeProject } from '../core/types';

interface ThemeGalleryProps {
  projects: ThemeProject[];
  baseThemes: BaseThemeSummary[];
  activeProjectId: string;
  onSelectAndEdit: (project: ThemeProject) => void;
  onDuplicateProject: (project: ThemeProject, asNewVersion?: boolean) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
  onOpenImportModal: () => void;
  onCreateBlankFuturistic: () => void;
}

type GalleryFilter = 'all' | 'base' | 'preset' | 'custom';

export function ThemeGallery({
  projects,
  baseThemes,
  activeProjectId,
  onSelectAndEdit,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
  onOpenImportModal,
  onCreateBlankFuturistic,
}: ThemeGalleryProps) {
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'base' && p.sourceType === 'base') ||
      (filter === 'preset' && p.sourceType === 'preset') ||
      (filter === 'custom' && (p.sourceType === 'custom' || p.sourceType === 'imported'));
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const startRename = (p: ThemeProject) => {
    setRenamingId(p.id);
    setRenameValue(p.name);
  };

  const submitRename = (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      onRenameProject(id, trimmed);
    }
    setRenamingId(null);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:py-8">
      {/* Header & Workspace Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            Laboratório de Temas LinkStack
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
            Selecione um tema-base auditado ({baseThemes.map((b) => b.slug).join(', ') || 'PolySleek, galaxy'}) para duplicar sem alterar o núcleo original, importe um pacote ZIP ou personalize um preset futurístico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 cursor-pointer whitespace-nowrap"
          >
            <FolderUp className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Importar ZIP</span>
          </button>
          <button
            type="button"
            onClick={onCreateBlankFuturistic}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-white cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Novo Tema Futurístico</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-slate-900/90 p-1 border border-slate-800 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'base', label: 'Temas-Base' },
              { id: 'preset', label: 'Blueprints' },
              { id: 'custom', label: 'Meus Projetos' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <label htmlFor="gallery-search" className="sr-only">
            Buscar temas
          </label>
          <input
            id="gallery-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, slug ou autor..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Themes Grid */}
      {filteredProjects.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <p className="text-base font-medium text-slate-300">
            Nenhum tema encontrado para esse filtro.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Limpe a busca ou crie um novo tema futurístico a partir de uma paleta.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setSearch('');
            }}
            className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            Mostrar todos os temas
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const isBase = project.sourceType === 'base';
            const isActive = project.id === activeProjectId;
            const c = project.config.colors;

            return (
              <article
                key={project.id}
                className={`flex flex-col justify-between rounded-xl border bg-[#111622] transition-colors ${
                  isActive ? 'border-cyan-500/60' : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Live Miniature Visual Preview */}
                  <div
                    className="relative h-36 overflow-hidden rounded-t-xl border-b border-slate-800/80 p-4 flex flex-col items-center justify-center"
                    style={{
                      background: `radial-gradient(ellipse at top, ${c.backgroundSecondary} 0%, ${c.backgroundPrimary} 100%)`,
                    }}
                  >
                    <div
                      className="h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs font-bold mb-2"
                      style={{
                        borderColor: c.buttonBorder,
                        backgroundColor: c.buttonBg,
                        color: c.accentPrimary,
                        boxShadow: `0 0 14px ${c.accentPrimary}55`,
                      }}
                    >
                      {project.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="w-44 space-y-1.5">
                      <div
                        className="h-5 w-full flex items-center justify-center text-[10px] font-semibold"
                        style={{
                          backgroundColor: c.buttonBg,
                          border: `1px solid ${c.buttonBorder}`,
                          color: c.buttonText,
                          borderRadius: `${Math.min(project.config.buttons.borderRadiusPx, 12)}px`,
                        }}
                      >
                        Link Principal
                      </div>
                      <div
                        className="h-4 w-4/5 mx-auto opacity-80"
                        style={{
                          backgroundColor: c.buttonBg,
                          border: `1px solid ${c.accentSecondary}`,
                          borderRadius: `${Math.min(project.config.buttons.borderRadiusPx, 12)}px`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Info Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      {renamingId === project.id ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <label htmlFor={`rename-${project.id}`} className="sr-only">
                            Novo nome do tema
                          </label>
                          <input
                            id={`rename-${project.id}`}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') submitRename(project.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            autoFocus
                            className="w-full rounded-md border border-cyan-500/60 bg-slate-950 px-2.5 py-1 text-sm text-slate-100 focus:outline-none"
                          />
                          <button
                            type="button"
                            aria-label="Confirmar nome"
                            onClick={() => submitRename(project.id)}
                            className="rounded-md bg-cyan-500 p-1.5 text-slate-950 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Cancelar renomeação"
                            onClick={() => setRenamingId(null)}
                            className="rounded-md bg-slate-800 p-1.5 text-slate-300 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h2 className="font-display text-base font-semibold text-slate-100 truncate">
                          {project.name}
                        </h2>
                      )}
                    </div>

                    {/* Unboxed clean typographic metadata (no pill clutter) */}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-mono tabular-nums">
                      <span>{project.slug}/</span>
                      <span aria-hidden="true">·</span>
                      <span>v{project.version}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.license}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {isBase
                          ? 'Base Protegida'
                          : project.sourceType === 'imported'
                          ? 'Importado ZIP'
                          : project.sourceType === 'preset'
                          ? 'Blueprint'
                          : 'Editável'}
                      </span>
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-400 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      isBase ? onDuplicateProject(project, false) : onSelectAndEdit(project)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/25 cursor-pointer whitespace-nowrap"
                  >
                    {isBase ? (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Duplicar &amp; Personalizar</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{isActive ? 'Continuar Editando' : 'Abrir no Editor'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    {!isBase && (
                      <>
                        <button
                          type="button"
                          title="Duplicar tema"
                          aria-label={`Duplicar ${project.name}`}
                          onClick={() => onDuplicateProject(project, false)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Criar nova versão"
                          aria-label={`Criar nova versão de ${project.name}`}
                          onClick={() => onDuplicateProject(project, true)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
                        >
                          <GitBranch className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Renomear tema"
                          aria-label={`Renomear ${project.name}`}
                          onClick={() => startRename(project)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        {confirmDeleteId === project.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteProject(project.id);
                              setConfirmDeleteId(null);
                            }}
                            className="rounded-md bg-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/30 cursor-pointer"
                          >
                            Confirmar
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Excluir projeto"
                            aria-label={`Excluir ${project.name}`}
                            onClick={() => setConfirmDeleteId(project.id)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

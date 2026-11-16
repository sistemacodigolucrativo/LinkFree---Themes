import { useCallback, useEffect, useState } from 'react';
import { Eye, Sliders } from 'lucide-react';
import { AuditDocsView } from './components/AuditDocsView';
import { ExportZipModal } from './components/ExportZipModal';
import { FullscreenTemplateSimulator } from './components/FullscreenTemplateSimulator';
import { ImportZipModal } from './components/ImportZipModal';
import { LinkStackSimulator } from './components/LinkStackSimulator';
import { ThemeGallery } from './components/ThemeGallery';
import { TopBar, type StudioTab } from './components/TopBar';
import { VisualEditor } from './components/VisualEditor';
import { sanitizeSlug } from './core/linkstackGenerator';
import { createDefaultThemeConfig, createStarterPresets } from './core/palettes';
import type { BaseThemeSummary, ThemeProject } from './core/types';

const LS_ACTIVE_ID_KEY = 'ls_studio_active_project_id';
const LS_ACTIVE_TAB_KEY = 'ls_studio_active_tab';

export default function App() {
  const [projects, setProjects] = useState<ThemeProject[]>(() => createStarterPresets());
  const [baseThemes, setBaseThemes] = useState<BaseThemeSummary[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem(LS_ACTIVE_ID_KEY) || 'preset-cyber-horizon';
  });
  const [activeTab, setActiveTab] = useState<StudioTab>(() => {
    const saved = localStorage.getItem(LS_ACTIVE_TAB_KEY) as StudioTab | null;
    if (saved === 'gallery' || saved === 'editor' || saved === 'docs') return saved;
    return 'gallery';
  });

  const [mobilePane, setMobilePane] = useState<'simulator' | 'editor'>('editor');
  const [simulatorFullscreen, setSimulatorFullscreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('simulator') === '1';
  });
  const [undoStack, setUndoStack] = useState<ThemeProject[]>([]);
  const [redoStack, setRedoStack] = useState<ThemeProject[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  // Load persisted projects & audited base themes from backend
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
          setActiveProjectId((curr) => {
            const exists = data.projects.some((p: ThemeProject) => p.id === curr);
            if (exists) return curr;
            const editable = data.projects.find((p: ThemeProject) => p.sourceType !== 'base');
            return editable ? editable.id : data.projects[0].id;
          });
        }
      })
      .catch(() => {
        // Fallback to starter presets already initialized
      });

    fetch('/api/themes/base')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.baseThemes)) {
          setBaseThemes(data.baseThemes);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_ACTIVE_ID_KEY, activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem(LS_ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) ??
    projects.find((p) => p.sourceType !== 'base') ??
    projects[0];

  const persistProjectToServer = async (project: ThemeProject) => {
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.projects)) {
          setProjects(json.projects);
        }
        setDirtyIds((d) => ({ ...d, [project.id]: false }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAndEdit = (project: ThemeProject) => {
    setActiveProjectId(project.id);
    setUndoStack([]);
    setRedoStack([]);
    setMobilePane('editor');
    setActiveTab('editor');
  };

  const handleOpenSimulator = (project?: ThemeProject) => {
    if (project) {
      setActiveProjectId(project.id);
    }
    setSimulatorFullscreen(true);
  };

  const handleSelectTab = (tab: StudioTab) => {
    if (tab === 'simulator') {
      setSimulatorFullscreen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleDuplicateProject = async (source: ThemeProject, asNewVersion = false) => {
    const suffix = asNewVersion
      ? `v${(parseFloat(source.version || '1.0') + 0.1).toFixed(1)}`
      : 'Custom';
    const newName = asNewVersion ? `${source.name} (${suffix})` : `${source.name.replace(' (Base Auditada)', '')} Studio`;
    const newSlug = sanitizeSlug(`${source.slug}${asNewVersion ? `_${suffix}` : 'Studio'}_${Date.now().toString().slice(-3)}`);
    const nextVersion = asNewVersion
      ? (parseFloat(source.version || '1.0') + 0.1).toFixed(1)
      : '1.0';

    const cloned: ThemeProject = {
      ...structuredClone(source),
      id: `proj-${Date.now()}`,
      name: newName,
      slug: newSlug,
      version: nextVersion,
      date: new Date().toISOString().slice(0, 10),
      sourceType: 'custom',
      baseThemeSlug: source.baseThemeSlug || source.slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editCount: 0,
    };

    setProjects((prev) => [cloned, ...prev]);
    setActiveProjectId(cloned.id);
    setUndoStack([]);
    setRedoStack([]);
    setActiveTab('editor');
    await persistProjectToServer(cloned);
    showNotice(`Cópia independente "${cloned.name}" criada no workspace isolado.`);
  };

  const handleCreateBlankFuturistic = async () => {
    const num = projects.length + 1;
    const created: ThemeProject = {
      id: `proj-${Date.now()}`,
      slug: `FutureTheme${num}`,
      name: `Futuristic Theme ${num}`,
      version: '1.0',
      date: new Date().toISOString().slice(0, 10),
      author: 'LinkStack Theme Studio',
      authorUri: 'https://linkstack.org',
      license: 'MIT',
      sourceType: 'custom',
      baseThemeSlug: 'PolySleek',
      description: 'Novo tema futurístico criado no Theme Studio.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editCount: 0,
      config: createDefaultThemeConfig('cyberpunk'),
      preservedAssets: [],
      importWarnings: [],
    };
    setProjects((prev) => [created, ...prev]);
    setActiveProjectId(created.id);
    setUndoStack([]);
    setRedoStack([]);
    setActiveTab('editor');
    await persistProjectToServer(created);
    showNotice(`Novo tema "${created.name}" criado.`);
  };

  const handleRenameProject = async (id: string, newName: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const updated: ThemeProject = {
      ...target,
      name: newName,
      slug: sanitizeSlug(newName),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    await persistProjectToServer(updated);
    showNotice(`Tema renomeado para "${newName}".`);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        setProjects(json.projects);
        if (activeProjectId === id && json.projects.length > 0) {
          setActiveProjectId(json.projects[0].id);
        }
        showNotice('Projeto removido do workspace.');
      }
    } catch {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleUpdateActiveProject = (updater: (prev: ThemeProject) => ThemeProject) => {
    if (!activeProject) return;
    // Prevent mutating protected base theme directly; auto-fork if edited
    if (activeProject.sourceType === 'base') {
      void handleDuplicateProject(activeProject, false);
      return;
    }

    setUndoStack((s) => [...s.slice(-24), structuredClone(activeProject)]);
    setRedoStack([]);

    const updated = updater(activeProject);
    updated.updatedAt = new Date().toISOString();

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
    setDirtyIds((d) => ({ ...d, [activeProject.id]: true }));
  };

  // Debounced auto-save so edits persist seamlessly across reloads
  useEffect(() => {
    if (!activeProject || !dirtyIds[activeProject.id]) return;
    const timer = setTimeout(() => {
      void persistProjectToServer(activeProject);
    }, 900);
    return () => clearTimeout(timer);
  }, [activeProject, dirtyIds]);

  const handleUndo = () => {
    if (undoStack.length === 0 || !activeProject) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, structuredClone(activeProject)]);
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? previous : p)));
    setDirtyIds((d) => ({ ...d, [activeProject.id]: true }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !activeProject) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, -1));
    setUndoStack((s) => [...s, structuredClone(activeProject)]);
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? next : p)));
    setDirtyIds((d) => ({ ...d, [activeProject.id]: true }));
  };

  const handleReset = () => {
    if (!activeProject) return;
    handleUpdateActiveProject((prev) => ({
      ...prev,
      config: createDefaultThemeConfig(prev.config.paletteId === 'custom' ? 'electric-blue' : prev.config.paletteId),
    }));
    showNotice('Parâmetros visuais restaurados para o padrão da paleta.');
  };

  const handleSaveNow = async () => {
    if (!activeProject) return;
    await persistProjectToServer(activeProject);
    showNotice(`Tema "${activeProject.name}" salvo no workspace isolado.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-slate-100">
      <TopBar
        activeTab={simulatorFullscreen ? 'simulator' : activeTab}
        onSelectTab={handleSelectTab}
        onOpenExport={() => setExportOpen(true)}
        activeProjectName={activeProject?.name}
      />

      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-40 rounded-lg border border-cyan-500/40 bg-[#111622] px-4 py-2.5 text-xs font-medium text-cyan-200 shadow-xl"
        >
          {notice}
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {activeTab === 'gallery' && (
          <ThemeGallery
            projects={projects}
            baseThemes={baseThemes}
            activeProjectId={activeProject?.id || ''}
            onSelectAndEdit={handleSelectAndEdit}
            onSimulateProject={handleOpenSimulator}
            onDuplicateProject={handleDuplicateProject}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
            onOpenImportModal={() => setImportOpen(true)}
            onCreateBlankFuturistic={handleCreateBlankFuturistic}
          />
        )}

        {activeTab === 'editor' && activeProject && (
          <div className="flex-1 flex flex-col">
            {/* Mobile Pane Switcher (Simulador vs Editor) */}
            <div className="flex lg:hidden border-b border-slate-800 bg-[#0D111A] p-2 gap-2">
              <button
                type="button"
                onClick={() => setSimulatorFullscreen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold cursor-pointer bg-slate-900 text-slate-200 hover:bg-cyan-500/15 hover:text-cyan-300"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Simulador</span>
              </button>
              <button
                type="button"
                onClick={() => setMobilePane('editor')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold cursor-pointer ${
                  mobilePane === 'editor'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Editor Visual</span>
              </button>
            </div>

            {activeProject.sourceType === 'base' && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
                <span>
                  Você está visualizando o tema-base protegido <strong>{activeProject.name}</strong>. Crie uma cópia independente para personalizar.
                </span>
                <button
                  type="button"
                  onClick={() => handleDuplicateProject(activeProject, false)}
                  className="rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-amber-300 cursor-pointer"
                >
                  Duplicar para Editar
                </button>
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_430px] lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
              <div className="hidden lg:flex flex-col min-w-0 lg:overflow-hidden">
                <LinkStackSimulator
                  project={activeProject}
                  onOpenFullscreen={() => setSimulatorFullscreen(true)}
                />
              </div>

              <div
                className={`${
                  mobilePane === 'editor' ? 'flex' : 'hidden'
                } lg:flex flex-col min-w-0 lg:overflow-hidden`}
              >
                <VisualEditor
                  project={activeProject}
                  canUndo={undoStack.length > 0}
                  canRedo={redoStack.length > 0}
                  isDirty={Boolean(dirtyIds[activeProject.id])}
                  saving={saving}
                  onUpdateProject={handleUpdateActiveProject}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onReset={handleReset}
                  onSave={handleSaveNow}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && <AuditDocsView baseThemes={baseThemes} />}
      </main>

      <ImportZipModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(imported, all) => {
          setProjects(all);
          setActiveProjectId(imported.id);
          setActiveTab('editor');
          showNotice(`Tema "${imported.name}" importado em workspace isolado.`);
        }}
      />

      {activeProject && (
        <ExportZipModal
          open={exportOpen}
          project={activeProject}
          onClose={() => setExportOpen(false)}
        />
      )}

      {simulatorFullscreen && activeProject && (
        <FullscreenTemplateSimulator
          projects={projects}
          activeProjectId={activeProject.id}
          onSelectProjectId={(id) => {
            setActiveProjectId(id);
            setUndoStack([]);
            setRedoStack([]);
          }}
          onBack={() => setSimulatorFullscreen(false)}
        />
      )}
    </div>
  );
}

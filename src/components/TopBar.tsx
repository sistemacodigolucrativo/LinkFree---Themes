import { Download, Layers } from 'lucide-react';

export type StudioTab = 'gallery' | 'editor' | 'simulator' | 'docs';

interface TopBarProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  onOpenExport: () => void;
  activeProjectName?: string;
}

export function TopBar({ activeTab, onSelectTab, onOpenExport }: TopBarProps) {
  const navItems: { id: StudioTab; label: string }[] = [
    { id: 'gallery', label: 'Galeria' },
    { id: 'editor', label: 'Estúdio Visual' },
    { id: 'simulator', label: 'Simulador' },
    { id: 'docs', label: 'Auditoria & Docs' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#0A0D14]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Layers className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            LinkStack Theme Studio
          </span>
        </div>

        {/* Zone 2: Single-line navigation links */}
        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm ${
                  active ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenExport}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Exportar ZIP</span>
          </button>
        </div>
      </div>

      {/* Mobile compact secondary nav row */}
      <nav
        aria-label="Navegação móvel"
        className="flex md:hidden border-t border-slate-800/80 px-3 py-1.5 gap-1 overflow-x-auto"
      >
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

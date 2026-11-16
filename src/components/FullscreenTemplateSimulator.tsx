import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { evaluateHorizontalSwipe, stepProjectIndex } from '../core/swipeNavigation';
import type { ThemeProject } from '../core/types';
import { LinkStackTemplateView } from './LinkStackTemplateView';

interface FullscreenTemplateSimulatorProps {
  projects: ThemeProject[];
  activeProjectId: string;
  onSelectProjectId: (id: string) => void;
  onBack: () => void;
}

export function FullscreenTemplateSimulator({
  projects,
  activeProjectId,
  onSelectProjectId,
  onBack,
}: FullscreenTemplateSimulatorProps) {
  const [dragX, setDragX] = useState(0);
  const [slideAnim, setSlideAnim] = useState<'none' | 'from-right' | 'from-left'>('none');

  const gestureRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    startTime: number;
    swiping: boolean;
    cancelledForVertical: boolean;
    suppressNextClick: boolean;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    swiping: false,
    cancelledForVertical: false,
    suppressNextClick: false,
  });

  const currentIndex = Math.max(
    0,
    projects.findIndex((p) => p.id === activeProjectId),
  );
  const activeProject = projects[currentIndex] ?? projects[0];

  const navigateStep = (delta: -1 | 1) => {
    if (projects.length <= 1) return;
    const nextIdx = stepProjectIndex(currentIndex, projects.length, delta);
    const nextProj = projects[nextIdx];
    if (!nextProj) return;
    setSlideAnim(delta > 0 ? 'from-right' : 'from-left');
    onSelectProjectId(nextProj.id);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 'ArrowRight') {
        navigateStep(1);
      } else if (e.key === 'ArrowLeft') {
        navigateStep(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  useEffect(() => {
    if (slideAnim === 'none') return;
    const t = setTimeout(() => setSlideAnim('none'), 240);
    return () => clearTimeout(t);
  }, [slideAnim]);

  if (!activeProject) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-sim-back="true"]')) return;

    gestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      swiping: false,
      cancelledForVertical: false,
      suppressNextClick: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (g.pointerId !== e.pointerId || g.cancelledForVertical) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (!g.swiping) {
      if (Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx)) {
        g.cancelledForVertical = true;
        return;
      }
      if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        g.swiping = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Ignore if synthetic event has no active pointer
        }
        setDragX(dx);
      }
    } else {
      setDragX(dx);
    }
  };

  const finishPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (g.pointerId !== e.pointerId) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    const elapsed = performance.now() - g.startTime;
    const wasSwiping = g.swiping;

    if (wasSwiping) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
    }

    g.pointerId = null;
    g.swiping = false;
    g.cancelledForVertical = false;
    setDragX(0);

    const decision = evaluateHorizontalSwipe(dx, dy, elapsed);
    if (decision) {
      g.suppressNextClick = true;
      setTimeout(() => {
        gestureRef.current.suppressNextClick = false;
      }, 80);
      navigateStep(decision === 'next' ? 1 : -1);
    } else if (wasSwiping) {
      g.suppressNextClick = true;
      setTimeout(() => {
        gestureRef.current.suppressNextClick = false;
      }, 80);
    }
  };

  return (
    <div
      data-testid="fullscreen-simulator"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onClickCapture={(e) => {
        if (gestureRef.current.suppressNextClick) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      style={{ touchAction: 'pan-y' }}
      className="fixed inset-0 z-50 h-[100dvh] w-screen overflow-hidden bg-[#07090F] select-none"
    >
      <style>{`
        @keyframes simSlideInRight { from { opacity: 0.35; transform: translateX(36px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes simSlideInLeft { from { opacity: 0.35; transform: translateX(-36px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* Only a compact Back button at the top */}
      <button
        type="button"
        data-sim-back="true"
        onClick={onBack}
        aria-label="Voltar"
        className="fixed top-3 left-3 z-40 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/45 px-2.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md shadow-lg transition-colors hover:bg-black/70 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Voltar</span>
      </button>

      {/* Fullscreen Template Stage (no toolbars, no device frame, swipeable sideways) */}
      <div
        className={`h-full w-full ${
          slideAnim === 'from-right'
            ? 'animate-[simSlideInRight_0.22s_ease-out]'
            : slideAnim === 'from-left'
            ? 'animate-[simSlideInLeft_0.22s_ease-out]'
            : ''
        }`}
        style={{
          transform: dragX !== 0 ? `translateX(${Math.round(dragX * 0.35)}px)` : undefined,
          transition: dragX !== 0 ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <LinkStackTemplateView
          project={activeProject}
          testId="fullscreen-template-view"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

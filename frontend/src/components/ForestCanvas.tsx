import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Gamepad2, Camera } from 'lucide-react';
import { PixelRenderer } from '../renderer/PixelRenderer';

export const ForestCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState<'2d' | 'initializing'>('initializing');
  const rendererRef = useRef<PixelRenderer | null>(null);

  const { books, trees, decorations, timeOfDay, weather, viewingSocialForest, biome, moveTree, moveDecoration, pendingPlacement, placeDecorationAt, cancelPlacement } = useApp();

  // Only the user's own garden is editable (no rearranging a friend's forest)
  const editable = !viewingSocialForest;

  // Capture the current garden frame and download it as a shareable PNG card.
  const handleShare = () => {
    const r = rendererRef.current;
    if (!r) return;
    const url = r.captureDataURL();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `read-forest-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Determine trees data to show (either user's own forest or visited friend's forest)
  const activeTrees = viewingSocialForest
    ? viewingSocialForest.trees.map((t, i) => ({
        id: `social-tree-${i}`,
        bookId: `social-b-${i}`,
        type: t.type,
        growth: t.growth,
        vitality: t.vitality,
        x: t.x,
        z: t.z,
        plantedAt: new Date().toISOString()
      }))
    : trees;

  const activeDecorations = viewingSocialForest ? [] : decorations;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const renderer = new PixelRenderer(container, rect.width, rect.height);
    rendererRef.current = renderer;
    renderer.updateData(activeTrees, activeDecorations, timeOfDay, weather, biome, editable, moveTree, moveDecoration);
    renderer.init().then(() => setRenderMode('2d'));

    // Resize observer for responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width, height } = entry.contentRect;

      if (rendererRef.current) {
        rendererRef.current.resize(width, height);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []);

  // Update renderer data on changes
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateData(activeTrees, activeDecorations, timeOfDay, weather, biome, editable, moveTree, moveDecoration);
    }
  }, [books, trees, decorations, timeOfDay, weather, viewingSocialForest, biome, editable, moveTree, moveDecoration]);

  // Drive manual placement mode (ghost decoration follows the cursor).
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPlacement(pendingPlacement, placeDecorationAt, cancelPlacement);
    }
  }, [pendingPlacement, placeDecorationAt, cancelPlacement]);

  return (
    <div ref={containerRef} className="canvas-viewport" style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* Renderer Mode Indicator Badge */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '6px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#fff',
          zIndex: 100,
          border: '2px solid var(--wood-dark)',
          pointerEvents: 'auto',
          background: 'var(--wood-panel)'
        }}
      >
        <Gamepad2 size={14} color="var(--gold-highlight)" />
        <span style={{ textShadow: '1px 1px 0 var(--wood-dark)' }}>
          {renderMode === '2d' && '2D 픽셀 정원'}
          {renderMode === 'initializing' && '정원 불러오는 중...'}
        </span>
      </div>

      {/* Share / screenshot button */}
      {renderMode === '2d' && (
        <button
          className="glass-panel"
          onClick={handleShare}
          style={{
            position: 'absolute',
            top: '64px',
            right: '24px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#fff',
            zIndex: 100,
            border: '2px solid var(--wood-dark)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            background: 'var(--wood-panel)',
            textShadow: '1px 1px 0 var(--wood-dark)'
          }}
          title="정원 스크린샷을 PNG로 저장하기"
        >
          <Camera size={14} color="var(--gold-highlight)" />
          <span>정원 공유</span>
        </button>
      )}

      {/* Placement mode banner */}
      {pendingPlacement && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#fff',
            zIndex: 120,
            pointerEvents: 'auto',
            border: '3px solid var(--gold-border)',
            background: 'var(--wood-panel)',
            textShadow: '1px 1px 0 var(--wood-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span>🪴 원하는 자리를 클릭해 배치하세요</span>
          <button
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
            onClick={() => cancelPlacement()}
          >
            취소 (Esc)
          </button>
        </div>
      )}

      {/* Floating Instructions for Camera controls */}
      {renderMode === '2d' && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-light)',
            zIndex: 100,
            pointerEvents: 'auto',
            border: '2px solid var(--wood-dark)',
            background: 'var(--wood-panel)',
            textShadow: '1px 1px 0 var(--wood-dark)'
          }}
        >
          🖱️ 빈 땅 드래그: 정원 이동 | 🌳 사물 드래그: 위치 옮기기 | 📜 휠: 줌
        </div>
      )}
    </div>
  );
};

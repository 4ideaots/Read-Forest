import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Book, Genre } from '../types';
import { getBiomeAt, getTreeLabel } from '../utils/biome';
import { BookOpen, Trash2, Flame, HeartPulse, ChevronDown, ChevronUp, Plus, Award } from 'lucide-react';
import { playClick } from '../utils/audio';

interface SidebarProps {
  onOpenSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearch }) => {
  const { 
    books, 
    trees,
    user, 
    updateBookProgress, 
    deleteBook,
    viewingSocialForest,
    setViewingSocialForest,
    waterFriendForest
  } = useApp();

  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [currentPageInput, setCurrentPageInput] = useState<number>(0);

  // XP Progress Percentage
  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  const handleToggleExpand = (book: Book) => {
    playClick();
    if (expandedBookId === book.id) {
      setExpandedBookId(null);
    } else {
      setExpandedBookId(book.id);
      setCurrentPageInput(book.currentPage);
    }
  };

  const handlePageUpdateSubmit = (book: Book, e: React.FormEvent) => {
    e.preventDefault();
    updateBookProgress(book.id, currentPageInput);
  };

  const getHearts = (vitality: number) => {
    const total = 5;
    const filled = Math.round((vitality / 100) * total);
    let hearts = '';
    for (let i = 0; i < filled; i++) hearts += '❤️';
    for (let i = filled; i < total; i++) hearts += '🖤';
    return hearts;
  };

  const getVitalityBadgeDesc = (vitality: number) => {
    if (vitality >= 80) return '나무가 매우 건강하고 싱그럽습니다!';
    if (vitality >= 50) return '물(독서)이 필요합니다. 조금 시들었습니다.';
    if (vitality > 0) return '심각하게 시든 상태입니다! 얼른 물을 주세요!';
    return '앙상한 나무 밑동만 남았습니다. 복구 독서가 필요합니다!';
  };

  const getGenreKorean = (genre: Genre) => {
    const maps: Record<Genre, string> = {
      novel: '🌸 문학/소설',
      science: '🌲 과학/IT',
      humanities: '🌳 인문/역사',
      business: '🍁 경제/경영',
      other: '🪵 기타'
    };
    return maps[genre];
  };



  return (
    <div className="left-sidebar ui-element">
      {/* User Profile Wooden Sign Card */}
      <div className="glass-panel" style={{ padding: '16px 20px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-light)', textShadow: '2px 2px 0 var(--wood-dark)' }}>{user.name}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--wood-inner)', fontWeight: 600, textShadow: '1px 1px 0 var(--wood-dark)' }}>레벨 {user.level} 숙련 농부</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--wood-dark)', border: '2px solid var(--gold-border)', padding: '4px 8px', borderRadius: '4px', color: 'var(--accent-gold)', fontWeight: 600 }}>
            <Flame size={14} fill="var(--accent-gold)" />
            <span style={{ fontSize: '0.78rem' }}>{user.streak}일차</span>
          </div>
        </div>

        {/* XP Progress bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)', marginBottom: '4px', fontWeight: 600 }}>
            <span>지식 경험치 (XP)</span>
            <span>{user.xp}/{user.xpToNextLevel}</span>
          </div>
          <div className="pixel-progress-container">
            <div className="pixel-progress-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        {/* Points Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--wood-dark)', border: '2px solid var(--gold-border)', padding: '8px 12px', borderRadius: '4px', color: 'var(--gold-highlight)', fontWeight: 600, fontSize: '0.85rem' }}>
          <Award size={16} />
          <span>{user.points} 골드 (GP)</span>
        </div>
      </div>

      {/* Social Visitor Banner */}
      {viewingSocialForest && (
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(9,132,227,0.25)', borderColor: 'var(--accent-blue)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', textShadow: '1px 1px 0 var(--wood-dark)' }}>
              🌐 {viewingSocialForest.userName} 님의 농장 방문 중
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)' }}>
              호칭: {viewingSocialForest.userTitle} | 농작물: {viewingSocialForest.treeCount}그루
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button
                className="btn-primary"
                style={{ fontSize: '0.75rem', padding: '6px 12px', flex: 1, background: 'var(--accent-blue)' }}
                onClick={() => { playClick(); waterFriendForest(); }}
              >
                💧 물주기 (+10G)
              </button>
              <button
                className="btn-primary"
                style={{ fontSize: '0.75rem', padding: '6px 12px', flex: 1 }}
                onClick={() => { playClick(); setViewingSocialForest(null); }}
              >
                내 농장으로
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books Tracker Section */}
      <div className="glass-panel" style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', textShadow: '1.5px 1.5px 0 var(--wood-dark)' }}>농작물 도감 ({books.length})</h3>
          {!viewingSocialForest && (
            <button 
              className="btn-primary" 
              style={{ padding: '6px 12px', fontSize: '0.75rem' }} 
              onClick={() => { playClick(); onOpenSearch(); }}
            >
              <Plus size={14} />
              <span>새 작물 심기</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '42vh' }}>
          {books.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)', fontSize: '0.85rem' }}>
              심어놓은 작물이 없습니다.<br />씨앗을 등록하여 농장을 시작하세요!
            </div>
          ) : (
            books.map((book) => {
              const expanded = expandedBookId === book.id;
              const hearts = getHearts(book.vitality);
              const matchTree = trees.find((t) => t.bookId === book.id);
              const localBiome = matchTree ? getBiomeAt(matchTree.x, matchTree.z) : 'spring';

              return (
                <div 
                  key={book.id} 
                  className="glass-card" 
                  style={{
                    borderLeft: `5px solid ${book.status === 'completed' ? 'var(--accent-pink)' : 'var(--primary-green)'}`,
                    opacity: viewingSocialForest ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      style={{ width: '45px', height: '62px', borderRadius: '4px', border: '2px solid var(--wood-dark)', objectFit: 'cover', background: 'rgba(255,255,255,0.05)' }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={book.title}>
                          {book.title}
                        </h4>
                        {!viewingSocialForest && (
                          <button 
                            onClick={() => { playClick(); deleteBook(book.id); }} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                            title="작물 삭제"
                          >
                            <Trash2 size={13} className="hover-red" />
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{book.author}</p>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', padding: '1px 5px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--wood-dark)', borderRadius: '3px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {getGenreKorean(book.genre)}
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '1px 5px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--wood-dark)', borderRadius: '3px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {getTreeLabel(book.genre, localBiome)}
                        </span>
                        <span 
                          style={{ fontSize: '0.72rem', cursor: 'help' }}
                          title={getVitalityBadgeDesc(book.vitality)}
                        >
                          {hearts}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 600 }}>
                      <span>성장도 {book.progress}%</span>
                      <span>{book.currentPage} / {book.totalPages}p</span>
                    </div>
                    <div className="pixel-progress-container" style={{ height: '10px' }}>
                      <div 
                        className={`pixel-progress-fill ${book.status === 'completed' ? 'pixel-progress-fill-pink' : ''}`} 
                        style={{ width: `${book.progress}%` }} 
                      />
                    </div>
                  </div>

                  {/* Expand button */}
                  {!viewingSocialForest && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                      <button 
                        onClick={() => handleToggleExpand(book)}
                        style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {expanded ? (
                          <><span>일지 접기</span><ChevronUp size={12} /></>
                        ) : (
                          <><span>일지 작성</span><ChevronDown size={12} /></>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Expanded progress edit form */}
                  {expanded && !viewingSocialForest && (
                    <form onSubmit={(e) => handlePageUpdateSubmit(book, e)} style={{ marginTop: '10px', borderTop: '2px dashed var(--wood-medium)', paddingTop: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>현재 페이지</label>
                          <input 
                            type="number" 
                            min={0}
                            max={book.totalPages}
                            value={currentPageInput}
                            onChange={(e) => setCurrentPageInput(Math.min(book.totalPages, parseInt(e.target.value) || 0))}
                            className="input-field"
                            style={{ width: '65px', padding: '3px 6px', textAlign: 'center', fontSize: '0.8rem' }}
                          />
                        </div>
                        
                        {/* Page Slider */}
                        <input 
                          type="range"
                          min={0}
                          max={book.totalPages}
                          value={currentPageInput}
                          onChange={(e) => setCurrentPageInput(parseInt(e.target.value))}
                          style={{ accentColor: 'var(--primary-green)', cursor: 'pointer', height: '6px' }}
                        />

                        {book.vitality < 50 && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(207,106,23,0.1)', border: '1px solid var(--accent-orange)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--accent-orange)', fontWeight: 600 }}>
                            <HeartPulse size={12} className="pulse-glowing" />
                            <span>작물에 물을 주어 생기를 살려냅니다! (심폐소생)</span>
                          </div>
                        )}

                        <button 
                          type="submit" 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', justifyContent: 'center' }}
                          onClick={playClick}
                        >
                          <BookOpen size={12} />
                          <span>작물에 물주기 (일지 기록)</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

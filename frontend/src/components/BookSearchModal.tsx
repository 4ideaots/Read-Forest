import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { searchBooks } from '../api/books';
import type { ApiBook } from '../api/types';
import type { Genre } from '../types';
import { X, Search, Plus, BookOpen, Loader2 } from 'lucide-react';
import { playClick } from '../utils/audio';

interface BookSearchModalProps {
  onClose: () => void;
}

const MOCK_CATALOG = [
  { title: '코스모스', author: '칼 세이건', genre: 'science' as Genre, pages: 715 },
  { title: '총, 균, 쇠', author: '재레드 다이아몬드', genre: 'humanities' as Genre, pages: 752 },
  { title: '해리 포터와 마법사의 돌', author: 'J.K. 롤링', genre: 'novel' as Genre, pages: 344 },
  { title: '부의 시나리오', author: '오건영', genre: 'business' as Genre, pages: 395 },
  { title: '데미안', author: '헤르만 헤세', genre: 'novel' as Genre, pages: 248 },
  { title: '클린 코드', author: '로버트 C. 마틴', genre: 'science' as Genre, pages: 580 },
  { title: '사피엔스', author: '유발 하라리', genre: 'humanities' as Genre, pages: 630 },
  { title: '트렌드 코리아 2026', author: '김난도', genre: 'business' as Genre, pages: 420 }
];

export const BookSearchModal: React.FC<BookSearchModalProps> = ({ onClose }) => {
  const { addBook } = useApp();
  const { isAuthed } = useAuth();

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Real (backend) search state
  const [apiResults, setApiResults] = useState<ApiBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Custom manual inputs
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<Genre>('novel');
  const [totalPages, setTotalPages] = useState<number>(300);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);

  // Debounced backend search (only when logged in — the endpoint requires auth).
  useEffect(() => {
    if (!isAuthed) {
      setApiResults([]);
      setSearchError(null);
      return;
    }
    const q = searchQuery.trim();
    if (q.length < 2) {
      setApiResults([]);
      setSearchError(null);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    setSearchError(null);
    const handle = setTimeout(async () => {
      try {
        const res = await searchBooks(q, 1, 10);
        if (!cancelled) setApiResults(res.books);
      } catch (err) {
        if (!cancelled) {
          setApiResults([]);
          setSearchError(err instanceof Error ? err.message : '검색에 실패했습니다.');
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [searchQuery, isAuthed]);

  const filteredCatalog = MOCK_CATALOG.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMock = (selected: typeof MOCK_CATALOG[0]) => {
    playClick();
    addBook(selected.title, selected.author, selected.genre, selected.pages);
    onClose();
  };

  // A real search result has no genre/page count, so prefill the manual form
  // and let the user confirm those before planting.
  const handleSelectApiBook = (book: ApiBook) => {
    playClick();
    setTitle(book.title);
    setAuthor(book.author || '');
    setCoverUrl(book.coverImageUrl || undefined);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;
    playClick();
    addBook(title, author, genre, totalPages, coverUrl);
    onClose();
  };

  const handleClose = () => {
    playClick();
    onClose();
  };

  const getGenreColor = (g: Genre) => {
    const maps: Record<Genre, string> = {
      novel: '#cf5a8a',
      science: '#2b630f',
      humanities: '#8c591e',
      business: '#b54b1a',
      other: '#4c6e5d'
    };
    return maps[g];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ background: 'var(--wood-panel)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', textShadow: '2px 2px 0 var(--wood-dark)' }}>
            <BookOpen size={20} color="var(--wood-inner)" />
            <span>새 씨앗 등록 (도서)</span>
          </h2>
          <button
            onClick={handleClose}
            className="btn-secondary"
            style={{ background: 'var(--wood-medium)', border: '2px solid var(--wood-dark)', color: 'var(--wood-inner)', cursor: 'pointer', padding: '6px', borderRadius: '4px', boxShadow: 'none' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search section */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textShadow: '1px 1px 0 var(--wood-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isAuthed ? '📚 카카오 도서 검색' : '🌾 Pelican 도서 카탈로그 검색'}
            {searching && <Loader2 size={14} className="spin" />}
          </h3>

          {!isAuthed && (
            <div style={{ fontSize: '0.7rem', color: 'var(--gold-highlight)', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--wood-dark)', borderRadius: '4px', padding: '6px 10px', marginBottom: '10px', fontWeight: 600 }}>
              🔑 로그인하면 실제 도서를 검색할 수 있어요. (지금은 샘플 카탈로그)
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder={isAuthed ? '도서명 또는 저자명으로 검색...' : '도서명 또는 저자명 입력...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingLeft: '40px', background: 'var(--wood-inner)' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {isAuthed ? (
              <>
                {searchError && (
                  <div style={{ fontSize: '0.72rem', color: '#ffb0b0', textAlign: 'center', padding: '10px' }}>
                    ⚠️ {searchError}
                  </div>
                )}
                {!searching && !searchError && searchQuery.trim().length >= 2 && apiResults.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--wood-inner)', fontSize: '0.75rem' }}>
                    검색 결과가 없습니다. 직접 등록을 이용해주세요!
                  </div>
                )}
                {searchQuery.trim().length < 2 && (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--wood-inner)', fontSize: '0.75rem' }}>
                    두 글자 이상 입력하면 도서를 검색합니다.
                  </div>
                )}
                {apiResults.map((b, idx) => (
                  <div
                    key={b.isbn || idx}
                    className="glass-card"
                    style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', border: '2px solid var(--wood-dark)' }}
                    onClick={() => handleSelectApiBook(b)}
                    title="클릭하면 아래 양식에 자동 입력됩니다"
                  >
                    {b.coverImageUrl ? (
                      <img src={b.coverImageUrl} alt={b.title} style={{ width: '34px', height: '48px', objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--wood-dark)' }} />
                    ) : (
                      <div style={{ width: '34px', height: '48px', borderRadius: '3px', background: 'var(--wood-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📖</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</h4>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.author || '저자 미상'}{b.publisher ? ` · ${b.publisher}` : ''}</p>
                    </div>
                    <Plus size={14} color="var(--primary-dark)" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {filteredCatalog.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--wood-inner)', fontSize: '0.75rem' }}>
                    검색 결과가 없습니다. 직접 등록을 이용해주세요!
                  </div>
                ) : (
                  filteredCatalog.map((b, idx) => (
                    <div
                      key={idx}
                      className="glass-card"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '2px solid var(--wood-dark)' }}
                      onClick={() => handleSelectMock(b)}
                    >
                      <div>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>{b.title}</h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.author} | {b.pages}p</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '3px', background: 'rgba(0,0,0,0.04)', color: getGenreColor(b.genre), border: `1.5px solid ${getGenreColor(b.genre)}`, fontWeight: 700 }}>
                          {b.genre === 'novel' ? '벚꽃 계열 🌸' : b.genre === 'science' ? '침엽수 계열 🌲' : b.genre === 'humanities' ? '참나무 계열 🌳' : b.genre === 'business' ? '단풍 계열 🍁' : '자작나무 계열 🪵'}
                        </span>
                        <Plus size={14} color="var(--primary-dark)" />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ borderTop: '2px dashed var(--wood-dark)', margin: '20px 0', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--wood-panel)', padding: '0 10px', fontSize: '0.75rem', color: 'var(--wood-inner)', fontWeight: 700, textShadow: '1px 1px 0 var(--wood-dark)' }}>
            {isAuthed ? '검색 결과를 선택하거나 직접 입력' : '또는 직접 씨앗 정보 입력'}
          </span>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {coverUrl && (
              <img src={coverUrl} alt="표지" style={{ width: '44px', height: '62px', objectFit: 'cover', borderRadius: '4px', border: '2px solid var(--wood-dark)' }} />
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--wood-inner)', fontWeight: 600, textShadow: '1px 1px 0 var(--wood-dark)' }}>도서 제목</label>
                <input type="text" required placeholder="예: 스타듀밸리 안내서" value={title}
                  onChange={(e) => setTitle(e.target.value)} className="input-field" style={{ background: 'var(--wood-inner)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--wood-inner)', fontWeight: 600, textShadow: '1px 1px 0 var(--wood-dark)' }}>저자명</label>
                <input type="text" required placeholder="예: 피에르" value={author}
                  onChange={(e) => setAuthor(e.target.value)} className="input-field" style={{ background: 'var(--wood-inner)' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--wood-inner)', fontWeight: 600, textShadow: '1px 1px 0 var(--wood-dark)' }}>장르 (나무 매칭)</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value as Genre)} className="input-field" style={{ background: 'var(--wood-inner)' }}>
                <option value="novel">소설 / 시 / 극 (벚꽃 계열 🌸)</option>
                <option value="science">IT / 과학 / 수학 (침엽수 계열 🌲)</option>
                <option value="humanities">인문 / 역사 / 철학 (참나무 계열 🌳)</option>
                <option value="business">경제 / 경영 / 자기계발 (단풍 계열 🍁)</option>
                <option value="other">기타 장르 (자작나무 계열 🪵)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--wood-inner)', fontWeight: 600, textShadow: '1px 1px 0 var(--wood-dark)' }}>총 페이지</label>
              <input type="number" min={10} max={5000} required value={totalPages}
                onChange={(e) => setTotalPages(parseInt(e.target.value) || 300)} className="input-field" style={{ background: 'var(--wood-inner)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '8px' }}>
            <span>씨앗 심기 (도서 등록)</span>
          </button>
        </form>
      </div>
    </div>
  );
};

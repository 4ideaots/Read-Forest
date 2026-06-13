import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { QuestBoard } from './components/QuestBoard';
import { ForestCanvas } from './components/ForestCanvas';
import { BookSearchModal } from './components/BookSearchModal';
import { AuthModal } from './components/AuthModal';
import { Sun, Moon, CloudRain, CloudSnow, RefreshCw, HelpCircle, Trees, LogIn, LogOut } from 'lucide-react';
import { playClick } from './utils/audio';

const AppContent: React.FC = () => {
  const {
    timeOfDay,
    setTimeOfDay,
    weather,
    setWeather,
    books,
    decorations,
    notice,
    dismissNotice,
    autoEnv,
    setAutoEnv
  } = useApp();

  const { isAuthed, nickname, username, logout } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // Auto-dismiss the toast after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(dismissNotice, 5000);
    return () => clearTimeout(id);
  }, [notice, dismissNotice]);

  // Helper stats
  const totalTrees = books.length;
  const completedTrees = books.filter((b) => b.status === 'completed').length;
  const activeTrees = books.filter((b) => b.status === 'reading').length;

  const handleResetData = () => {
    if (window.confirm('정원 기록을 초기화하시겠습니까? (초기 샘플 데이터로 복원됩니다.)')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="app-container">
      {/* 2D Pixel-art Garden Canvas (Stardew Valley style) */}
      <ForestCanvas />

      {/* Interactive UI Panels Overlay */}
      <div className="ui-overlay">
        {/* Header Panel */}
        <header className="header-panel glass-panel ui-element">
          <div className="header-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '6px', 
                background: 'var(--wood-dark)', 
                border: '2px solid var(--gold-border)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 0 rgba(0,0,0,0.3)'
              }}
            >
              <Trees size={24} color="var(--gold-highlight)" />
            </div>
            <div>
              <h1>리드 포레스트 <span style={{ fontSize: '0.9rem', color: 'var(--wood-inner)', fontWeight: 500 }}>Read Forest</span></h1>
              <p>당신의 독서가 숲이 되는 시간</p>
            </div>
          </div>

          {/* Environmental Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Time of Day Toggle */}
            <button 
              onClick={() => { playClick(); setTimeOfDay(timeOfDay === 'day' ? 'night' : 'day'); }}
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '6px' }}
              title={timeOfDay === 'day' ? '야간 모드로 전환' : '주간 모드로 전환'}
            >
              {timeOfDay === 'day' ? <Moon size={16} color="#482810" /> : <Sun size={16} color="#cf6a17" />}
            </button>

            {/* Auto day/night toggle (tracks the real-world clock) */}
            <button
              onClick={() => { playClick(); setAutoEnv(!autoEnv); }}
              className="btn-secondary"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: autoEnv ? 'var(--primary-green)' : undefined,
                color: autoEnv ? '#fff' : undefined
              }}
              title={autoEnv ? '실시간 자동 낮/밤 켜짐 (현재 시각 연동)' : '실시간 자동 낮/밤 끄기'}
            >
              🕓 자동 {autoEnv ? 'ON' : 'OFF'}
            </button>

            {/* Weather Selector */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--wood-dark)', padding: '4px', borderRadius: '6px', border: '2px solid var(--gold-border)' }}>
              <button 
                onClick={() => { playClick(); setWeather('clear'); }}
                className="btn-secondary"
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: '4px', 
                  fontSize: '0.72rem', 
                  background: weather === 'clear' ? 'var(--wood-inner)' : 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  color: weather === 'clear' ? 'var(--text-primary)' : 'var(--wood-inner)'
                }}
              >
                ☀️ 맑음
              </button>
              <button 
                onClick={() => { playClick(); setWeather('rainy'); }}
                className="btn-secondary"
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: '4px', 
                  fontSize: '0.72rem', 
                  background: weather === 'rainy' ? 'var(--wood-inner)' : 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  color: weather === 'rainy' ? 'var(--text-primary)' : 'var(--wood-inner)'
                }}
              >
                <CloudRain size={12} style={{ marginRight: '4px', display: 'inline' }} />
                비
              </button>
              <button 
                onClick={() => { playClick(); setWeather('snowy'); }}
                className="btn-secondary"
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: '4px', 
                  fontSize: '0.72rem', 
                  background: weather === 'snowy' ? 'var(--wood-inner)' : 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  color: weather === 'snowy' ? 'var(--text-primary)' : 'var(--wood-inner)'
                }}
              >
                <CloudSnow size={12} style={{ marginRight: '4px', display: 'inline' }} />
                눈
              </button>
            </div>

            {/* Biome Badge */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: 'var(--wood-dark)', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                border: '2px solid var(--gold-border)',
                fontSize: '0.75rem',
                color: 'var(--gold-highlight)',
                fontWeight: 700,
                textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
              }}
            >
              🌈 사계절 다차원 정원
            </div>

            {/* Auth status / login button */}
            {isAuthed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--gold-highlight)',
                    textShadow: '1px 1px 0 var(--wood-dark)',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={`${nickname || username} 님으로 로그인됨`}
                >
                  🌱 {nickname || username}
                </span>
                <button
                  onClick={() => { playClick(); logout(); }}
                  className="btn-secondary"
                  style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, gap: '4px' }}
                  title="로그아웃"
                >
                  <LogOut size={14} />
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => { playClick(); setAuthModalOpen(true); }}
                className="btn-primary"
                style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, gap: '4px' }}
                title="로그인 / 회원가입"
              >
                <LogIn size={14} />
                로그인
              </button>
            )}
          </div>
        </header>

        {/* Sidebar Left: Books & Profiles */}
        <Sidebar onOpenSearch={() => setSearchModalOpen(true)} />

        {/* QuestBoard Right: Quests & Achievements */}
        <QuestBoard />

        {/* Bottom Panel: Scene Statistics & Settings */}
        <div className="bottom-control-panel glass-panel ui-element">
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--text-light)', textShadow: '1px 1px 0 var(--wood-dark)' }}>
            <div>총 나무: <strong style={{ color: 'var(--gold-highlight)' }}>{totalTrees}</strong>그루</div>
            <div>완독 나무: <strong style={{ color: 'var(--accent-pink)' }}>{completedTrees}</strong>그루</div>
            <div>성장 중: <strong style={{ color: 'var(--primary-green)' }}>{activeTrees}</strong>그루</div>
            <div>배치 소품: <strong style={{ color: 'var(--gold-border)' }}>{decorations.length}</strong>개</div>
          </div>

          <div style={{ width: '2px', height: '18px', background: 'var(--wood-dark)' }} />

          <button 
            onClick={() => { playClick(); setShowTutorial(!showTutorial); }}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', gap: '4px' }}
          >
            <HelpCircle size={13} />
            <span>가이드 {showTutorial ? '닫기' : '보기'}</span>
          </button>

          <button 
            onClick={() => { playClick(); handleResetData(); }}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', gap: '4px', color: '#c0392b' }}
          >
            <RefreshCw size={13} />
            <span>초기화</span>
          </button>
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div 
          className="glass-panel ui-element" 
          style={{
            position: 'absolute',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            width: '450px',
            maxWidth: '90vw',
            padding: '20px',
            background: 'var(--wood-panel)',
            border: '4px solid var(--wood-dark)',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', textShadow: '2px 2px 0 var(--wood-dark)' }}>🌳 리드 포레스트 도서 정원 가이드</h4>
            <button 
              onClick={() => { playClick(); setShowTutorial(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--wood-inner)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
            >
              [닫기]
            </button>
          </div>
          <ul style={{ fontSize: '0.75rem', color: 'var(--wood-inner)', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '6px', textShadow: '1px 1px 0 var(--wood-dark)' }}>
            <li><strong>나무 심기</strong>: [새 작물 심기] 버튼을 눌러 소설, IT, 역사 등의 장르 책을 등록하세요. 각 장르별로 다른 계열의 나무가 자라납니다.</li>
            <li><strong>다차원 바이옴 땅</strong>: 하나의 땅이 4개의 바이옴(봄, 가을, 겨울, 사막) 구역으로 분할되어 있습니다! 작물이 심긴 좌표(위치)에 따라 계절에 적절한 나무(벚꽃나무, 가을 벚나무, 설화 나무, 사막 장미 등)로 다채롭게 자라나며, 겨울 구역에서는 비가 내릴 때 눈이 오기도 합니다!</li>
            <li><strong>나무의 성장</strong>: 책 카드를 열어 독서 일지를 작성(페이지 업데이트)하면 나무가 커집니다. 완독(100%) 시 이쁜 꽃이나 열매를 맺습니다!</li>
            <li><strong>시들음 & 심폐소생</strong>: 3일 이상 읽지 않은 책(나무)은 활력을 잃고 잎이 누렇게 시듭니다. 활력이 0%가 되면 앙상한 밑동으로 변하지만, 페이지를 1장이라도 더 읽고 업데이트하면 즉시 생생하게 되살아납니다! (피닉스 가드너 뱃지 수여)</li>
            <li><strong>성장의 순간</strong>: 책을 읽어 나무가 새싹→묘목→큰 나무로 <strong>단계가 바뀔 때마다</strong> 반짝임과 효과음이 터집니다. 완독한 나무는 캐노피 위에 황금빛 별이 영원히 반짝여 <strong>트로피</strong>처럼 빛나요!</li>
            <li><strong>소품 직접 배치</strong>: 잡화점에서 소품을 고르면 <strong>커서를 따라다니는 미리보기</strong>가 뜹니다. 원하는 자리를 클릭해 직접 배치하세요(우클릭·Esc로 취소). 디딤돌·꽃밭·울타리·표지판·버섯·허수아비·우물 등 소품이 <strong>테마 세트</strong>로 추가되었고, 같은 세트를 모으는 재미가 있어요. 땅이 넓어지면 <strong>농장 오두막</strong>도 해금됩니다!</li>
            <li><strong>돌아올 이유</strong>: 자리를 비운 사이에도 정원은 살아갑니다. 몇 시간 뒤 다시 오면 토끼·사슴이 남긴 <strong>골드 보상</strong>을 받아요. 헤더의 <strong>🕓 자동</strong> 버튼을 켜면 실제 시각에 맞춰 낮/밤이 자동으로 바뀝니다.</li>
            <li><strong>마을 & 공유</strong>: [마을] 탭은 <strong>레벨 랭킹</strong>으로 정렬되며, 친구 정원을 방문해 <strong>💧 물주기</strong>로 보답 골드를 얻을 수 있어요. 우측 상단 <strong>📷 정원 공유</strong> 버튼으로 지금 정원을 PNG로 저장해 자랑하세요!</li>
            <li><strong>매일 새 꾸러미</strong>: 일일 퀘스트는 <strong>매일 자동으로 새로 갈리며</strong>, 파란 <strong>[주간]</strong> 챌린지도 도전할 수 있습니다.</li>
            <li><strong>2D 픽셀 정원</strong>: 스타듀 밸리 감성의 <strong>2D 픽셀 아트</strong>로 독서 정원을 감상해 보세요. 빈 땅을 드래그하면 시점이 이동하고 마우스 휠로 줌 인/아웃 할 수 있습니다. 나무들은 바람에 살랑살랑 흔들리고, 사슴과 토끼는 정원을 자유롭게 돌아다닙니다!</li>
            <li><strong>사물 재배치</strong>: 나무·등불·벤치 등 정원의 사물을 <strong>드래그해서 원하는 위치로 옮길 수 있습니다</strong>. 단, 나무는 자신이 속한 <strong>바이옴(계절) 구역 안에서만</strong> 옮길 수 있어요. 놓을 수 없는 곳에서는 빨간 표시가 나타납니다.</li>
          </ul>
        </div>
      )}

      {/* Book Search and Addition Modal */}
      {searchModalOpen && (
        <BookSearchModal onClose={() => setSearchModalOpen(false)} />
      )}

      {/* Login / Signup Modal */}
      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}

      {/* Toast notification (offline rewards, watering, etc.) */}
      {notice && (
        <div
          className="glass-panel ui-element"
          onClick={dismissNotice}
          style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            padding: '12px 20px',
            background: 'var(--wood-panel)',
            border: '3px solid var(--gold-border)',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            textShadow: '1px 1px 0 var(--wood-dark)',
            cursor: 'pointer',
            boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
            animation: 'pulse 1.5s infinite alternate',
            maxWidth: '90vw'
          }}
          title="클릭하여 닫기"
        >
          {notice}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

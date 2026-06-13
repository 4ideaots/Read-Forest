import React, { useState } from 'react';
import { useApp, DECOR_COST } from '../context/AppContext';
import type { DecorationType } from '../types';
import { Check, ShoppingBag, Award, Gift, ArrowRight, Map, Lock } from 'lucide-react';
import { playClick } from '../utils/audio';
import { isHouseUnlocked } from '../utils/island';

export const QuestBoard: React.FC = () => {
  const {
    quests,
    user,
    claimQuestReward,
    beginPlacement,
    pendingPlacement,
    viewingSocialForest,
    socialForests,
    setViewingSocialForest,
    trees,
    decorations
  } = useApp();

  const [activeTab, setActiveTab] = useState<'quests' | 'shop' | 'badges' | 'social'>('quests');

  // The cottage only appears once the island has grown wide enough.
  const landUnlocked = isHouseUnlocked(trees.length + decorations.length);

  type ShopItem = { type: DecorationType; name: string; icon: string; desc: string; requiresLand?: boolean };
  // Items grouped into collectible theme sets to spark "complete the set" desire.
  const shopSets: { set: string; emoji: string; items: ShopItem[] }[] = [
    {
      set: '기본 조경',
      emoji: '🧱',
      items: [
        { type: 'stone_path', name: '자갈 디딤돌', icon: '🪨', desc: '이동 경로에 까는 시골풍 디딤돌' },
        { type: 'flowerbed', name: '꽃밭', icon: '🌷', desc: '계절 꽃이 피어나는 아담한 꽃밭' },
        { type: 'fence', name: '나무 울타리', icon: '🪵', desc: '구역을 나누는 정겨운 목책' },
        { type: 'signpost', name: '나무 표지판', icon: '🪧', desc: '정원 길을 안내하는 표지판' }
      ]
    },
    {
      set: '정원 친구',
      emoji: '🐾',
      items: [
        { type: 'rabbit', name: '정원 토끼', icon: '🐇', desc: '풀숲을 돌아다니는 귀여운 토끼' },
        { type: 'mushroom', name: '버섯 무리', icon: '🍄', desc: '그늘에 옹기종기 돋아난 버섯' },
        { type: 'scarecrow', name: '허수아비', icon: '🧑‍🌾', desc: '밭을 지키는 든든한 허수아비' },
        { type: 'deer', name: '신비한 사슴', icon: '🦌', desc: '새벽 안개 속 신비한 사슴' }
      ]
    },
    {
      set: '휴식과 물',
      emoji: '⛲',
      items: [
        { type: 'lantern', name: '풍경 정원등', icon: '🏮', desc: '밤눈 어두운 농장을 밝히는 전등' },
        { type: 'bench', name: '휴식 벤치', icon: '🪑', desc: '잠시 쉬어가는 나무 벤치' },
        { type: 'pond', name: '하늘 연못', icon: '🪷', desc: '물고기가 튀는 작은 정원 연못' },
        { type: 'well', name: '돌 우물', icon: '🪣', desc: '시원한 물이 솟는 돌 우물' }
      ]
    },
    {
      set: '보금자리',
      emoji: '🏡',
      items: [
        { type: 'house', name: '농장 오두막', icon: '🏠', desc: '정원을 지키는 아늑한 통나무 오두막', requiresLand: true }
      ]
    }
  ];

  const handleTabChange = (tab: typeof activeTab) => {
    playClick();
    setActiveTab(tab);
  };

  const handlePlaceDecor = (type: DecorationType, cost: number) => {
    if (type === 'house' && !landUnlocked) return;
    if (user.points >= cost && !viewingSocialForest) {
      // Enter manual placement mode; the actual purchase happens on drop.
      playClick();
      beginPlacement(type);
    }
  };

  const handleClaimReward = (questId: string) => {
    playClick();
    claimQuestReward(questId);
  };

  const handleVisitForest = (forest: any) => {
    playClick();
    setViewingSocialForest(forest);
  };

  const getBadgeIcon = (icon: string) => {
    return (
      <div 
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '4px',
          background: 'var(--wood-dark)',
          border: '2px solid var(--gold-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)'
        }}
      >
        {icon}
      </div>
    );
  };

  const tabStyle = (tabId: typeof activeTab) => {
    const active = activeTab === tabId;
    return {
      flex: 1,
      padding: '8px 4px',
      cursor: 'pointer',
      background: active ? 'var(--wood-panel)' : 'var(--wood-medium)',
      color: active ? '#fff' : 'var(--wood-inner)',
      border: '3px solid var(--wood-dark)',
      borderRadius: '6px 6px 0 0',
      borderBottom: active ? 'none' : '3px solid var(--wood-dark)',
      fontFamily: 'var(--font-pixel)',
      fontSize: '0.72rem',
      fontWeight: 700,
      textAlign: 'center' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      marginBottom: active ? '-3px' : '0px',
      zIndex: active ? 2 : 1,
      boxShadow: active ? 'none' : 'inset 0 -4px 0 rgba(0,0,0,0.25)',
      textShadow: active ? '1px 1px 0 var(--wood-dark)' : '1px 1px 0 var(--wood-dark)',
      transition: 'all 0.05s steps(2)'
    };
  };

  const completedQuestsCount = quests.filter(q => q.completed).length;

  const decorName: Record<DecorationType, string> = {
    lantern: '정원등', pond: '연못', bench: '벤치', deer: '사슴', rabbit: '토끼',
    stone_path: '디딤돌', house: '오두막', fence: '울타리', flowerbed: '꽃밭',
    mushroom: '버섯', signpost: '표지판', well: '우물', scarecrow: '허수아비'
  };

  // Village ranking: sort gardens by level so the leaderboard feels competitive.
  const rankedForests = [...socialForests].sort((a, b) => b.level - a.level);
  const rankMedal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`);

  return (
    <div className="right-sidebar ui-element" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Wooden Tab Bar */}
      <div style={{ display: 'flex', width: '100%', marginBottom: '0px', position: 'relative', zIndex: 1, gap: '2px' }}>
        <button style={tabStyle('quests')} onClick={() => handleTabChange('quests')}>
          <Gift size={12} />
          <span>꾸러미</span>
        </button>
        <button style={tabStyle('shop')} onClick={() => handleTabChange('shop')}>
          <ShoppingBag size={12} />
          <span>잡화점</span>
        </button>
        <button style={tabStyle('badges')} onClick={() => handleTabChange('badges')}>
          <Award size={12} />
          <span>박물관</span>
        </button>
        <button style={tabStyle('social')} onClick={() => handleTabChange('social')}>
          <Map size={12} />
          <span>마을</span>
        </button>
      </div>

      {/* Main Container Board */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '18px', 
          borderTopLeftRadius: '0px', 
          marginTop: '-3px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          minHeight: '450px',
          flex: 1 
        }}
      >
        
        {/* QUESTS TAB: Community Center Bulletin Board */}
        {activeTab === 'quests' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px dashed var(--wood-medium)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', textShadow: '2px 2px 0 var(--wood-dark)' }}>
                ⭐ 마을회관 일일 꾸러미
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)', marginTop: '2px' }}>
                오늘 완료한 꾸러미: {completedQuestsCount} / {quests.length}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '55vh' }}>
              {quests.map((quest) => {
                const isCompleted = quest.completed;
                const isClaimed = quest.rewardClaimed;
                const isWeekly = quest.id === 'weekly-1';
                const progressPercent = Math.min(100, Math.round((quest.currentValue / quest.targetValue) * 100));

                return (
                  <div 
                    key={quest.id} 
                    className="glass-card" 
                    style={{
                      position: 'relative',
                      border: isClaimed ? '2px solid var(--wood-dark)' : isCompleted ? '2px solid var(--gold-border)' : '2px solid var(--wood-dark)',
                      background: isClaimed ? 'rgba(56, 26, 4, 0.08)' : isCompleted ? 'var(--wood-inner-hover)' : 'var(--wood-inner)',
                      opacity: isClaimed ? 0.7 : 1,
                      padding: '10px 12px'
                    }}
                  >
                    {/* Bundle Ribbon Badge */}
                    {isCompleted && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          fontSize: '1rem',
                          animation: !isClaimed ? 'pulse 1.5s infinite alternate' : 'none'
                        }}
                      >
                        {isClaimed ? '💚' : '🌟'}
                      </div>
                    )}

                    <div style={{ paddingRight: '20px' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isWeekly && (
                          <span style={{ fontSize: '0.58rem', background: 'var(--accent-blue)', color: '#fff', padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--wood-dark)' }}>
                            주간
                          </span>
                        )}
                        {quest.title}
                      </h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: '8px' }}>
                        {quest.description}
                      </p>
                    </div>

                    {/* Progress tracking */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 600 }}>
                        <span>달성도 {progressPercent}%</span>
                        <span>{quest.currentValue} / {quest.targetValue}</span>
                      </div>
                      <div className="pixel-progress-container" style={{ height: '10px' }}>
                        <div 
                          className="pixel-progress-fill" 
                          style={{ 
                            width: `${progressPercent}%`,
                            background: isCompleted 
                              ? 'repeating-linear-gradient(-45deg, #f1ab29, #f1ab29 4px, #ffda68 4px, #ffda68 8px)'
                              : 'repeating-linear-gradient(-45deg, var(--primary-green), var(--primary-green) 4px, var(--primary-dark) 4px, var(--primary-dark) 8px)'
                          }} 
                        />
                      </div>
                    </div>

                    {/* Reward & Claim Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <span>꾸러미 보상:</span>
                        <span style={{ color: '#cf6a17' }}>🪙 {quest.rewardPoints} G</span>
                        {quest.rewardDecorationType && (
                          <span style={{ color: 'var(--primary-dark)' }}>
                            + 🎁 [{decorName[quest.rewardDecorationType]}]
                          </span>
                        )}
                      </div>

                      {isCompleted && !isClaimed && (
                        <button 
                          onClick={() => handleClaimReward(quest.id)}
                          className="btn-primary" 
                          style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: '4px', gap: '2px', boxShadow: '0 2px 0 var(--wood-dark)' }}
                        >
                          <Check size={10} />
                          <span>꾸러미 수령</span>
                        </button>
                      )}

                      {isClaimed && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--primary-emerald)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                          ✓ 복구 완료됨
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SHOP TAB: Pierre's General Store */}
        {activeTab === 'shop' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px dashed var(--wood-medium)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', textShadow: '2px 2px 0 var(--wood-dark)' }}>
                🏪 피에르 잡화점
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)', marginTop: '2px' }}>
                정원을 장식할 소품을 구입하세요.
              </p>
              
              {/* Gold indicator */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--wood-dark)', border: '2px solid var(--gold-border)', padding: '4px 12px', borderRadius: '4px', color: 'var(--gold-highlight)', fontWeight: 700, fontSize: '0.8rem', marginTop: '6px' }}>
                <span>보유 골드: {user.points} G 🪙</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '50vh', paddingBottom: '8px' }}>
              {shopSets.map((group) => {
                const owned = group.items.filter((it) => decorations.some((d) => d.type === it.type)).length;
                return (
                  <div key={group.set}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold-highlight)', textShadow: '1px 1px 0 var(--wood-dark)' }}>
                        {group.emoji} {group.set}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--wood-inner)', fontWeight: 700 }}>
                        세트 {owned}/{group.items.length}{owned === group.items.length ? ' ✅' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {group.items.map((item) => {
                        const cost = DECOR_COST[item.type];
                        const locked = !!item.requiresLand && !landUnlocked;
                        const canAfford = user.points >= cost;
                        const isPlacing = pendingPlacement === item.type;
                        const isDisabled = !canAfford || !!viewingSocialForest || locked;

                        return (
                          <div
                            key={item.type}
                            className="glass-card"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'var(--wood-inner)',
                              border: isPlacing ? '2px solid var(--gold-highlight)' : locked ? '2px dashed var(--wood-medium)' : '2px solid var(--wood-dark)',
                              opacity: isDisabled ? 0.55 : 1,
                              padding: '8px',
                              textAlign: 'center',
                              position: 'relative'
                            }}
                          >
                            {/* Item Slot Box */}
                            <div style={{
                              width: '46px',
                              height: '46px',
                              background: 'var(--wood-dark)',
                              border: '2px solid var(--wood-medium)',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.6rem',
                              boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
                              filter: locked ? 'grayscale(1) brightness(0.7)' : 'none'
                            }}>
                              {locked ? '❓' : item.icon}
                            </div>

                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {item.name}
                            </span>

                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', height: '28px', overflow: 'hidden' }}>
                              {locked ? '정원의 땅이 더 넓어지면 해금됩니다.' : item.desc}
                            </p>

                            <button
                              disabled={isDisabled}
                              onClick={() => handlePlaceDecor(item.type, cost)}
                              className="btn-primary"
                              style={{
                                width: '100%',
                                padding: '4px',
                                fontSize: '0.68rem',
                                justifyContent: 'center',
                                gap: '2px',
                                boxShadow: isDisabled ? 'none' : '0 2px 0 var(--wood-dark)',
                                background: isPlacing ? 'var(--gold-border)' : locked ? 'var(--wood-medium)' : canAfford ? 'var(--primary-green)' : 'var(--text-muted)',
                                cursor: isDisabled ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {locked ? (
                                <>
                                  <Lock size={10} />
                                  <span>지형 확장 필요</span>
                                </>
                              ) : isPlacing ? (
                                <span>배치 중…</span>
                              ) : (
                                <span>{cost} G 🪙</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {viewingSocialForest && (
              <p style={{ fontSize: '0.68rem', color: 'var(--accent-red)', textAlign: 'center', marginTop: '6px', fontWeight: 600 }}>
                ⚠️ 다른 정원사 숲 구경 중에는 구매가 불가합니다.
              </p>
            )}
          </div>
        )}

        {/* BADGES TAB: Gunther's Museum */}
        {activeTab === 'badges' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px dashed var(--wood-medium)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', textShadow: '2px 2px 0 var(--wood-dark)' }}>
                🏆 펠리칸 도서 박물관
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)', marginTop: '2px' }}>
                가드너님의 명예로운 훈장 수집 목록 ({user.badges.length})
              </p>
            </div>

            {user.badges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)', fontSize: '0.8rem' }}>
                박물관에 아직 기증된 뱃지가 없습니다.<br />꾸준한 독서로 업적을 해제하세요!
              </div>
            ) : (
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '8px', 
                  overflowY: 'auto', 
                  maxHeight: '52vh', 
                  padding: '4px' 
                }}
              >
                {user.badges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className="glass-card"
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      cursor: 'help',
                      border: '2px solid var(--wood-dark)',
                      padding: '8px 4px'
                    }}
                    title={`${badge.name}: ${badge.description}`}
                  >
                    {getBadgeIcon(badge.icon)}
                    <span style={{ 
                      fontSize: '0.68rem', 
                      color: 'var(--text-primary)', 
                      fontWeight: 700,
                      marginTop: '4px', 
                      textAlign: 'center', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap', 
                      width: '100%' 
                    }}>
                      {badge.name}
                    </span>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', zoom: 0.9 }}>
                      해제 완료
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SOCIAL TAB: Pelican Town Map */}
        {activeTab === 'social' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px dashed var(--wood-medium)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', textShadow: '2px 2px 0 var(--wood-dark)' }}>
                ⛵ 펠리칸 타운 정원 지도
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)', marginTop: '2px' }}>
                레벨 순위로 정렬된 마을 정원을 탐방해보세요.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '55vh' }}>
              {rankedForests.map((forest, i) => {
                const isCurrent = viewingSocialForest?.id === forest.id;

                return (
                  <button
                    key={forest.id}
                    onClick={() => handleVisitForest(forest)}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isCurrent ? 'var(--wood-inner-hover)' : 'var(--wood-inner)',
                      border: isCurrent ? '2px solid var(--gold-border)' : '2px solid var(--wood-dark)',
                      color: 'inherit',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      padding: '10px 12px',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '1rem', fontWeight: 700, minWidth: '28px', textAlign: 'center' }}>
                      {rankMedal(i)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{forest.userName}</span>
                        {forest.isPopular && (
                          <span style={{ 
                            fontSize: '0.58rem', 
                            background: '#e74c3c', 
                            color: '#fff', 
                            padding: '1px 4px', 
                            borderRadius: '3px',
                            fontWeight: 700,
                            border: '1px solid var(--wood-dark)'
                          }}>
                            인기농장
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        LV.{forest.level} {forest.userTitle} (작물 {forest.treeCount}그루)
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', color: 'var(--accent-orange)', fontWeight: 700 }}>
                      <span>방문</span>
                      <ArrowRight size={12} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { getGuestbook, writeGuestbook, type GuestbookEntry } from '../api/social';
import { playClick } from '../utils/audio';

interface GuestbookPanelProps {
  ownerUserId: number;
  ownerName: string;
}

export const GuestbookPanel: React.FC<GuestbookPanelProps> = ({ ownerUserId, ownerName }) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getGuestbook(ownerUserId)
      .then(setEntries)
      .catch(() => setError('방명록을 불러오지 못했어요.'));
  }, [ownerUserId]);

  useEffect(() => {
    setError(null);
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setBusy(true);
    setError(null);
    playClick();
    try {
      await writeGuestbook(ownerUserId, content);
      setText('');
      load();
    } catch {
      setError('방명록 작성에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: '8px', borderTop: '2px dashed var(--wood-medium)', paddingTop: '8px' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', textShadow: '1px 1px 0 var(--wood-dark)', marginBottom: '6px' }}>
        📓 {ownerName} 님의 방명록
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '120px', overflowY: 'auto', marginBottom: '8px' }}>
        {entries.length === 0 ? (
          <div style={{ fontSize: '0.7rem', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)' }}>
            아직 방명록이 없어요. 첫 메시지를 남겨보세요!
          </div>
        ) : (
          entries.map((g) => (
            <div key={g.id} style={{ background: 'var(--wood-inner)', border: '1px solid var(--wood-dark)', borderRadius: '4px', padding: '5px 8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>{g.content}</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                정원사 #{g.writerId} · {new Date(g.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submit} style={{ display: 'flex', gap: '4px' }}>
        <input
          type="text"
          value={text}
          maxLength={200}
          onChange={(e) => setText(e.target.value)}
          placeholder="따뜻한 한마디 남기기"
          className="input-field"
          style={{ flex: 1, padding: '5px 8px', fontSize: '0.72rem', background: 'var(--wood-inner)' }}
        />
        <button type="submit" className="btn-primary" disabled={busy} style={{ padding: '5px 10px', fontSize: '0.72rem' }}>
          등록
        </button>
      </form>
      {error && <div style={{ fontSize: '0.66rem', color: '#ffb0b0', marginTop: '4px' }}>{error}</div>}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/profile';
import { deleteAccount } from '../api/account';
import { health } from '../api/system';
import { X, Save, Trash2 } from 'lucide-react';
import { playClick, playCoin } from '../utils/audio';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { userId, logout, refreshIdentity } = useAuth();

  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [conn, setConn] = useState<'checking' | 'up' | 'down'>('checking');

  // Load the current profile + backend health on open.
  useEffect(() => {
    if (userId != null) {
      getProfile(userId)
        .then((p) => {
          setNickname(p.nickname ?? '');
          setTitle(p.title ?? '');
          setBio(p.bio ?? '');
        })
        .catch(() => {});
    }
    health()
      .then((h) => setConn(h.database === 'UP' ? 'up' : 'down'))
      .catch(() => setConn('down'));
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setSaving(true);
    playClick();
    try {
      await updateProfile({ nickname: nickname.trim(), title: title.trim(), bio: bio.trim() });
      await refreshIdentity();
      playCoin();
      setOkMsg('프로필이 저장되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 회원 탈퇴하시겠습니까? 계정과 서버에 저장된 정원이 영구 삭제됩니다.')) return;
    playClick();
    try {
      await deleteAccount();
      logout();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '탈퇴 처리에 실패했습니다.');
    }
  };

  const labelStyle: React.CSSProperties = { fontSize: '0.78rem', color: 'var(--wood-inner)', fontWeight: 600, textShadow: '1px 1px 0 var(--wood-dark)' };
  const inputStyle: React.CSSProperties = { background: 'var(--wood-inner)' };

  const connBadge = {
    checking: { text: '연결 확인 중…', color: 'var(--wood-inner)' },
    up: { text: '🟢 백엔드·DB 연결됨', color: 'var(--primary-emerald, #2ecc71)' },
    down: { text: '🔴 백엔드 미연결 (로컬 모드)', color: 'var(--accent-red, #e74c3c)' }
  }[conn];

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ background: 'var(--wood-panel)', maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', textShadow: '2px 2px 0 var(--wood-dark)' }}>
            🌱 프로필 설정
          </h2>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="btn-secondary"
            style={{ background: 'var(--wood-medium)', border: '2px solid var(--wood-dark)', color: 'var(--wood-inner)', padding: '6px', borderRadius: '4px', boxShadow: 'none' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: connBadge.color, marginBottom: '12px' }}>
          {connBadge.text}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>닉네임 (2~10자)</label>
            <input type="text" required minLength={2} maxLength={10} value={nickname}
              onChange={(e) => setNickname(e.target.value)} className="input-field" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>칭호 (최대 20자)</label>
            <input type="text" maxLength={20} value={title} placeholder="예: 낭만 소설가"
              onChange={(e) => setTitle(e.target.value)} className="input-field" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>한 줄 소개 (최대 100자)</label>
            <input type="text" maxLength={100} value={bio} placeholder="나의 독서 정원을 소개해요"
              onChange={(e) => setBio(e.target.value)} className="input-field" style={inputStyle} />
          </div>

          {error && (
            <div style={{ fontSize: '0.74rem', color: '#ffb0b0', background: 'rgba(192,57,43,0.18)', border: '1px solid #c0392b', borderRadius: '4px', padding: '8px 10px', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}
          {okMsg && (
            <div style={{ fontSize: '0.74rem', color: '#aef2b0', background: 'rgba(46,204,113,0.18)', border: '1px solid #2ecc71', borderRadius: '4px', padding: '8px 10px', fontWeight: 600 }}>
              ✓ {okMsg}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={saving}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', gap: '6px', opacity: saving ? 0.6 : 1 }}>
            <Save size={14} />
            {saving ? '저장 중…' : '프로필 저장'}
          </button>
        </form>

        <div style={{ borderTop: '2px dashed var(--wood-dark)', margin: '16px 0 12px' }} />
        <button
          onClick={handleDelete}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', padding: '8px', gap: '6px', fontSize: '0.75rem', color: '#e74c3c', fontWeight: 700 }}
        >
          <Trash2 size={13} />
          회원 탈퇴
        </button>
      </div>
    </div>
  );
};

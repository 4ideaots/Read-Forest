import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, UserPlus } from 'lucide-react';
import { playClick, playCoin } from '../utils/audio';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    playClick();
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await signup(username.trim(), password, nickname.trim());
      }
      playCoin();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabBtn = (m: typeof mode, label: string, Icon: typeof LogIn) => {
    const active = mode === m;
    return (
      <button
        type="button"
        onClick={() => { playClick(); setMode(m); setError(null); }}
        style={{
          flex: 1,
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontWeight: 700,
          fontSize: '0.82rem',
          cursor: 'pointer',
          color: active ? '#fff' : 'var(--wood-inner)',
          background: active ? 'var(--wood-medium)' : 'transparent',
          border: '2px solid var(--wood-dark)',
          borderRadius: '6px',
          textShadow: '1px 1px 0 var(--wood-dark)',
        }}
      >
        <Icon size={14} />
        {label}
      </button>
    );
  };

  const inputStyle: React.CSSProperties = { background: 'var(--wood-inner)' };
  const labelStyle: React.CSSProperties = { fontSize: '0.78rem', color: 'var(--wood-inner)', fontWeight: 600, textShadow: '1px 1px 0 var(--wood-dark)' };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ background: 'var(--wood-panel)', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', textShadow: '2px 2px 0 var(--wood-dark)' }}>
            🌳 리드 포레스트 계정
          </h2>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="btn-secondary"
            style={{ background: 'var(--wood-medium)', border: '2px solid var(--wood-dark)', color: 'var(--wood-inner)', padding: '6px', borderRadius: '4px', boxShadow: 'none' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {tabBtn('login', '로그인', LogIn)}
          {tabBtn('signup', '회원가입', UserPlus)}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>아이디 (4~20자)</label>
            <input type="text" required minLength={4} maxLength={20} value={username}
              onChange={(e) => setUsername(e.target.value)} className="input-field" style={inputStyle}
              placeholder="영문/숫자 아이디" autoComplete="username" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>비밀번호 (8~30자)</label>
            <input type="password" required minLength={8} maxLength={30} value={password}
              onChange={(e) => setPassword(e.target.value)} className="input-field" style={inputStyle}
              placeholder="비밀번호" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={labelStyle}>닉네임 (2~10자)</label>
              <input type="text" required minLength={2} maxLength={10} value={nickname}
                onChange={(e) => setNickname(e.target.value)} className="input-field" style={inputStyle}
                placeholder="정원에서 쓸 이름" />
            </div>
          )}

          {error && (
            <div style={{ fontSize: '0.74rem', color: '#ffb0b0', background: 'rgba(192,57,43,0.18)', border: '1px solid var(--accent-red, #c0392b)', borderRadius: '4px', padding: '8px 10px', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '4px', opacity: loading ? 0.6 : 1 }}>
            {loading ? '처리 중…' : mode === 'login' ? '로그인' : '회원가입 후 시작'}
          </button>
        </form>

        <p style={{ fontSize: '0.66rem', color: 'var(--wood-inner)', textShadow: '1px 1px 0 var(--wood-dark)', marginTop: '14px', textAlign: 'center', lineHeight: 1.5 }}>
          로그인하면 카카오 도서 검색 등 백엔드 기능이 활성화됩니다.<br />
          정원 데이터는 이 기기에 안전하게 저장돼요.
        </p>
      </div>
    </div>
  );
};

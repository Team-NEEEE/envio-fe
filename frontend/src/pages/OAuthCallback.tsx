import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

function readGithubIdFromAccessToken(accessToken: string) {
  try {
    const [, payload] = accessToken.split('.');
    if (!payload) return undefined;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decodedPayload = JSON.parse(atob(paddedBase64)) as { githubId?: unknown };

    return typeof decodedPayload.githubId === 'string' ? decodedPayload.githubId : undefined;
  } catch {
    return undefined;
  }
}

export function OAuthCallback() {
  const navigate = useNavigate();
  const { setOAuthSession } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hashParams.get('accessToken');
    const refreshToken = hashParams.get('refreshToken');
    const userId = hashParams.get('userId');
    const email = hashParams.get('email');
    const role = hashParams.get('role');

    if (!accessToken || !refreshToken || !userId || !email || !role) {
      setError('로그인 응답에 필요한 인증 정보가 없습니다.');
      return;
    }

    setOAuthSession({
      accessToken,
      refreshToken,
      userId,
      email,
      role,
      githubId: readGithubIdFromAccessToken(accessToken),
    });

    navigate('/', { replace: true });
  }, [navigate, setOAuthSession]);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center flex-col gap-4 bg-background">
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-text text-white rounded-md hover:bg-blue-text/90 transition-colors"
        >
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center flex-col gap-4 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-blue-text" />
      <p className="text-foreground font-medium">로그인 처리 중...</p>
    </div>
  );
}

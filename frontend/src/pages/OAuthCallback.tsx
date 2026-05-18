import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens, fetchUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setError('인증 코드가 없습니다.');
      return;
    }

    const processOAuth = async () => {
      try {
        const { data } = await api.get('/api/auth/oauth/github/callback', {
          params: { code, state }
        });

        if (data && data.data) {
          const { accessToken, refreshToken } = data.data;

          setTokens(accessToken, refreshToken);

          await fetchUser();

          navigate('/');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('OAuth processing failed:', err);
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    processOAuth();
  }, [searchParams, navigate, setTokens, fetchUser]);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center flex-col gap-4 bg-background">
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-text text-white rounded-md hover:bg-blue-text/90 transition-colors"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center flex-col gap-4 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-blue-text" />
      <p className="text-foreground font-medium">로그인 처리 중입니다...</p>
    </div>
  );
}

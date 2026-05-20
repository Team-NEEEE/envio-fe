import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";
import { OAuthCallback } from "@/pages/OAuthCallback";
import { Loader2 } from "lucide-react";

/**
 * localStorage 복원(hydration)이 완료되기 전까지 렌더를 막는 게이트 컴포넌트.
 * hydration 전에 accessToken이 null로 읽혀 로그인 페이지로 튕기는 문제를 완전히 방지합니다.
 */
function HydrationGate({ children }: { children: React.ReactNode }) {
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center flex-col gap-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-text" />
        <p className="text-foreground font-medium text-sm">Envio 로딩 중...</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * 토큰은 있지만 user 정보가 없을 때 (새로고침/새 탭) 대시보드로 접근 허용.
 * user 정보는 App 최상단 useEffect에서 채워집니다.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { fetchUser, accessToken, user } = useAuthStore();

  useEffect(() => {
    // 토큰은 있는데 user 정보가 없는 경우 (새로고침/새 탭)
    if (accessToken && !user) {
      console.log('[APP] 토큰 존재, user 없음 → fetchUser 호출');
      fetchUser().catch((err) => {
        console.error('[APP] fetchUser 실패, 로그아웃 처리:', err);
        useAuthStore.getState().logout();
      });
    }
  }, [accessToken, user, fetchUser]);

  return (
    <BrowserRouter>
      <HydrationGate>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HydrationGate>
    </BrowserRouter>
  );
}
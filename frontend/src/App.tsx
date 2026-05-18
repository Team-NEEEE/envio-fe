import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";
import { OAuthCallback } from "@/pages/OAuthCallback";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuthStore();

  if (!user && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { fetchUser, accessToken, user } = useAuthStore();

  useEffect(() => {
    if (accessToken && !user) {
      fetchUser().catch(() => {
        // 유저 정보가 없다면 새로 고침을 시도합니다.
        // 새로 고침을 실패하면 로그아웃하고 토큰을 지웁니다.
      });
    }
  }, [accessToken, user, fetchUser]);

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
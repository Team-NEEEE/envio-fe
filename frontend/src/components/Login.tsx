import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SplashPage } from "./SplashPage";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

export function Login() {
  const [showSplash, setShowSplash] = useState(false);

  const handleGitHubLogin = () => {
    const API_BASE_URL = 'http://env.io.kr';
    const FRONTEND_URL = 'http://env.io.kr';

    const redirectUri = `${FRONTEND_URL}/auth/callback`;

    window.location.href =
      `${API_BASE_URL}/api/auth/oauth/github?redirectUri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background text-foreground transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <Logo className="h-12 w-auto mb-4" />

        <Card className="w-full mt-4 bg-card border-border shadow-sm p-2 rounded-lg">
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-center">
              <Button
                onClick={handleGitHubLogin}
                className="h-11 w-full bg-[#24292e] text-center text-white hover:bg-[#2f363d]"
              >
                GitHub으로 로그인
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 border border-border rounded-lg p-4 w-full text-center text-sm bg-card">
          <button
            onClick={() => setShowSplash(true)}
            className="cursor-pointer text-gray-text hover:text-foreground underline focus:outline-none transition-colors"
          >
            회원이 아니신가요?
          </button>
        </div>
      </div>

      {showSplash && <SplashPage onClose={() => setShowSplash(false)} />}
    </div>
  );
}


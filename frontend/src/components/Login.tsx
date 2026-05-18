import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SplashPage } from "./SplashPage";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

export function Login() {
  const [username, setUsername] = useState("");
  const [showSplash, setShowSplash] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) login(username);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background text-foreground transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <Logo className="h-12 w-auto mb-4" />
        <h2 className="mt-6 text-center text-2xl font-light tracking-tight">
          Envio 로그인
        </h2>

        <Card className="w-full mt-4 bg-card border-border shadow-sm p-2 rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-sm font-medium sr-only">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm font-medium">
                  사용자 이름 또는 이메일 주소
                </Label>
                <Input
                  id="username"
                  className="bg-input border-border focus-visible:ring-ring text-sm h-8"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    비밀번호
                  </Label>
                  <a href="#" className="text-xs text-blue-text hover:underline">
                    비밀번호를 잊으셨나요?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="bg-input border-border focus-visible:ring-ring text-sm h-8"
                />
              </div>
              <Button type="submit" className="w-full h-8 mt-2 bg-[#238636] hover:bg-[#2ea043] text-white">
                로그인
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 border border-border rounded-lg p-4 w-full text-center text-sm bg-card">
          <button
            onClick={() => setShowSplash(true)}
            className="text-gray-text hover:text-foreground underline focus:outline-none transition-colors"
          >
            회원이 아니신가요?
          </button>
        </div>
      </div>

      {showSplash && <SplashPage onClose={() => setShowSplash(false)} />}
    </div>
  );
}

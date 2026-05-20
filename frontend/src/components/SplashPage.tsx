import { useState, useEffect } from "react";
import { X, ShieldCheck, Terminal, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SplashPageProps {
  onClose: () => void;
}

const slides = [
  {
    icon: <ShieldCheck className="w-20 h-20 text-blue-text mb-6" />,
    title: "완벽한 정보 보호 (Zero-Knowledge)",
    description: "서버 측에서 사용자의 암호화 키나 평문 데이터를 절대 볼 수 없도록 설계된 철저한 보안 아키텍처를 갖추고 있습니다.",
  },
  {
    icon: <Terminal className="w-20 h-20 text-blue-text mb-6" />,
    title: "개발자 친화적 워크플로우",
    description: "복잡한 기존 보안 솔루션과 달리 간편한 CLI를 제공하며, Git과 유사한 저장소 단위 격리 방식을 통해 개발자의 불편을 최소화합니다.",
  },
  {
    icon: <Bot className="w-20 h-20 text-blue-text mb-6" />,
    title: "AI 에이전트 보안 통합",
    description: "AI 코딩 도구들이 민감한 정보(API 키 등)를 유출하지 않고 안전하게 작동할 수 있도록 돕는 보안 프록시 기반의 MCP 서버를 내장하고 있습니다.",
  },
];

function renderSlideTitle(title: string) {
  if (title === "완벽한 정보 보호 (Zero-Knowledge)") {
    return (
      <>
        완벽한 정보 보호
        <br />
        (Zero-Knowledge)
      </>
    );
  }

  return title;
}

export function SplashPage({ onClose }: SplashPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground animate-in fade-in duration-300">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-text hover:text-foreground"
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="max-w-2xl text-center px-6">
        <h1 className="text-3xl font-bold mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500">
          Envio란 무엇인가요?
        </h1>

        <div className="relative h-64 flex flex-col items-center justify-center">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${index === currentSlide
                  ? "opacity-100 translate-y-0 z-10"
                  : "opacity-0 translate-y-8 pointer-events-none -z-10"
                }`}
            >
              {slide.icon}
              <h2 className="text-2xl font-semibold mb-4 text-foreground">{renderSlideTitle(slide.title)}</h2>
              <p className="text-lg text-gray-text leading-relaxed max-w-lg">
                {slide.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-blue-text" : "w-2.5 bg-border"
                }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-16">
          <Button
            onClick={onClose}
            className="px-8 py-6 text-lg font-medium bg-blue-text text-white hover:bg-blue-text/90 shadow-lg hover:shadow-xl transition-all"
          >
            시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}

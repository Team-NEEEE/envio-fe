import { useState } from "react";
import type { EnvHistory } from "@/store/mockData";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HistoryViewerProps {
  history: EnvHistory[];
}

export function HistoryViewer({ history }: HistoryViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6 border border-border rounded-md overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-muted px-4 py-3 border-b border-border flex items-center justify-between hover:bg-muted/80 transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground">환경변수 변경 히스토리</h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-text" /> : <ChevronDown className="w-4 h-4 text-gray-text" />}
      </button>

      {isOpen && (
        <div className="divide-y divide-border animate-in slide-in-from-top-2 fade-in duration-200">
          {history.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-text">
              히스토리가 없습니다.
            </div>
          ) : (
            history.map((item) => (
              <div key={item.histories_id} className="p-4 flex items-center space-x-3 hover:bg-muted/30 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-text">
                    {item.github_id.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-semibold text-blue-text hover:underline cursor-pointer">{item.github_id}</span>님이 다음 키를 업데이트했습니다: <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-red-text">{item.changed_key}</code>
                  </p>
                </div>
                <div className="flex-shrink-0 whitespace-nowrap text-xs text-gray-text">
                  {format(new Date(item.created_at), "yyyy년 MM월 dd일 HH:mm")}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

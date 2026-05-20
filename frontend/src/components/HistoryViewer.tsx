import { useState } from "react";
import type { EnvHistory } from "@/store/mockData";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Loader2, AlertCircle, GitCommitHorizontal } from "lucide-react";

interface HistoryViewerProps {
  history: EnvHistory[];
  loading?: boolean;
  error?: string | null;
}

export function HistoryViewer({ history, loading = false, error = null }: HistoryViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6 border border-border rounded-md overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-muted px-4 py-3 border-b border-border flex items-center justify-between hover:bg-muted/80 transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GitCommitHorizontal className="w-4 h-4 text-gray-text" />
          환경변수 변경 히스토리
          {!loading && !error && history.length > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-text/10 text-blue-text font-medium border border-blue-text/20">
              {history.length}
            </span>
          )}
        </h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-text" /> : <ChevronDown className="w-4 h-4 text-gray-text" />}
      </button>

      {isOpen && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
          {/* 로딩 상태 */}
          {loading && (
            <div className="p-6 flex flex-col items-center justify-center gap-2 text-gray-text">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm">히스토리를 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {!loading && error && (
            <div className="p-4 flex items-center gap-2 text-sm text-red-text bg-red-text/5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 빈 목록 */}
          {!loading && !error && history.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-text">
              아직 히스토리가 없습니다.
            </div>
          )}

          {/* 히스토리 목록 */}
          {!loading && !error && history.length > 0 && (
            <div className="divide-y divide-border">
              {history.map((item) => (
                <div
                  key={item.histories_id}
                  className="p-4 flex items-center space-x-3 hover:bg-muted/30 transition-colors"
                >
                  {/* 아바타 */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-text">
                      {item.github_id.substring(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      <span className="font-semibold text-blue-text hover:underline cursor-pointer">
                        {item.github_id}
                      </span>
                      님이{" "}
                      {item.changed_key ? (
                        <>
                          다음 키를 업데이트했습니다:{" "}
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-red-text">
                            {item.changed_key}
                          </code>
                        </>
                      ) : (
                        <>
                          버전{" "}
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-blue-text">
                            v{item.version_id}
                          </code>
                          {item.base_version_id !== undefined && (
                            <>
                              {" "}(기준:{" "}
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-gray-text">
                                v{item.base_version_id}
                              </code>
                              )
                            </>
                          )}
                          {" "}으로 업데이트했습니다.
                        </>
                      )}
                    </p>
                  </div>

                  {/* 날짜 */}
                  <div className="flex-shrink-0 whitespace-nowrap text-xs text-gray-text">
                    {format(new Date(item.created_at), "yyyy년 MM월 dd일 HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

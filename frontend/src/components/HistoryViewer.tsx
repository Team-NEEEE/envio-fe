import type { EnvHistory } from "@/store/mockData";
import { format } from "date-fns";
import { AlertCircle, GitCommitHorizontal, KeyRound, Loader2 } from "lucide-react";

interface HistoryViewerProps {
  history: EnvHistory[];
  loading?: boolean;
  error?: string | null;
}

export function HistoryViewer({ history, loading = false, error = null }: HistoryViewerProps) {
  const latestVersionId = history.reduce(
    (latestVersion, item) => Math.max(latestVersion, item.version_id),
    Number.NEGATIVE_INFINITY
  );

  const getVariableNames = (item: EnvHistory) => {
    const variableNames = Object.keys(item.encrypted_environment?.variables ?? {});

    if (variableNames.length > 0) {
      return variableNames;
    }

    return item.changed_key ? [item.changed_key] : [];
  };

  return (
    <div className="mt-6 border border-border rounded-md overflow-hidden bg-card">
      <div className="w-full bg-muted px-4 py-3 border-b border-border flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GitCommitHorizontal className="w-4 h-4 text-gray-text" />
          환경변수 변경 히스토리
          {!loading && !error && history.length > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-text/10 text-blue-text font-medium border border-blue-text/20">
              {history.length}
            </span>
          )}
        </h3>
      </div>

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
          {history.map((item) => {
            const variableNames = getVariableNames(item);
            const isLatestVersion = item.version_id === latestVersionId;

            return (
              <div
                key={item.histories_id}
                className={`p-4 transition-colors ${isLatestVersion ? "bg-blue-text/5" : "hover:bg-muted/30"}`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isLatestVersion ? "bg-blue-text text-white" : "bg-gray-200 text-gray-text dark:bg-gray-700"}`}>
                        v{item.version_id}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <span className="font-semibold text-blue-text">
                          {item.github_id}
                        </span>
                        님이 환경변수를 업데이트했습니다.
                        {isLatestVersion && (
                          <span className="ml-2 inline-flex rounded-full border border-blue-text/30 bg-blue-text/10 px-2 py-0.5 align-middle text-[10px] font-semibold text-blue-text">
                            최신 버전
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 whitespace-nowrap text-xs text-gray-text md:pt-1">
                    {format(new Date(item.created_at), "yyyy년 MM월 dd일 HH:mm")}
                  </div>
                </div>

                <div className="mt-4 rounded-md border border-border bg-background/60 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-text">
                    <KeyRound className="w-3.5 h-3.5" />
                    변경 변수 {variableNames.length > 0 ? `${variableNames.length}개` : ""}
                  </div>
                  {variableNames.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {variableNames.map((name) => (
                        <code
                          key={`${item.histories_id}-${name}`}
                          className="max-w-full rounded bg-muted px-2 py-1 text-xs font-semibold text-foreground break-all"
                        >
                          {name}
                        </code>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-text">
                      변경 변수 정보가 없습니다.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

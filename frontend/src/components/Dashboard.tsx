import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryViewer } from "./HistoryViewer";
import { ThemeToggle } from "./ThemeToggle";
import type { Organization, Repository, EnvHistory } from "@/store/mockData";
import { AlertCircle, BookMarked, FolderGit2, KeyRound, Loader2, LogOut, ShieldAlert } from "lucide-react";
import { Logo } from "./Logo";
import { format } from "date-fns";
import { getProjectDetail, getProjectHistory, type ProjectDetail } from "@/lib/api";

function formatApiDate(value?: string | null) {
  if (!value) return "-";

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, "yyyy년 MM월 dd일 HH:mm");
}

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);

  // CORE_PROJECT_001: 프로젝트 상세 관련 상태
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [projectDetailError, setProjectDetailError] = useState<string | null>(null);

  // CORE_HISTORY_001: 히스토리 관련 상태
  const [repoHistory, setRepoHistory] = useState<EnvHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // 조직 목록이 API에서 로드된 후 첫 번째 조직을 자동 선택
  useEffect(() => {
    if (user?.organizations?.length && !selectedOrgId) {
      setSelectedOrgId(user.organizations[0].id);
    }
  }, [user?.organizations, selectedOrgId]);

  // CORE_HISTORY_001: 레포지토리 선택 시 히스토리 API 호출
  useEffect(() => {
    if (!selectedRepoId) {
      setRepoHistory([]);
      setHistoryError(null);
      return;
    }

    let ignore = false;
    setHistoryLoading(true);
    setHistoryError(null);
    getProjectHistory(selectedRepoId)
      .then((data) => {
        if (!ignore) setRepoHistory(data);
      })
      .catch((err) => {
        if (ignore) return;
        console.error('[CORE_HISTORY_001] 히스토리 조회 실패:', err);
        setHistoryError('히스토리를 불러오는 데 실패했습니다.');
      })
      .finally(() => {
        if (!ignore) setHistoryLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedRepoId]);

  // CORE_PROJECT_001: 레포지토리 선택 시 프로젝트 상세 API 호출
  useEffect(() => {
    if (!selectedRepoId) {
      setProjectDetail(null);
      setProjectDetailError(null);
      return;
    }

    let ignore = false;
    setProjectDetail(null);
    setProjectDetailLoading(true);
    setProjectDetailError(null);

    getProjectDetail(selectedRepoId)
      .then((data) => {
        if (!ignore) setProjectDetail(data);
      })
      .catch((err) => {
        if (ignore) return;
        console.error('[CORE_PROJECT_001] 프로젝트 상세 조회 실패:', err);
        const message = err instanceof Error ? err.message : '프로젝트 상세 정보를 불러오는 데 실패했습니다.';
        setProjectDetailError(message);
      })
      .finally(() => {
        if (!ignore) setProjectDetailLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedRepoId]);

  if (!user) return null;

  const selectedOrg = user.organizations.find((org) => org.id === selectedOrgId);
  const selectedRepo = selectedOrg?.repositories.find((repo) => repo.id === selectedRepoId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Logo className="h-8 w-auto" />
          <span className="font-semibold text-lg tracking-tight">대시보드</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-border"
            />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="로그아웃">
            <LogOut className="w-5 h-5 text-gray-text hover:text-red-text transition-colors" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Organizations */}
        <aside className="w-64 border-r border-border bg-card/50 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-text uppercase tracking-wider mb-3">
              조직 (Organizations)
            </h2>
            <ul className="space-y-1">
              {user.organizations.map((org: Organization) => (
                <li key={org.id}>
                  <button
                    onClick={() => {
                      setSelectedOrgId(org.id);
                      setSelectedRepoId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${selectedOrgId === org.id
                      ? "bg-muted text-foreground font-medium"
                      : "text-gray-text hover:bg-muted/50 hover:text-foreground"
                      }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${org.role === "Leader"
                        ? "border-blue-text text-blue-text"
                        : "border-border text-gray-text"
                        }`}
                    >
                      {org.role === "Leader" ? "팀장" : "팀원"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content - Repositories */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {selectedOrg ? (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BookMarked className="w-6 h-6 text-gray-text" />
                  {selectedOrg.name} 레포지토리
                </h1>
                <p className="text-sm text-gray-text mt-1">
                  레포지토리를 선택하여 환경변수와 변경 히스토리를 확인하세요.
                </p>
              </div>

              {!selectedRepo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedOrg.repositories.map((repo: Repository) => (
                    <Card
                      key={repo.id}
                      className="cursor-pointer hover:border-blue-text transition-colors"
                      onClick={() => setSelectedRepoId(repo.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-text">
                          <FolderGit2 className="w-4 h-4" />
                          {repo.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-text flex items-center gap-1">
                          <KeyRound className="w-3 h-3" />
                          프로젝트 상세 정보 보기
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2 text-sm text-blue-text cursor-pointer hover:underline" onClick={() => setSelectedRepoId(null)}>
                    &larr; 레포지토리 목록으로 돌아가기
                  </div>

                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <FolderGit2 className="w-6 h-6 text-gray-text" />
                    <h2 className="text-xl font-bold">{projectDetail?.project_name ?? selectedRepo.name}</h2>
                  </div>

                  {/* Env Keys View */}
                  <Card>
                    <CardHeader className="bg-muted/30 border-b border-border">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-text" />
                        최근 환경변수 상태
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {projectDetailLoading && (
                        <div className="p-6 flex flex-col items-center justify-center gap-2 text-gray-text">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <p className="text-sm">프로젝트 최신 정보를 불러오는 중...</p>
                        </div>
                      )}

                      {!projectDetailLoading && projectDetailError && (
                        <div className="p-4 flex items-center gap-2 text-sm text-red-text bg-red-text/5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{projectDetailError}</span>
                        </div>
                      )}

                      {!projectDetailLoading && !projectDetailError && projectDetail && (
                        <dl className="divide-y divide-border">
                          <div className="flex items-center justify-between gap-4 p-4 hover:bg-muted/20">
                            <dt className="text-sm text-gray-text">프로젝트</dt>
                            <dd className="min-w-0 text-right">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {projectDetail.project_name}
                              </p>
                              <p className="truncate text-xs text-gray-text">
                                {projectDetail.organization_name}
                              </p>
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-4 p-4 hover:bg-muted/20">
                            <dt className="text-sm text-gray-text">최신 버전</dt>
                            <dd>
                              <code className="text-sm font-semibold text-blue-text bg-muted px-2 py-1 rounded">
                                v{projectDetail.version_id}
                              </code>
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-4 p-4 hover:bg-muted/20">
                            <dt className="text-sm text-gray-text">최근 업데이트</dt>
                            <dd className="text-right text-sm text-foreground">
                              {formatApiDate(projectDetail.updated_at)}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between gap-4 p-4 hover:bg-muted/20">
                            <dt className="text-sm text-gray-text">GitHub App</dt>
                            <dd className="max-w-[60%] truncate text-right text-sm text-foreground">
                              {projectDetail.github_app_id || "연동 정보 없음"}
                            </dd>
                          </div>
                          {projectDetail.description && (
                            <div className="p-4 hover:bg-muted/20">
                              <dt className="text-sm text-gray-text">설명</dt>
                              <dd className="mt-1 text-sm text-foreground">
                                {projectDetail.description}
                              </dd>
                            </div>
                          )}
                        </dl>
                      )}

                      {!projectDetailLoading && !projectDetailError && !projectDetail && (
                        <div className="p-6 text-center text-sm text-gray-text">
                          프로젝트 상세 정보가 없습니다.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* History View */}
                  <HistoryViewer
                    history={repoHistory}
                    loading={historyLoading}
                    error={historyError}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-text">
              사이드바에서 조직(Organization)을 선택해주세요.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

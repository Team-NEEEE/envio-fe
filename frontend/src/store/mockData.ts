export interface EnvHistory {
  histories_id: number;
  project_id: number;
  version_id: number;
  base_version_id?: number;
  github_id: string;
  created_at: string;
  changed_key: string;
}

export interface EnvKey {
  id: string;
  key: string;
  lastUpdated: string;
}

export interface Repository {
  id: number;
  name: string;
  envKeys: EnvKey[];
  history: EnvHistory[];
}

export interface Organization {
  id: string;
  name: string;
  role: "Leader" | "Member";
  repositories: Repository[];
}

export interface User {
  id: string;
  name: string;
  githubId: string;
  email?: string;
  role?: string;
  avatarUrl: string;
  organizations: Organization[];
}

export const mockUser: User = {
  id: "u-123",
  name: "Alex Developer",
  githubId: "alex-dev",
  avatarUrl: "https://github.com/github.png",
  organizations: [
    {
      id: "org-1",
      name: "Acme Corp",
      role: "Leader",
      repositories: [
        {
          id: 10,
          name: "frontend-dashboard",
          envKeys: [
            { id: "ek-1", key: "NEXT_PUBLIC_API_URL", lastUpdated: "2026-05-10T09:00:00" },
            { id: "ek-2", key: "STRIPE_SECRET_KEY", lastUpdated: "2026-05-12T14:30:00" },
          ],
          history: [
            {
              histories_id: 101,
              project_id: 10,
              version_id: 8,
              base_version_id: 7,
              github_id: "alex-dev",
              created_at: "2026-05-12T14:30:00",
              changed_key: "STRIPE_SECRET_KEY",
            },
            {
              histories_id: 100,
              project_id: 10,
              version_id: 7,
              base_version_id: 6,
              github_id: "octocat",
              created_at: "2026-05-10T09:00:00",
              changed_key: "NEXT_PUBLIC_API_URL",
            },
          ],
        },
        {
          id: 11,
          name: "backend-api",
          envKeys: [
            { id: "ek-3", key: "DATABASE_URL", lastUpdated: "2026-05-01T10:00:00" },
          ],
          history: [
            {
              histories_id: 200,
              project_id: 11,
              version_id: 2,
              base_version_id: 1,
              github_id: "alex-dev",
              created_at: "2026-05-01T10:00:00",
              changed_key: "DATABASE_URL",
            },
          ],
        },
      ],
    },
    {
      id: "org-2",
      name: "OpenSource Contributors",
      role: "Member",
      repositories: [
        {
          id: 20,
          name: "awesome-tool",
          envKeys: [
            { id: "ek-4", key: "GITHUB_TOKEN", lastUpdated: "2026-04-20T11:00:00" },
          ],
          history: [
            {
              histories_id: 300,
              project_id: 20,
              version_id: 5,
              base_version_id: 4,
              github_id: "dev-master",
              created_at: "2026-04-20T11:00:00",
              changed_key: "GITHUB_TOKEN",
            },
          ],
        },
      ],
    },
  ],
};

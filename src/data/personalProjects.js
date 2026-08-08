// 个人项目：置顶列表（自定义描述） + GitHub API 动态排序
// 置顶项目按自定义优先级排序，其余项目按 GitHub pushed_at 排序

import { PINNED_PERSONAL_PROJECTS } from "./pinnedProjects.js";

export { PINNED_PERSONAL_PROJECTS };

// 置顶项目的 URL → 自定义描述映射
const PINNED_OVERRIDES = new Map(
  PINNED_PERSONAL_PROJECTS.map((p) => [p.url, p])
);

const PERSONAL_PROJECT_PRIORITY = new Map([
  ["https://github.com/guliacer/SuYan", 0],
  ["https://github.com/guliacer/TapRelay-remote-adapter-test", 1],
]);

// 从 GitHub API 获取所有仓库，排序后合并
export async function fetchPersonalProjectsFromGithub() {
  try {
    const res = await fetch(
      `https://api.github.com/users/guliacer/repos?sort=pushed&per_page=100&type=owner`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();

    const pinnedRepos = [];
    const otherRepos = [];

    for (const repo of data) {
      if (PINNED_OVERRIDES.has(repo.html_url)) {
        pinnedRepos.push(repo);
      } else {
        otherRepos.push(repo);
      }
    }

    // 指定项目优先置顶，其余置顶仓库按 pushed_at 排序（最新优先）
    pinnedRepos.sort(
      (a, b) => {
        const aPriority = PERSONAL_PROJECT_PRIORITY.get(a.html_url);
        const bPriority = PERSONAL_PROJECT_PRIORITY.get(b.html_url);
        if (aPriority !== undefined || bPriority !== undefined) {
          if (aPriority === undefined) return 1;
          if (bPriority === undefined) return -1;
          return aPriority - bPriority;
        }
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      }
    );

    // 合并：排序后的置顶 + 其他仓库
    const pinnedCards = pinnedRepos.map((repo) => {
      const override = PINNED_OVERRIDES.get(repo.html_url);
      return {
        title: override.title || repo.name,
        domain: "github.com",
        url: repo.html_url,
        description: override.description,
        tags: override.tags || buildTags(repo),
        images: override.images,
        updatedAt: repo.pushed_at || repo.updated_at,
      };
    });

    const otherCards = otherRepos.map((repo) => ({
      title: repo.name,
      domain: "github.com",
      url: repo.html_url,
      description: repo.description || "暂无描述",
      tags: buildTags(repo),
      updatedAt: repo.pushed_at || repo.updated_at,
    }));

    return [...pinnedCards, ...otherCards];
  } catch (e) {
    console.warn("GitHub 仓库拉取失败，使用静态数据:", e.message);
    return PINNED_PERSONAL_PROJECTS;
  }
}

function buildTags(repo) {
  const tags = ["个人项目"];
  if (repo.language) tags.push(repo.language);
  if (repo.stargazers_count > 0) tags.push(`★ ${repo.stargazers_count}`);
  if (repo.forks_count > 10) tags.push("Fork");
  return tags;
}

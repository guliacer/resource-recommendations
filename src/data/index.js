import { PINNED_PERSONAL_PROJECTS } from "./pinnedProjects.js";
import { fetchPersonalProjectsFromGithub } from "./personalProjects.js";
import { friendProjectRecommendations } from "./friendProjects.js";
import { apiSites } from "./apiSites.js";
import { proxySiteRecommendations } from "./proxySites.js";
import { imageGenSiteRecommendations } from "./imageGenSites.js";
import { promptSiteRecommendations } from "./promptSites.js";

// 静态条目的日期表示最后一次核验，而不是第三方网站自身的内容更新时间。
export const CATALOG_UPDATED_AT = "2026-08-04";

// 静态分类（不需要 API）
const staticSections = [
  {
    id: "friend-projects",
    title: "友情项目",
    description: "推荐的 ComfyUI 启动器、提示词优化工具和知识库。",
    items: friendProjectRecommendations,
  },
  {
    id: "proxy-sites",
    title: "代理推荐",
    description: "多客户端可用的代理服务，支持多种套餐。",
    items: proxySiteRecommendations,
  },
  {
    id: "api-free",
    title: "免费 API",
    description: "无需付费即可使用的 API 中转站。",
    items: apiSites.free,
  },
  {
    id: "api-paid",
    title: "收费 API",
    description: "按量计费的 API 中转站。",
    items: apiSites.paid,
  },
  {
    id: "prompt-sites",
    title: "提示词网站推荐",
    description: "常用提示词社区、图像灵感库和官方提示词资料。",
    items: promptSiteRecommendations,
  },
  {
    id: "image-gen-sites",
    title: "生图网站推荐",
    description: "综合助手、专业绘画、设计工具和模型社区，多为免费额度的在线生图平台。",
    items: imageGenSiteRecommendations,
  },

];

// 个人项目：异步合并置顶 + GitHub API
let _personalSection = null;
let _personalPromise = null;

export async function loadPersonalSection() {
  if (_personalSection) return _personalSection;
  if (_personalPromise) return _personalPromise;

  _personalPromise = fetchPersonalProjectsFromGithub().then((items) => {
    _personalSection = {
      id: "personal-projects",
      title: "个人项目",
      description: "自研节点、脚本和小工具，覆盖图像抓取、网页效率、传图与信息聚合。",
      items,
    };
    return _personalSection;
  });

  return _personalPromise;
}

export function getPersonalSectionSync() {
  return _personalSection || {
    id: "personal-projects",
    title: "个人项目",
    description: "自研节点、脚本和小工具，覆盖图像抓取、网页效率、传图与信息聚合。",
    items: [...PINNED_PERSONAL_PROJECTS],
  };
}

export function getAllSectionsSync() {
  return [getPersonalSectionSync(), ...staticSections];
}

export { sections as staticSections };

// 旧的同步接口——用于不需要 GitHub 的地方（如统计面板）
export const sections = getAllSectionsSync();

export function getAllItems() {
  return sections.flatMap((s) => s.items.map((item) => ({ ...item, sectionId: s.id })));
}


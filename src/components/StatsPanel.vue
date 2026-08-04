<template>
  <section class="stats-panel" aria-label="统计概览">
    <div class="stats-kpi">
      <div class="kpi-tile kpi-total">
        <span class="kpi-value">{{ total }}</span>
        <span class="kpi-label">推荐总数</span>
      </div>
      <div
        v-for="sec in displaySections"
        :key="sec.id"
        class="kpi-tile"
      >
        <span class="kpi-value">{{ sec.items.length }}</span>
        <span class="kpi-label" :title="sec.title">{{ shortName(sec.title) }}</span>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <h3 class="chart-title">分类占比</h3>
        <div class="chart-body donut-body">
          <div class="donut-side">
            <div class="donut-wrap">
              <VChart :option="pieOption" autoresize />
            </div>
          </div>
          <div class="donut-legend">
            <div v-for="entry in chartData" :key="entry.name" class="legend-item">
              <span class="legend-dot" :style="{ background: entry.color }"></span>
              <span class="legend-name" :title="entry.name">{{ entry.name }}</span>
              <span class="legend-val">{{ entry.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">标签 Top 10</h3>
        <div class="chart-body bar-body">
          <VChart :option="barOption" autoresize />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { use } from "echarts/core";
import { PieChart, BarChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import { loadPersonalSection, staticSections } from "../data/index.js";
import { PINNED_PERSONAL_PROJECTS } from "../data/pinnedProjects.js";

use([PieChart, BarChart, TooltipComponent, GridComponent, CanvasRenderer]);

const SHORT_NAMES = {
  "个人项目": "个人",
  "友情项目": "友情",
  "免费 API": "免费API",
  "收费 API": "收费API",
  "提示词网站推荐": "提示词",
  "生图网站推荐": "生图",
  "代理推荐": "代理",
};
function shortName(title) {
  return SHORT_NAMES[title] ?? title;
}

// 先定义 ref，再在 computed 中引用
const displaySections = ref([
  {
    id: "personal-projects",
    title: "个人项目",
    description: "自研节点、脚本和小工具，覆盖图像抓取、网页效率、传图与信息聚合。",
    items: [...PINNED_PERSONAL_PROJECTS],
  },
  ...staticSections,
]);

onMounted(async () => {
  const personal = await loadPersonalSection();
  const idx = displaySections.value.findIndex((s) => s.id === "personal-projects");
  if (idx !== -1) {
    displaySections.value = [
      personal,
      ...displaySections.value.filter((s) => s.id !== "personal-projects"),
    ];
  }
});

const total = computed(() =>
  displaySections.value.reduce((s, sec) => s + sec.items.length, 0)
);

const PIE_COLORS = [
  "#2a78d6", "#eb6834", "#1baf7a", "#eda100",
  "#e87ba4", "#4a3aa7", "#008300", "#e34948",
];

const chartData = computed(() =>
  displaySections.value.map((sec, i) => ({
    name: sec.title,
    value: sec.items.length,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }))
);

const tagChartData = computed(() => {
  const map = {};
  displaySections.value.forEach((sec) => {
    sec.items.forEach((item) => {
      (item.tags || []).forEach((tag) => {
        map[tag] = (map[tag] || 0) + 1;
      });
    });
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
});

function getCSSColor(varName) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
    "#6f867e"
  );
}

const pieOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "item",
    formatter: (p) => `${p.name}<br/>${p.value} 个 (${p.percent.toFixed(1)}%)`,
    backgroundColor: getCSSColor("--surface-1"),
    borderColor: getCSSColor("--border-strong"),
    borderWidth: 1,
    borderRadius: 8,
    padding: [6, 10],
    textStyle: { color: getCSSColor("--text-primary"), fontSize: 12 },
  },
  series: [
    {
      type: "pie",
      radius: ["42%", "70%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      data: chartData.value.map((d) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: d.color },
      })),
    },
  ],
}));

const barOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (p) => `${p[0].name}<br/>${p[0].value} 次`,
    backgroundColor: getCSSColor("--surface-1"),
    borderColor: getCSSColor("--border-strong"),
    borderWidth: 1,
    borderRadius: 8,
    padding: [6, 10],
    textStyle: { color: getCSSColor("--text-primary"), fontSize: 12 },
  },
  grid: { left: 86, right: 12, top: 4, bottom: 4 },
  xAxis: { type: "value", show: false },
  yAxis: {
    type: "category",
    data: tagChartData.value.map((d) => d.tag).reverse(),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: getCSSColor("--text-secondary"),
      fontSize: 11,
      width: 80,
      overflow: "truncate",
    },
  },
  series: [
    {
      type: "bar",
      data: tagChartData.value.map((d) => d.count).reverse(),
      itemStyle: { color: getCSSColor("--accent"), borderRadius: [0, 4, 4, 0] },
      barMaxWidth: 12,
      emphasis: { itemStyle: { color: getCSSColor("--accent-strong") } },
    },
  ],
}));
</script>

<style scoped>

.stats-panel { display: flex; flex-direction: column; gap: 0.875rem; }
.stats-kpi { display: grid; grid-template-columns: auto repeat(7, 1fr); gap: 0.5rem; }
.kpi-tile {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 0.625rem 0.5rem; background: var(--surface-1);
  border: 1px solid var(--border-strong); border-radius: 0.625rem;
  gap: 0.25rem; min-width: 0;
}
.kpi-total { background: var(--primary-soft); border-color: color-mix(in srgb, var(--primary) 30%, transparent); flex-shrink: 0; }
.kpi-value { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); font-variant-numeric: tabular-nums; line-height: 1; white-space: nowrap; }
.kpi-label { font-size: 0.6875rem; color: var(--text-muted); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; display: block; }
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
@media (max-width: 640px) { .charts-row { grid-template-columns: 1fr; } .stats-kpi { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 420px) { .stats-kpi { grid-template-columns: repeat(2, 1fr); } }
.chart-card { background: var(--surface-1); border: 1px solid var(--border-strong); border-radius: 0.625rem; overflow: hidden; }
.chart-title { margin: 0; padding: 0.625rem 0.875rem 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-hairline); }
.chart-body { padding: 0.625rem 0.875rem 0.75rem; }
.donut-body { display: flex; gap: 0.75rem; align-items: center; justify-content: center; }
.donut-wrap { width: 150px; height: 150px; flex-shrink: 0; }
.donut-side { display: flex; align-items: center; justify-content: flex-start; min-width: 0; }
.donut-legend { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; min-width: 120px; max-width: 160px; overflow: hidden; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; min-width: 0; flex-shrink: 0; justify-content: space-between; width: 100%; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-name { color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; flex: 1; min-width: 0; }
.legend-val { color: var(--text-muted); font-variant-numeric: tabular-nums; font-weight: 600; flex-shrink: 0; }
.bar-body { height: 168px; }

</style>

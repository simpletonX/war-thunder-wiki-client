<template>
  <aside class="debug-panel" :class="{ collapsed: !expanded }">
    <button class="debug-header" type="button" @click="expanded = !expanded">
      <span>开发调试面板</span>
      <span class="debug-toggle">{{ expanded ? "收起" : "展开" }}</span>
    </button>

    <div v-show="expanded" class="debug-body">
      <section class="debug-section params-section">
        <div class="section-title">算法传入参数</div>
        <pre>{{ formatValue(plannerParams) }}</pre>
      </section>

      <section class="debug-section start-section">
        <div class="section-title">科技树类型信息</div>
        <pre>{{ formatValue(startInfo) }}</pre>
      </section>

      <section class="debug-section warning-section">
        <div class="section-title">规划算法警告</div>
        <div v-if="!translatedWarnings.length" class="no-warning">
          暂无算法警告
        </div>
        <ol v-else>
          <li v-for="(warning, index) in translatedWarnings" :key="index">
            {{ warning }}
          </li>
        </ol>
      </section>

      <button class="copy-button" type="button" @click="copyDebugInfo">
        {{ copyStatus }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";

const expanded = ref(false);
const plannerParams = ref(null);
const startInfo = ref(null);
const warnings = ref([]);
const copyStatus = ref("复制调试信息");
let copyStatusTimer = null;

function cloneForDebug(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

function beginPlanning(params, context = {}) {
  // 每次规划直接覆盖上一次调试信息。
  plannerParams.value = cloneForDebug(params);
  startInfo.value = cloneForDebug(context);
  warnings.value = [];
  copyStatus.value = "复制调试信息";
  expanded.value = true;
}

function setWarnings(value) {
  warnings.value = Array.isArray(value) ? cloneForDebug(value) : [String(value)];
}

function translateWarning(warning) {
  const text = String(warning);
  const translations = [
    [/^Dependency cycle detected at (.+)$/, "检测到载具依赖循环，涉及载具：$1。"],
    [/^Planned premium vehicle was not found: (.+)$/, "未在当前科技树中找到预设高级载具：$1。"],
    [/^Owned researchable vehicle was not found: (.+)$/, "未在当前科技树中找到标记为已拥有的可研发载具：$1。"],
    [/^Target is not a researchable vehicle: (.+)$/, "目标不是当前科技树中的可研发载具：$1。"],
    [/^No valid research target was provided\.$/, "没有提供有效的可研发目标载具。"],
    [/^Priority route search reached the iteration limit before finding a valid route\.$/, "优先路线搜索已达到最大迭代次数，但仍未找到有效路线。"],
    [/^No valid priority route satisfies rank requirements and dependencies\.$/, "没有路线能够同时满足等级解锁数量和载具依赖要求。"],
    [/^Priority route search reached the iteration limit; the returned route is valid but may not be optimal\.$/, "优先路线搜索已达到最大迭代次数；当前路线有效，但不保证是最优结果。"],
    [/^No legal route could include priority columns: (.+)$/, "没有合法路线能够包含指定的优先列：$1。"],
    [/^Route search reached the iteration limit before finding a valid route\.$/, "最短路线搜索已达到最大迭代次数，但仍未找到有效路线。"],
    [/^No valid route satisfies rank requirements and dependencies\.$/, "没有路线能够同时满足等级解锁数量和载具依赖要求。"],
    [/^Route search reached the iteration limit; the returned route is valid but may not be the shortest\.$/, "最短路线搜索已达到最大迭代次数；当前路线有效，但不保证研发点总量最低。"],
  ];

  for (const [pattern, replacement] of translations) {
    if (pattern.test(text)) return text.replace(pattern, replacement);
  }

  return text.match(/[\u4e00-\u9fff]/)
    ? text
    : `算法返回了未识别的警告：${text}`;
}

const translatedWarnings = computed(() =>
  warnings.value.map(translateWarning),
);

function formatValue(value) {
  if (value == null) return "尚未执行一键规划";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function getDebugText() {
  const warningText = translatedWarnings.value.length
    ? translatedWarnings.value.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "暂无算法警告";

  return [
    "【一键规划完整参数】",
    formatValue(plannerParams.value),
    "",
    "【开始执行一键规划】",
    formatValue(startInfo.value),
    "",
    "【规划算法警告】",
    warningText,
  ].join("\n");
}

async function copyDebugInfo() {
  const text = getDebugText();

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  copyStatus.value = "已复制调试信息";
  clearTimeout(copyStatusTimer);
  copyStatusTimer = setTimeout(() => {
    copyStatus.value = "复制调试信息";
  }, 1600);
}

onUnmounted(() => {
  clearTimeout(copyStatusTimer);
});

defineExpose({ beginPlanning, setWarnings });
</script>

<style scoped>
.debug-panel {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 200;
  width: min(520px, calc(100vw - 32px));
  color: #e8eef0;
  border: 1px solid rgba(151, 190, 201, 0.35);
  border-radius: 10px;
  background: rgba(15, 22, 25, 0.96);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.debug-panel.collapsed {
  width: 190px;
}

.debug-header {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  color: #fff;
  background: rgba(67, 91, 98, 0.65);
  border: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.debug-toggle {
  color: #a9c5cd;
  font-size: 12px;
  font-weight: 400;
}

.debug-body {
  max-height: min(68vh, 720px);
  overflow: auto;
  padding: 10px;
}

.debug-section {
  margin-bottom: 10px;
  padding: 9px;
  border-left: 3px solid #71929b;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.045);
}

.params-section {
  border-left-color: #d5ad55;
}

.start-section {
  border-left-color: #69b77b;
}

.warning-section {
  border-left-color: #d96b6b;
}

.section-title {
  margin-bottom: 7px;
  color: #d9e4e7;
  font-size: 12px;
  font-weight: 700;
}

pre,
li,
.no-warning {
  color: #c5d3d7;
  font-size: 11px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

pre {
  margin: 0;
  white-space: pre-wrap;
}

ol {
  margin: 0;
  padding-left: 20px;
}

.no-warning {
  color: #7f969d;
}

.copy-button {
  width: 100%;
  height: 34px;
  color: #e8eef0;
  border: 1px solid rgba(151, 190, 201, 0.3);
  border-radius: 6px;
  background: rgba(82, 110, 118, 0.35);
  cursor: pointer;
  font-size: 12px;
}

.copy-button:hover {
  background: rgba(95, 130, 139, 0.5);
}
</style>

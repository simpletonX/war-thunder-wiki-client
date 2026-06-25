<template>
  <!-- 背景 -->
  <div
    class="content-background-promo w-[100vw] h-[100vh] fixed top-0 left-0 z-[-1]"
    :class="{
      'blur-0': settings.blur_number == 0,
    }"
  >
    <div
      class="content-background-promo-mask w-[100vw] h-[100vh] absolute top-0 left-0"
      :style="{
        backdropFilter: `blur(${settings.blur_number}px)`,
      }"
    ></div>
    <video
      v-if="current_bg_img.type == 'video'"
      autoplay
      muted
      loop
      :src="current_bg_img.url"
      class="bg-liner"
    />
    <img
      v-else-if="current_bg_img.type == 'image'"
      :src="current_bg_img.url"
      class="bg-liner"
    />
    <div
      v-else
      class="w-full h-full bg-liner"
      :style="{
        backgroundColor: current_bg_img.color,
      }"
    ></div>
  </div>

  <!-- 导出图像前，添加.screenshot-state类名 -->
  <div
    class="container-main"
    :class="{
      'screenshot-state': screenshot_state,
    }"
  >
    <!-- 载具军种切换tab栏 -->
    <!-- <div class="fill-placeholder h-[66px]"></div> -->
    <wt_type_tabs
      :vt="types.vehicle_type"
      v-model:pt="currentPointsType"
      @update:vt="(val) => updateTypes('vehicle_type', val)"
      @clear="requestTreeData"
      @automatic-calculate="automatic_options_visible = true"
      @exportImage="exportImage"
      @update:totals="handleTotals"
    />

    <!-- 科技树主体 -->
    <div class="wt-tree w-[1350px] mx-auto relative" ref="wt_tree">
      <!-- 遮罩层，解决因backdrop-filter带来的包含块对fixed定位的影响 -->
      <div class="backdrop-filter"></div>

      <div class="tree-area pb-[100px] pt-[22px]" v-if="tree_data?.length">
        <!-- 每个等级 -->
        <!-- 全局通用遮罩层 -->
        <public_mask />
        <div
          class="rank-item px-3 relative"
          v-for="(rankItem, rankIndex) in tree_data"
          :key="rankItem.rank"
        >
          <div
            class="absolute left-0 top-0 rank-title w-[70%] flex justify-between items-center"
          >
            <div class="rank-rpsp-total flex items-center">
              <span class="text-[#c3c3c3bf] text-[13px]"
                >Rank {{ rankItem.rank }}</span
              >

              <div class="flex rank-sprps text-[13px] ml-4">
                <span class="rps">{{
                  settings.math_format == "thousands_separator"
                    ? parseNumber(rankStats[rankItem.rank]?.rp, true)
                    : formatChineseNumber(rankStats[rankItem.rank]?.rp, true)
                }}</span>
                <img :src="`/static/rp.png`" class="w-[16px] mr-1" />
                <span>/</span>
                <span class="sps ml-2">{{
                  settings.math_format == "thousands_separator"
                    ? parseNumber(rankStats[rankItem.rank]?.sp, true)
                    : formatChineseNumber(rankStats[rankItem.rank]?.sp, true)
                }}</span>
                <img :src="`/static/war-points.png`" class="w-[18px]" />
              </div>
            </div>
          </div>

          <div
            :hidden="rankIndex == tree_data.length - 1"
            class="unlock-quantity absolute top-[calc(50%-15px)] left-[8px] text-[12px] w-[30px] h-[30px] bg-[rgba(255,255,255,.05)] rounded-full flex justify-center items-center text-[rgba(255,255,255,.75)]"
          >
            {{
              rankStats[rankItem.rank]?.count > current_uq[rankItem.rank]
                ? current_uq[rankItem.rank]
                : rankStats[rankItem.rank]?.count
            }}/{{ current_uq[rankItem.rank] }}
          </div>
          <div class="wt-tree-instance pr-4 pl-12 flex justify-between">
            <!-- 普通载具 -->
            <div
              class="researchable-instance flex justify-center w-full pt-[40px]"
            >
              <div
                class="wt-tree-column mx-2 w-[156px]"
                v-for="(columnItem, colIndex) in rankItem.researchable_vehicles"
                :key="`r-col-${rankIndex}-${colIndex}`"
              >
                <wt_tree_item
                  v-for="(item, rowIndex) in columnItem"
                  :key="item?.data_unit_id || `r-${colIndex}-${rowIndex}`"
                  :item="item"
                  :isPremium="false"
                  :isDefault="true"
                  :colIndex="colIndex"
                  :currentPointsType="currentPointsType"
                  :arrow_points="arrow_points_map[item.data_unit_id]"
                  :targetVehicleIds="targetVehicleIds"
                  :ownedVehicleIds="ownedVehicleIds"
                  @open-fast-funcs="openFastFuncs"
                />
                <!-- 如果 columnItem 为空数组依旧会渲染占位列（无 item） -->
              </div>
            </div>

            <div class="vertical-split-line w-[1px] bg-[#444] mx-6"></div>

            <!-- 高级载具 -->
            <div class="premium-instance flex justify-between pt-[40px]">
              <div
                class="wt-tree-column mx-2 w-[156px]"
                v-for="(columnItem, colIndex) in rankItem.premium_vehicles"
                :key="`p-col-${rankIndex}-${colIndex}`"
              >
                <wt_tree_item
                  v-for="(item, rowIndex) in columnItem"
                  :key="item?.data_unit_id || `p-${colIndex}-${rowIndex}`"
                  :item="item"
                  :isPremium="true"
                  :currentPointsType="currentPointsType"
                  :arrow_points="arrow_points_map[item.data_unit_id]"
                  :targetVehicleIds="targetVehicleIds"
                  :ownedVehicleIds="ownedVehicleIds"
                  @open-fast-funcs="openFastFuncs"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="screenshot-core-info mt-6" v-if="screenshot_state">
          <div class="flex justify-center">
            <div class="total_rel flex items-center">
              <span class="mr-1"
                >除去已拥有载具总计：{{ currentTotals?.prp }}</span
              >
              <img :src="`/static/rp.png`" width="18" />
              <span class="mr-1">&nbsp;/&nbsp;{{ currentTotals?.psp }}</span>
              <img :src="`/static/war-points.png`" width="18" />
            </div>
            <div class="total_abs flex items-center ml-10">
              <span class="mr-1">载具整体总计：{{ currentTotals?.crp }}</span>
              <img :src="`/static/rp.png`" width="18" />
              <span class="mr-1">&nbsp;/&nbsp;{{ currentTotals?.csp }}</span>
              <img :src="`/static/war-points.png`" width="18" />
            </div>
          </div>
          <div class="flex justify-center items-center mt-5">
            <div
              class="country-icon"
              v-html="country_icons[types.country_code]"
            ></div>
            <span class="pt-[1px]">
              {{ country_code_texts[types.country_code] }} ·
              {{ vehicle_type_texts[types.vehicle_type] }}
            </span>
            <span class="mx-4">|</span>
            <span>数据库版本号 {{ db_version }}</span>
            <div class="mx-4">|</div>
            <span>数据库更新日期 {{ db_update_date }}</span>
          </div>
          <div class="flex justify-center items-center mt-6">
            <img :src="`/favicon.ico`" class="w-[46px] h-[39px] mr-1" />
            <span class="pt-[1px]">RP-Calculator v{{ version }}</span>
            <div
              class="border-[1px] border-solid border-[rgba(255,255,255,0.1)] px-[10px] py-[5px] ml-2 rounded-[10px] flex items-center"
            >
              <PhMagnifyingGlass :size="22" />
              <span class="ml-2 pt-[1px] pr-1"
                >https://blind-thunder.wiki/</span
              >
            </div>
          </div>
        </div>
      </div>

      <div
        class="blank-fill z-10 relative w-full flex justify-center pt-[200px]"
        v-else
      >
        <img :src="`/static/unlink.svg`" class="w-[18px] mr-2" />
        <span class="opacity-50 mt-1">该类型科技树暂无数据</span>
      </div>

      <!-- 国家切换tab栏 -->
      <wt_country_tabs
        :modelValue="types.country_code"
        @update:modelValue="(val) => updateTypes('country_code', val)"
      />
    </div>
  </div>

  <!-- 当前数据库更新时间与版本号 -->
  <div
    class="fixed bottom-2 left-[46px] text-white flex justify-center items-center text-[11px] opacity-60 w-full"
  >
    <img :src="`/static/database-network.svg`" />
    <a
      href="https://warthunder.com/zh/game/changelog/current/675"
      target="_blank"
      class="ml-2 pt-[4px]"
      >当前数据库对应的游戏版本号：{{ db_version }}</a
    >
    <span class="ml-3 pt-[4px]">更新于 {{ db_update_date }}</span>
  </div>

  <!-- 恢复自动计算前的手动选择状态 -->
  <button
    v-if="automaticPlanningSnapshot"
    type="button"
    class="automatic-rollback-button"
    title="恢复到自动计算前"
    aria-label="恢复到自动计算前"
    @click="rollbackAutomaticPlanning"
  >
    <PhArrowCounterClockwise :size="18" weight="bold" />
    <span>回退</span>
  </button>

  <!-- 全局加载动画 -->
  <public_loading
    :modelValue="loading_visible"
    v-if="settings.loading_animation"
  />

  <!-- 全局唯一的载具快捷功能栏 -->
  <wt_tree_item_fast_funcs
    :visible="fastFuncsState.visible"
    :anchorRect="fastFuncsState.anchorRect"
    :showAsTarget="showFastAsTarget"
    :isTarget="currentFastIsTarget"
    @automatic-planning="handleFastAutomaticPlanning"
    @set-target="handleFastSetTarget"
    @jump-details="handleFastJumpDetails"
    @close="closeFastFuncs"
  />

  <!-- 载具详情页组件 -->
  <wt_item_details v-model="detail_visible" :item="current_detail_item">
  </wt_item_details>

  <!-- 开发调试信息 -->
  <development_debug_panel v-if="settings.developer_mode" ref="debugPanelRef" />

  <!-- 自动计算列偏好、策略模式选择dialog -->
  <automatic_options
    v-model="automatic_options_visible"
    v-model:priorityList="priorityList"
    v-model:ignore_multiple="ignore_multiple"
    :priorityVehicleList="priorityVehicleList"
    :priority_mode="priority_mode"
    :ignoreColumns="ignoreColumns"
    @automatic-calculate="runAutomaticPlanning"
    @toggle-priority-mode="togglePriorityMode"
  ></automatic_options>

  <!-- 更新公告 -->
  <update_notice
    v-model="notice_visible"
    :version="version"
  ></update_notice>

  <!-- 用户协议 -->
  <user_agreement
    @close="updateAgreementAccepted"
    v-if="!agreement_accepted?.read"
  ></user_agreement>
</template>

<script setup>
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  toRaw,
  watch,
} from "vue";
import wt_tree_item from "@/components/wt_tree_item.vue";
import wt_country_tabs from "@/components/wt_country_tabs.vue";
import wt_type_tabs from "@/components/wt_type_tabs.vue";
import public_mask from "@/components/public_mask.vue";
import { useTreeDataStore } from "@/stores/tree_data_store";
import { storeToRefs } from "pinia";
import {
  createArrowPointsMap,
  createResearchableSet,
  createVehicleCostMap,
  findShortestPathToVehicleWorker,
  formatChineseNumber,
  getColumnBoundaryVehicles,
  parseNumber,
  toggleSelectColumnAbove,
} from "@/utils/treeDataUtils";
import {
  unlock_quantitys,
  preset_wallpapers,
  country_code_texts,
  vehicle_type_texts,
} from "@/utils/dict";
import { getTreeDataLocal } from "@/api/tree_data";
import Wt_item_details from "@/components/wt_item_details.vue";
import public_loading from "@/components/public_loading.vue";
import wt_tree_item_fast_funcs from "@/components/wt_tree_item_fast_funcs.vue";
import {
  PhArrowCounterClockwise,
  PhMagnifyingGlass,
} from "@phosphor-icons/vue";
import User_agreement from "@/components/user_agreement.vue";
import { country_icons } from "@/utils/icon_svgs";
import { toPng } from "html-to-image";
import update_notice from "@/components/update_notice.vue";

const development_debug_panel = defineAsyncComponent(
  () => import("@/components/development_debug_panel.vue"),
);

/** stores初始化 */
const treeDataStore = useTreeDataStore();
const {
  updateTreeData,
  updateTypes,
  updateVehicleCostMap,
  updateResearchableSet,
  updateSelectedStateMapAllLocal,
  updateOwnedVehicleIds,
  loading,
  updateAgreementAccepted,
  checkAndShowUpdateNotice,
} = treeDataStore;
const {
  tree_data,
  settings,
  types,
  rankStats,
  loading_visible,
  selected_state_map,
  owned_vehicle_ids: ownedVehicleIds,
  agreement_accepted,
} = storeToRefs(treeDataStore);

const targetVehicleIds = ref(new Set());
const debugPanelRef = ref(null);
const fastFuncsState = ref({
  visible: false,
  item: null,
  isPremium: false,
  colIndex: null,
  anchorRect: null,
});

const wt_tree = ref(null);
const screenshot_state = ref(false);
async function exportImage() {
  if (!wt_tree.value) return;
  loading.show();
  screenshot_state.value = true;

  await nextTick();
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);

  const dataUrl = await toPng(wt_tree.value, {
    cacheBust: true,
    backgroundColor: "#20303a",
    pixelRatio: 2,
    useCORS: true,
  });

  const link = document.createElement("a");
  link.download = "card.png";
  link.href = dataUrl;
  link.click();
  screenshot_state.value = false;

  await nextTick();
  loading.hide();
}
const currentTotals = ref({});
function handleTotals(total) {
  currentTotals.value = total;
}
const db_version = import.meta.env.VITE_APP_DB_VERSION;
const db_update_date = import.meta.env.VITE_APP_DB_UPDATE_DATE;
const version = import.meta.env.VITE_APP_VERSION;

const showFastAsTarget = computed(() => {
  const { item, isPremium } = fastFuncsState.value;
  return (
    ["ground", "aviation"].includes(types.value.vehicle_type) &&
    !isPremium &&
    !!item?.data_unit_id &&
    !selected_state_map.value[item.data_unit_id]
  );
});
const currentFastIsTarget = computed(() => {
  const item = fastFuncsState.value.item;
  return getFastItemVehicleIds(item).some((id) =>
    targetVehicleIds.value.has(id),
  );
});

function getFastItemVehicleIds(item) {
  if (!item) return [];
  return [
    item.data_unit_id,
    ...(item.items || []).map((child) => child?.data_unit_id),
  ].filter(Boolean);
}

watch(
  selected_state_map,
  (selected) => {
    const remainingTargets = [...targetVehicleIds.value].filter(
      (id) => !selected?.[id],
    );
    if (remainingTargets.length !== targetVehicleIds.value.size) {
      targetVehicleIds.value = new Set(remainingTargets);
    }
  },
  { deep: true },
);

function openFastFuncs(payload) {
  fastFuncsState.value = { visible: true, ...payload };
}

function closeFastFuncs() {
  fastFuncsState.value.visible = false;
}

function handleFastAutomaticPlanning() {
  const item = fastFuncsState.value.item;
  if (!item) return;

  toggleSelectColumnAbove({
    tree_data,
    clicked_item: item,
    selected_state_map,
  });
}

function handleFastSetTarget() {
  const { item, isPremium } = fastFuncsState.value;
  if (
    isPremium ||
    !item?.data_unit_id ||
    selected_state_map.value[item.data_unit_id]
  ) {
    return;
  }

  const nextTargetIds = new Set(targetVehicleIds.value);
  const itemVehicleIds = getFastItemVehicleIds(item);
  const existingTargetIds = itemVehicleIds.filter((id) =>
    nextTargetIds.has(id),
  );
  if (existingTargetIds.length) {
    for (const id of existingTargetIds) nextTargetIds.delete(id);
  } else {
    nextTargetIds.add(item.data_unit_id);
  }
  targetVehicleIds.value = nextTargetIds;
}

function handleFastJumpDetails() {
  const item = fastFuncsState.value.item;
  if (item) jumpItemDetailPage(item);
}

function collectSelectedPlanningVehicles() {
  const selected = selected_state_map.value || {};
  const ownedResearchIds = new Set();
  const plannedPremiumIds = new Set();

  const collect = (items, targetSet) => {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (item?.type === "multiple") {
        collect(item.items, targetSet);
      } else if (item?.data_unit_id && selected[item.data_unit_id]) {
        targetSet.add(item.data_unit_id);
      }
    }
  };

  for (const rank of Array.isArray(tree_data.value) ? tree_data.value : []) {
    for (const column of rank.researchable_vehicles || []) {
      collect(column, ownedResearchIds);
    }
    for (const column of rank.premium_vehicles || []) {
      collect(column, plannedPremiumIds);
    }
  }

  return {
    ownedResearchIds: [...ownedResearchIds],
    plannedPremiumIds: [...plannedPremiumIds],
  };
}

const automatic_options_visible = ref(false);
const priorityVehicleList = ref([]);
const priorityList = ref([]);
const priority_mode = ref("hard");
const ignore_multiple = ref(false);
const automaticPlanningSnapshot = ref(null);
const ignoreColumns = computed(() => {
  const targets = targetVehicleIds.value;
  const columns = new Set();

  for (const rank of Array.isArray(tree_data.value) ? tree_data.value : []) {
    for (const [columnIndex, column] of (
      rank.researchable_vehicles || []
    ).entries()) {
      const containsTarget = (column || []).some((item) =>
        getFastItemVehicleIds(item).some((id) => targets.has(id)),
      );
      if (containsTarget) columns.add(columnIndex);
    }
  }

  return [...columns].sort((a, b) => a - b);
});

watch(ignoreColumns, (columns) => {
  const ignored = new Set(columns);
  const availablePriorities = priorityList.value.filter(
    (columnIndex) => !ignored.has(columnIndex),
  );
  if (availablePriorities.length !== priorityList.value.length) {
    priorityList.value = availablePriorities;
  }
});

function togglePriorityMode(_priority_mode) {
  priority_mode.value = _priority_mode;
}

// 调用一键规划算法
async function runAutomaticPlanning() {
  const selected = selected_state_map.value || {};
  const targetIds = [...targetVehicleIds.value].filter((id) => !selected[id]);
  targetVehicleIds.value = new Set(targetIds);

  if (!targetIds.length) {
    return alert("未指定任何目标载具");
  }

  const { ownedResearchIds, plannedPremiumIds } =
    collectSelectedPlanningVehicles();
  const params = {
    targets: targetIds.map((data_unit_id) => ({ data_unit_id })),
    planned_prems: plannedPremiumIds.map((data_unit_id) => ({ data_unit_id })),
    owned_researchables: ownedResearchIds.map((data_unit_id) => ({
      data_unit_id,
    })),
    priority_column: toRaw(priorityList.value).filter(
      (columnIndex) => !ignoreColumns.value.includes(columnIndex),
    ),
    priority_mode: priority_mode.value,
    ignore_multiple: ignore_multiple.value,
  };
  const snapshot = {
    treeKey: `${types.value.country_code}_${types.value.vehicle_type}`,
    selectedStateMap: { ...selected },
  };

  if (settings.value.developer_mode) {
    debugPanelRef.value?.beginPlanning(params, {
      country_code: types.value.country_code,
      vehicle_type: types.value.vehicle_type,
    });
  }

  loading.show();
  try {
    const result = await findShortestPathToVehicleWorker(params);
    if (settings.value.developer_mode) {
      debugPanelRef.value?.setWarnings(result.warnings || []);
    }
    if (result.ok) {
      automaticPlanningSnapshot.value = snapshot;
      targetVehicleIds.value = new Set();
    }
    loading.hide();
    automatic_options_visible.value = false;
    return result;
  } catch (error) {
    if (settings.value.developer_mode) {
      debugPanelRef.value?.setWarnings([
        `一键规划执行失败：${error?.message || String(error)}`,
      ]);
    }
    loading.hide();
    automatic_options_visible.value = false;
    return null;
  }
}

function rollbackAutomaticPlanning() {
  const snapshot = automaticPlanningSnapshot.value;
  const currentTreeKey = `${types.value.country_code}_${types.value.vehicle_type}`;
  if (!snapshot || snapshot.treeKey !== currentTreeKey) return;

  updateSelectedStateMapAllLocal({ ...snapshot.selectedStateMap }, true);
  updateOwnedVehicleIds([]);
  targetVehicleIds.value = new Set();
  automaticPlanningSnapshot.value = null;
  closeFastFuncs();
}

const current_bg_img = computed(() => {
  return (
    preset_wallpapers.find((el) => el.value == settings.value.bg_img) || {}
  );
});

const currentPointsType = ref(localStorage.getItem("currentPointsType") || "0");

// 创建tree_data对应箭头计算信息的HashMap
const arrow_points_map = ref({});
function createArrowPoints(tree_data) {
  arrow_points_map.value = createArrowPointsMap(tree_data);
}

/** 请求tree_data数据 */
async function requestTreeData() {
  automaticPlanningSnapshot.value = null;
  loading.show();
  // const res = await getTreeDataJsdelivr(types.value);
  const res = await getTreeDataLocal(types.value);

  loading.hide((hide_callback) => {
    targetVehicleIds.value = new Set();
    // 更新tree_data到store
    updateTreeData(res);
    // 创建Researchable集合
    updateResearchableSet(createResearchableSet(res));
    // 创建指向箭头元数据映射（直升机除外）
    if (types.value.vehicle_type == "helicopters") {
      arrow_points_map.value = {};
    } else {
      createArrowPoints(res);
    }
    // 创建RP/SP元数据映射
    updateVehicleCostMap(createVehicleCostMap(res));
    // 提取顶端/末端载具（priorityVehicleList）
    priorityVehicleList.value = getColumnBoundaryVehicles(res);
    hide_callback && hide_callback();
  });
}

/** 切换currentCountry/currentVehicleType时进行requestTreeData，更新当前tree_data */
watch(types, () => requestTreeData(), { deep: true });

// 动态获取当前国家_军种的unlock_quantity
const current_uq = computed(
  () => unlock_quantitys[types.value.country_code][types.value.vehicle_type],
);

const detail_visible = ref(false);
const current_detail_item = ref({});
// 打开item-detail-page组件，跳过iframe请求并显示详情页
function jumpItemDetailPage(item) {
  current_detail_item.value = item;
  detail_visible.value = true;
}

// 点击快捷栏之外的区域时关闭全局快捷栏
function onGlobalClick() {
  closeFastFuncs();
}

const notice_visible = ref(false);
onMounted(() => {
  // 有新的未读更新公告，显示公告面板
  if (!checkAndShowUpdateNotice()) {
    notice_visible.value = true;
  }
  requestTreeData();
  document.addEventListener("click", onGlobalClick);
});
onUnmounted(() => {
  document.removeEventListener("click", onGlobalClick);
});
</script>

<style scoped>
.bg-liner {
  width: 100%;
  height: 100%;
  background-size: cover;
  object-fit: cover;
}
.container-main {
  width: 1350px;
  height: 100vh;
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(25, 33, 36, 0.65),
    transparent
  );
  position: relative;
  left: 45px;
  --height: 90vh;
  --top: 4vh;
  --tree_height: calc(var(--height) - 67px);
  margin: 0 auto !important;
  padding-top: var(--top);
}
.wt-tree {
  height: var(--tree_height);
  color: #fff;
}
.screenshot-state.container-main,
.screenshot-state .wt-tree {
  height: auto;
}
.container-main:not(.screenshot-state) .tree-area {
  height: var(--tree_height);
  overflow: auto;
  transform: none;
  will-change: auto;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 0%,
    black 80%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 0%,
    black 80%,
    transparent 100%
  );
}
@media (max-height: 779px) {
  .container-main {
    --top: 2vh;
    --height: 92vh;
  }
}
.tree-area::-webkit-scrollbar {
  display: none;
}
.wt-tree .backdrop-filter {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
.header-tab {
  background-color: rgba(33, 46, 50, 0.45);
  width: 100%;
  height: 46px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.header-tab .type-item {
  margin: 0 15px;
}
.rank-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.content-background-promo::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
    to top,
    rgba(20, 25, 27, 1),
    rgba(0, 0, 0, 0)
  );
  z-index: 10;
}
.content-background-promo.blur-0::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
    to bottom,
    rgba(20, 25, 27, 1),
    rgba(0, 0, 0, 0),
    rgba(20, 25, 27, 1)
  );
  z-index: 10;
}
.content-background-promo video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}
.vertical-split-line {
  width: 1px;
  background-color: rgba(255, 255, 255, 0.15);
}
.automatic-rollback-button {
  position: fixed;
  right: calc(50% - 85px);
  bottom: 105px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 99px;
  background: rgba(14, 17, 22, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}
.automatic-rollback-button:hover {
  border-color: rgba(255, 255, 255, 0.32);
  background: rgba(47, 66, 70, 0.95);
}
.automatic-rollback-button:active {
  transform: translateY(0);
}
.rank-rpsp-total {
  padding: 1px 17px 0 8px;
  height: 28px;
  position: relative;
}
</style>

<style>
.country-icon svg {
  width: 40px;
}
</style>

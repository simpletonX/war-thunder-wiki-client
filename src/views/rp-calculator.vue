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
  <!-- 主体 -->
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
      @automatic-calculate="openAutomaticCalc"
      @exportImage="exportImage"
      @update:totals="handleTotals"
      :comparisonTotalStats="activeComparisonTotalStats"
      :isComparisonPreview="isComparisonPreview"
    />

    <!-- 科技树主体 -->
    <div class="wt-tree w-[1350px] mx-auto relative" ref="wt_tree">
      <!-- 遮罩层，解决因backdrop-filter带来的包含块对fixed定位的影响 -->
      <div class="backdrop-filter"></div>

      <!-- 路线对比仅切换显示快照，不会覆盖当前科技树的手动选择。 -->
      <div v-if="comparisonPlans.length" class="comparison-tabs-bar">
        <span class="comparison-tabs-title">路线对比列表</span>
        <div class="comparison-tabs-scroll">
          <cir_tabs
            v-model="activeComparisonId"
            :options="comparisonTabOptions"
            name="research-path-comparison"
            aria-label="路线对比方案"
            @remove="removeComparisonPlan"
          />
        </div>
        <button
          type="button"
          class="comparison-tabs-clear flex items-center"
          @click="clearComparisonPlans"
        >
          <PhArrowUUpLeft :size="18" />
          <span class="ml-1">清空列表</span>
        </button>
      </div>

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
                    ? parseNumber(activeRankStats[rankItem.rank]?.rp, true)
                    : formatChineseNumber(
                        activeRankStats[rankItem.rank]?.rp,
                        true,
                      )
                }}</span>
                <img :src="`/static/rp.png`" class="w-[16px] mr-1" />
                <span>/</span>
                <span class="sps ml-2">{{
                  settings.math_format == "thousands_separator"
                    ? parseNumber(activeRankStats[rankItem.rank]?.sp, true)
                    : formatChineseNumber(
                        activeRankStats[rankItem.rank]?.sp,
                        true,
                      )
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
              activeRankStats[rankItem.rank]?.count > current_uq[rankItem.rank]
                ? current_uq[rankItem.rank]
                : activeRankStats[rankItem.rank]?.count
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
                  :waypointVehicleIds="waypointVehicleIds"
                  :isMacOS="isMacOS"
                  :isTabKeyPressed="isTabKeyPressed"
                  :ownedVehicleIds="activeOwnedVehicleIds"
                  :displaySelectedStateMap="activeSelectedStateMap"
                  :isComparisonPreview="isComparisonPreview"
                  @open-fast-funcs="openFastFuncs"
                  @shortcut-action="handleVehicleShortcut"
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
                  :waypointVehicleIds="waypointVehicleIds"
                  :isMacOS="isMacOS"
                  :isTabKeyPressed="isTabKeyPressed"
                  :ownedVehicleIds="activeOwnedVehicleIds"
                  :displaySelectedStateMap="activeSelectedStateMap"
                  :isComparisonPreview="isComparisonPreview"
                  @open-fast-funcs="openFastFuncs"
                  @shortcut-action="handleVehicleShortcut"
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
        <span class="opacity-50 mt-1">科技树数据获取异常</span>
      </div>

      <!-- 国家切换tab栏 -->
      <wt_country_tabs
        :modelValue="types.country_code"
        @update:modelValue="(val) => updateTypes('country_code', val)"
      />
    </div>
  </div>

  <!-- 左上角版本号 -->
  <div
    class="public_version fixed left-[20px] top-[15px] text-[14px] text-[rgba(255,255,255,0.6)]"
  >
    RP-Calculator v{{ version }}
  </div>

  <!-- 当前数据库更新时间与版本号 -->
  <div
    class="fixed bottom-2 left-[46px] text-white flex justify-center items-center text-[11px] opacity-60 w-full"
  >
    <img :src="`/static/database-network.svg`" />
    <span class="pt-[4px] ml-1">游戏版本号：{{ db_version }}</span>
    <span class="ml-3 pt-[4px]">/ 更新日期 {{ db_update_date }}</span>
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
  <!-- <public_loading
    :modelValue="loading_visible"
    v-if="settings.loading_animation"
  /> -->
  <public_loading :modelValue="loading_visible" />

  <!-- 全局唯一的载具快捷功能栏 -->
  <wt_tree_item_fast_funcs
    :visible="fastFuncsState.visible"
    :anchorRect="fastFuncsState.anchorRect"
    :showAsTarget="showFastAsTarget"
    :isTarget="currentFastIsTarget"
    :showQuickPlanning="showFastQuickPlanning"
    :showAddToComparison="showFastAddToComparison"
    :showAsWaypoint="showFastAsWaypoint"
    :isWaypoint="currentFastIsWaypoint"
    :isMacOS="isMacOS"
    :isComparisonPreview="fastFuncsState.isComparisonPreview"
    @automatic-planning="handleFastAutomaticPlanning"
    @quick-planning="handleFastQuickPlanning"
    @add-to-comparison="handleFastAddToComparison"
    @set-target="handleFastSetTarget"
    @set-waypoint="handleFastSetWaypoint"
    @jump-details="handleFastJumpDetails"
    @close="closeFastFuncs"
  />

  <!-- 未选中任何目标载具 -->
  <notarget_alert v-model="notarget_alert_visible"> </notarget_alert>

  <!-- 载具详情页组件 -->
  <wt_item_details v-model="detail_visible" :item="current_detail_item">
  </wt_item_details>

  <!-- 开发调试信息 -->
  <development_debug_panel v-if="settings.developer_mode" ref="debugPanelRef" />

  <!-- 自动计算选项对话框 -->
  <automatic_options
    v-model="automatic_options_visible"
    v-model:ignore_multiple="ignore_multiple"
    @automatic-calculate="runAutomaticPlanning"
  ></automatic_options>

  <!-- 更新公告 -->
  <update_notice v-model="notice_visible" :version="version"></update_notice>

  <!-- 用户协议 -->
  <user_agreement
    @close="updateAgreementAccepted"
    v-if="!agreement_accepted?.read"
  ></user_agreement>

  <!-- 右侧全局定位功能按钮 -->
  <div class="func-button-bar fixed right-0">
    <div class="func-button" @click="() => (notice_visible = true)">
      更新日志
    </div>
    <div class="func-button" @click="jumpUserAgreement">用户协议</div>
  </div>
</template>

<script setup>
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import wt_tree_item from "@/components/wt_tree_item.vue";
import wt_country_tabs from "@/components/wt_country_tabs.vue";
import wt_type_tabs from "@/components/wt_type_tabs.vue";
import cir_tabs from "@/components/cir_tabs.vue";
import public_mask from "@/components/public_mask.vue";
import { useTreeDataStore } from "@/stores/tree_data_store";
import { getStorage, setStorage } from "@/utils/storage";
import { storeToRefs } from "pinia";
import {
  cleanHiddenVehiclesFromTreeData,
  createArrowPointsMap,
  createResearchableSet,
  createVehicleCostMap,
  calculateRankStats,
  findShortestPathToVehicleWorker,
  formatChineseNumber,
  parseNumber,
  toggleSelectColumnAbove,
} from "@/utils/treeDataUtils";
import {
  preset_wallpapers,
  country_code_texts,
  vehicle_type_texts,
  ignore_tree_data,
} from "@/utils/dict";
import { unlock_quantitys } from "@/utils/unlock_quantitys";
import { getTreeDataLocal } from "@/api/tree_data";
import Wt_item_details from "@/components/wt_item_details.vue";
import public_loading from "@/components/public_loading.vue";
import wt_tree_item_fast_funcs from "@/components/wt_tree_item_fast_funcs.vue";
import {
  PhArrowCounterClockwise,
  PhMagnifyingGlass,
  PhArrowUUpLeft,
} from "@phosphor-icons/vue";
import User_agreement from "@/components/user_agreement.vue";
import { country_icons } from "@/utils/icon_svgs";
import { toPng } from "html-to-image";
import update_notice from "@/components/update_notice.vue";
import notarget_alert from "@/components/notarget_alert.vue";

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
  clearAllSSMap,
} = treeDataStore;
const {
  tree_data,
  settings,
  types,
  rankStats,
  vehicle_cost_map: vehicleCostMap,
  loading_visible,
  selected_state_map,
  owned_vehicle_ids: ownedVehicleIds,
  agreement_accepted,
} = storeToRefs(treeDataStore);

const targetVehicleIds = ref(new Set());
const waypointVehicleIds = ref(new Set());
const COMPARISON_PLANS_STORAGE_KEY = "research_path_comparison_plans_v1";
const MAX_COMPARISON_PLANS = 10;

function normalizeComparisonPlans(value) {
  if (!Array.isArray(value)) return [];

  const planIds = new Set();
  return value
    .filter((plan) => {
      if (
        !plan ||
        typeof plan.id !== "string" ||
        typeof plan.countryCode !== "string" ||
        typeof plan.vehicleType !== "string" ||
        !plan.selectedStateMap ||
        typeof plan.selectedStateMap !== "object" ||
        planIds.has(plan.id)
      ) {
        return false;
      }

      planIds.add(plan.id);
      return true;
    })
    .map((plan) => ({
      id: plan.id,
      title: typeof plan.title === "string" ? plan.title : plan.id,
      vehicleId: typeof plan.vehicleId === "string" ? plan.vehicleId : "",
      vehicleIcon: typeof plan.vehicleIcon === "string" ? plan.vehicleIcon : "",
      countryCode: plan.countryCode,
      vehicleType: plan.vehicleType,
      treeKey:
        typeof plan.treeKey === "string"
          ? plan.treeKey
          : `${plan.countryCode}_${plan.vehicleType}`,
      selectedStateMap: { ...plan.selectedStateMap },
      ownedResearchIds: Array.isArray(plan.ownedResearchIds)
        ? plan.ownedResearchIds.filter((id) => typeof id === "string")
        : [],
    }))
    .slice(0, MAX_COMPARISON_PLANS);
}

const comparisonPlans = ref(
  getStorage(COMPARISON_PLANS_STORAGE_KEY, [], normalizeComparisonPlans),
);
function persistComparisonPlans() {
  setStorage(COMPARISON_PLANS_STORAGE_KEY, comparisonPlans.value);
}
function getComparisonVehicleId(plan) {
  if (plan.vehicleId) return plan.vehicleId;

  const prefix = `${plan.treeKey}_`;
  return plan.id.startsWith(prefix) ? plan.id.slice(prefix.length) : "";
}
function findTreeVehicle(treeData, vehicleId) {
  for (const rank of treeData || []) {
    for (const column of rank.researchable_vehicles || []) {
      for (const item of column || []) {
        const items = item?.type === "multiple" ? item.items : [item];
        const vehicle = (items || []).find(
          (entry) => entry?.data_unit_id === vehicleId,
        );
        if (vehicle) return vehicle;
      }
    }
  }
  return null;
}
function hydrateComparisonIcons(treeData, treeKey) {
  let hasChanges = false;
  comparisonPlans.value = comparisonPlans.value.map((plan) => {
    if (plan.treeKey !== treeKey || plan.vehicleIcon) return plan;

    const vehicleId = getComparisonVehicleId(plan);
    const vehicle = findTreeVehicle(treeData, vehicleId);
    if (!vehicle?.vehicle_icon) return plan;

    hasChanges = true;
    return {
      ...plan,
      vehicleId,
      vehicleIcon: vehicle.vehicle_icon,
    };
  });
  if (hasChanges) persistComparisonPlans();
}
const activeComparisonId = ref("current");
const comparisonTabOptions = computed(() => [
  { id: "current", title: "当前选择" },
  ...comparisonPlans.value.map((plan) => ({
    id: plan.id,
    title: plan.title,
    icon: plan.vehicleIcon,
    removable: true,
  })),
]);
const activeComparisonPlan = computed(() =>
  comparisonPlans.value.find((plan) => plan.id === activeComparisonId.value),
);
const isComparisonPreview = computed(() => !!activeComparisonPlan.value);
const activeSelectedStateMap = computed(
  () =>
    activeComparisonPlan.value?.selectedStateMap || selected_state_map.value,
);
const activeOwnedVehicleIds = computed(() =>
  activeComparisonPlan.value
    ? new Set(activeComparisonPlan.value.ownedResearchIds)
    : ownedVehicleIds.value,
);
const activeRankStats = computed(() =>
  isComparisonPreview.value
    ? calculateRankStats(activeSelectedStateMap.value, vehicleCostMap.value)
    : rankStats.value,
);
function calculateComparisonTotals(selectedStateMap, excludeOwned = false) {
  const totals = { rp: 0, sp: 0, count: 0 };

  for (const [id, isSelected] of Object.entries(selectedStateMap || {})) {
    if (!isSelected) continue;

    const vehicle = vehicleCostMap.value[id];
    if (!vehicle) continue;
    if (
      !vehicle.isPremium &&
      (!excludeOwned || !activeOwnedVehicleIds.value.has(id))
    ) {
      totals.rp += vehicle.rp;
      totals.sp += vehicle.sp;
    }
    totals.count++;
  }

  return totals;
}
const activeComparisonTotalStats = computed(() => {
  if (!isComparisonPreview.value) return null;

  return {
    complete: calculateComparisonTotals(activeSelectedStateMap.value),
    pending: calculateComparisonTotals(activeSelectedStateMap.value, true),
  };
});

watch(activeComparisonId, (comparisonId) => {
  const plan = comparisonPlans.value.find((entry) => entry.id === comparisonId);
  if (!plan) return;

  if (
    types.value.country_code !== plan.countryCode ||
    types.value.vehicle_type !== plan.vehicleType
  ) {
    // 使用一次性更新避免跨国家、跨军种时产生中间请求。
    updateTypes({
      country_code: plan.countryCode,
      vehicle_type: plan.vehicleType,
    });
  }
});
const isMacOS = /Mac|iPhone|iPad|iPod/i.test(
  typeof navigator === "undefined"
    ? ""
    : navigator.userAgentData?.platform || navigator.platform || "",
);
const isTabKeyPressed = ref(false);
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
const exportImagePixelRatios = {
  standard: 1,
  high: 1.5,
  ultra: 2,
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForImageReady(img) {
  if (!img) return;

  if (!img.currentSrc && img.dataset?.src && !img.src) {
    img.src = img.dataset.src;
  }

  if (!img.complete) {
    await new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  }

  if (typeof img.decode === "function" && img.complete) {
    await img.decode().catch(() => {});
  }
}

async function prepareImagesForExport(root) {
  const images = [...root.querySelectorAll("img")].filter(
    (img) => !img.closest(".folding-vehicle"),
  );
  const lazyImages = [];

  for (const img of images) {
    if (img.getAttribute("loading") === "lazy") {
      lazyImages.push(img);
      img.setAttribute("data-export-original-loading", "lazy");
      img.loading = "eager";
      img.setAttribute("loading", "eager");
    }
  }

  await nextTick();
  await Promise.all(images.map((img) => waitForImageReady(img)));
  await delay(450);

  return () => {
    for (const img of lazyImages) {
      img.loading = "lazy";
      img.setAttribute("loading", "lazy");
      img.removeAttribute("data-export-original-loading");
    }
  };
}

async function exportImage() {
  if (!wt_tree.value) return;
  loading.show();
  screenshot_state.value = true;

  let restoreImages = () => {};

  try {
    await nextTick();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    restoreImages = await prepareImagesForExport(wt_tree.value);

    const pixelRatio =
      exportImagePixelRatios[settings.value.export_image_quality] ?? 1.5;

    const dataUrl = await toPng(wt_tree.value, {
      cacheBust: true,
      backgroundColor: "#20303a",
      pixelRatio,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = "card.png";
    link.href = dataUrl;
    link.click();
  } finally {
    restoreImages();
    screenshot_state.value = false;

    await nextTick();
    loading.hide();
  }
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
    !["helicopters"].includes(types.value.vehicle_type) &&
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
const showFastAsWaypoint = showFastAsTarget;
const showFastQuickPlanning = computed(() => {
  const { item, isPremium } = fastFuncsState.value;
  return (
    !isPremium &&
    !!item?.data_unit_id &&
    !selected_state_map.value[item.data_unit_id]
  );
});
const showFastAddToComparison = computed(() => {
  const { item, isPremium } = fastFuncsState.value;
  const planId = item?.data_unit_id
    ? `${types.value.country_code}_${types.value.vehicle_type}_${item.data_unit_id}`
    : "";
  const isAlreadyCompared = comparisonPlans.value.some(
    (plan) => plan.id === planId,
  );
  return (
    !isPremium &&
    !!item?.data_unit_id &&
    !selected_state_map.value[item.data_unit_id] &&
    (isAlreadyCompared || comparisonPlans.value.length < MAX_COMPARISON_PLANS)
  );
});
const currentFastIsWaypoint = computed(() => {
  const item = fastFuncsState.value.item;
  return getFastItemVehicleIds(item).some((id) =>
    waypointVehicleIds.value.has(id),
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
    const remainingWaypoints = [...waypointVehicleIds.value].filter(
      (id) => !selected?.[id],
    );
    if (remainingWaypoints.length !== waypointVehicleIds.value.size) {
      waypointVehicleIds.value = new Set(remainingWaypoints);
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

async function handleVehicleShortcut({ action, item, isPremium }) {
  if (!item?.data_unit_id) return;

  const isPlanningMarkerUnavailable =
    isPremium ||
    types.value.vehicle_type === "helicopters" ||
    selected_state_map.value[item.data_unit_id];
  if (
    (action === "set-target" || action === "set-waypoint") &&
    isPlanningMarkerUnavailable
  ) {
    return;
  }
  if (
    action === "quick-planning" &&
    (isPremium || selected_state_map.value[item.data_unit_id])
  ) {
    return;
  }

  fastFuncsState.value = {
    ...fastFuncsState.value,
    item,
    isPremium,
  };

  if (action === "automatic-planning") handleFastAutomaticPlanning();
  if (action === "quick-planning") await handleFastQuickPlanning();
  if (action === "set-target") handleFastSetTarget();
  if (action === "set-waypoint") handleFastSetWaypoint();
}

function handleFastAutomaticPlanning() {
  const { item, isPremium } = fastFuncsState.value;
  if (!item) return;

  toggleSelectColumnAbove({
    tree_data,
    clicked_item: item,
    selected_state_map,
    isPremium,
  });
}

async function handleFastQuickPlanning() {
  const { item, isPremium } = fastFuncsState.value;
  if (
    isPremium ||
    !item?.data_unit_id ||
    selected_state_map.value[item.data_unit_id]
  ) {
    return;
  }

  const nextTargetIds = new Set(targetVehicleIds.value);
  nextTargetIds.add(item.data_unit_id);
  targetVehicleIds.value = nextTargetIds;

  const nextWaypointIds = new Set(waypointVehicleIds.value);
  nextWaypointIds.delete(item.data_unit_id);
  waypointVehicleIds.value = nextWaypointIds;

  await runAutomaticPlanning();
}

async function handleFastAddToComparison() {
  const { item, isPremium } = fastFuncsState.value;
  const planId = item?.data_unit_id
    ? `${types.value.country_code}_${types.value.vehicle_type}_${item.data_unit_id}`
    : "";
  const existingIndex = comparisonPlans.value.findIndex(
    (entry) => entry.id === planId,
  );
  if (
    isPremium ||
    !item?.data_unit_id ||
    selected_state_map.value[item.data_unit_id]
  ) {
    return;
  }
  if (existingIndex === -1 && comparisonPlans.value.length >= MAX_COMPARISON_PLANS) {
    alert(`路线对比最多只能保留 ${MAX_COMPARISON_PLANS} 条`);
    return;
  }

  const { ownedResearchIds, plannedPremiumIds } =
    collectSelectedPlanningVehicles();
  const params = {
    targets: [{ data_unit_id: item.data_unit_id }],
    planned_prems: plannedPremiumIds.map((data_unit_id) => ({ data_unit_id })),
    owned_researchables: ownedResearchIds.map((data_unit_id) => ({
      data_unit_id,
    })),
    ignore_multiple: ignore_multiple.value,
    // 对比规划只生成快照，绝不写入当前 selected_state_map 或本地缓存。
    commitResult: false,
  };

  loading.show(400);
  try {
    const result = await findShortestPathToVehicleWorker(params);
    if (!result?.ok) {
      alert("该载具暂时无法生成可对比的最短研发路线");
      return;
    }

    const plan = {
      id: planId,
      title:
        item[settings.value.vehicle_title_type] ||
        item.title ||
        item.data_unit_id,
      vehicleId: item.data_unit_id,
      vehicleIcon: item.vehicle_icon || "",
      countryCode: types.value.country_code,
      vehicleType: types.value.vehicle_type,
      treeKey: `${types.value.country_code}_${types.value.vehicle_type}`,
      selectedStateMap: { ...result.selected_state_map },
      ownedResearchIds: [...ownedResearchIds],
    };
    comparisonPlans.value =
      existingIndex === -1
        ? [...comparisonPlans.value, plan]
        : comparisonPlans.value.map((entry, index) =>
            index === existingIndex ? plan : entry,
          );
    persistComparisonPlans();
    activeComparisonId.value = plan.id;
  } catch {
    alert("加入对比列表失败，请稍后再试");
  } finally {
    loading.hide();
  }
}

function clearComparisonPlans() {
  comparisonPlans.value = [];
  persistComparisonPlans();
  activeComparisonId.value = "current";
  closeFastFuncs();
}

function removeComparisonPlan(plan) {
  comparisonPlans.value = comparisonPlans.value.filter(
    (entry) => entry.id !== plan.id,
  );
  persistComparisonPlans();

  if (activeComparisonId.value === plan.id) {
    activeComparisonId.value = "current";
  }
  closeFastFuncs();
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
    const nextWaypointIds = new Set(waypointVehicleIds.value);
    nextWaypointIds.delete(item.data_unit_id);
    waypointVehicleIds.value = nextWaypointIds;
  }
  targetVehicleIds.value = nextTargetIds;
}

function handleFastSetWaypoint() {
  const { item, isPremium } = fastFuncsState.value;
  if (
    isPremium ||
    !item?.data_unit_id ||
    selected_state_map.value[item.data_unit_id]
  ) {
    return;
  }

  const nextWaypointIds = new Set(waypointVehicleIds.value);
  if (nextWaypointIds.has(item.data_unit_id)) {
    nextWaypointIds.delete(item.data_unit_id);
  } else {
    nextWaypointIds.add(item.data_unit_id);
    const nextTargetIds = new Set(targetVehicleIds.value);
    nextTargetIds.delete(item.data_unit_id);
    targetVehicleIds.value = nextTargetIds;
  }
  waypointVehicleIds.value = nextWaypointIds;
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
const ignore_multiple = ref(false);
const automaticPlanningSnapshot = ref(null);

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
    waypoints: [...waypointVehicleIds.value].map((data_unit_id) => ({
      data_unit_id,
    })),
    planned_prems: plannedPremiumIds.map((data_unit_id) => ({ data_unit_id })),
    owned_researchables: ownedResearchIds.map((data_unit_id) => ({
      data_unit_id,
    })),
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
      waypointVehicleIds.value = new Set();
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
  waypointVehicleIds.value = new Set();
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

let treeDataRequestId = 0;
function getTreeKey({ country_code, vehicle_type }) {
  return `${country_code}_${vehicle_type}`;
}

function isCurrentTreeRequest(requestId, requestedTypes) {
  return (
    requestId === treeDataRequestId &&
    types.value.country_code === requestedTypes.country_code &&
    types.value.vehicle_type === requestedTypes.vehicle_type
  );
}

function clearTreeDataRuntimeState(treeKey) {
  updateTreeData([], treeKey);
  updateResearchableSet(new Set());
  updateVehicleCostMap({});
  arrow_points_map.value = {};
}

/** 请求tree_data数据 */
async function requestTreeData() {
  // 遇到不存在的科技树，直接切换到陆军
  if (ignore_tree_data?.[types.value.country_code]) {
    if (
      ignore_tree_data?.[types.value.country_code]?.[types.value.vehicle_type]
    ) {
      updateTypes("vehicle_type", "ground");
      return;
    }
  }

  const requestId = ++treeDataRequestId;
  const requestedTypes = {
    country_code: types.value.country_code,
    vehicle_type: types.value.vehicle_type,
  };
  const requestedTreeKey = getTreeKey(requestedTypes);

  // 用户手动切换科技树时回到当前选择；由对比标签触发的切换则保留预览。
  if (activeComparisonPlan.value?.treeKey !== requestedTreeKey) {
    activeComparisonId.value = "current";
  }

  automaticPlanningSnapshot.value = null;
  targetVehicleIds.value = new Set();
  waypointVehicleIds.value = new Set();
  closeFastFuncs();
  clearTreeDataRuntimeState(requestedTreeKey);
  loading.show();

  try {
    // const res = await getTreeDataJsdelivr(requestedTypes);
    const res = await getTreeDataLocal(requestedTypes);
    if (!isCurrentTreeRequest(requestId, requestedTypes)) return;

    const cleanedTreeData = cleanHiddenVehiclesFromTreeData(res);

    loading.hide(async (hide_callback) => {
      if (!isCurrentTreeRequest(requestId, requestedTypes)) return;

      // 更新tree_data到store
      updateTreeData(cleanedTreeData, requestedTreeKey);
      hydrateComparisonIcons(cleanedTreeData, requestedTreeKey);
      // 创建Researchable集合
      updateResearchableSet(createResearchableSet(cleanedTreeData));
      // 创建指向箭头元数据映射（直升机除外）
      if (requestedTypes.vehicle_type == "helicopters") {
        arrow_points_map.value = {};
      } else {
        createArrowPoints(cleanedTreeData);
      }
      // 创建RP/SP元数据映射
      updateVehicleCostMap(createVehicleCostMap(cleanedTreeData));
      hide_callback && hide_callback();
    });
  } catch (error) {
    if (!isCurrentTreeRequest(requestId, requestedTypes)) return;

    clearTreeDataRuntimeState(requestedTreeKey);
    loading.hide();
  }
}

/** 切换currentCountry/currentVehicleType时进行requestTreeData，更新当前tree_data */
watch(types, () => requestTreeData(), { deep: true });

/** 切换隐藏载具显示设置时重新加载并清洗当前tree_data */
watch(
  () => settings.value.hidden_vehicle_visible,
  () => requestTreeData(),
);

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

function trackTabKeyDown(event) {
  if (event.key === "Tab") isTabKeyPressed.value = true;
}

function trackTabKeyUp(event) {
  if (event.key === "Tab") isTabKeyPressed.value = false;
}

function clearTabKeyState() {
  isTabKeyPressed.value = false;
}

const notice_visible = ref(false);
const notarget_alert_visible = ref(false);

function openAutomaticCalc() {
  if (!targetVehicleIds.value.size) {
    notarget_alert_visible.value = true;
    return;
  }
  automatic_options_visible.value = true;
}

// 跳转至用户协议
function jumpUserAgreement() {
  window.open(
    "https://icnv6yvo8yvw.feishu.cn/docx/Sx1sdwhsPoSKzaxUCeZcaXo9nvg?from=from_copylink",
    "_blank",
  );
}

onMounted(() => {
  // v3.20版本是否已执行一次强制清理缓存标记
  const v3_20_cache_clear = getStorage("v3_20_cache_clear");
  if (!v3_20_cache_clear?.ok) {
    clearAllSSMap();
    setStorage("v3_20_cache_clear", {
      ok: true,
    });
  }

  // 有新的未读更新公告，显示公告面板
  if (!checkAndShowUpdateNotice()) {
    notice_visible.value = true;
  }
  requestTreeData();
  document.addEventListener("click", onGlobalClick);
  window.addEventListener("keydown", trackTabKeyDown);
  window.addEventListener("keyup", trackTabKeyUp);
  window.addEventListener("blur", clearTabKeyState);
});
onUnmounted(() => {
  document.removeEventListener("click", onGlobalClick);
  window.removeEventListener("keydown", trackTabKeyDown);
  window.removeEventListener("keyup", trackTabKeyUp);
  window.removeEventListener("blur", clearTabKeyState);
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
.comparison-tabs-bar {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 56px);
  min-height: 46px;
  padding: 6px 18px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(22, 29, 35, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 18px 18px;
  backdrop-filter: blur(10px);
}
.comparison-tabs-title {
  flex: 0 0 auto;
  padding-left: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.58);
}
.comparison-tabs-clear {
  font-size: 14px;
  user-select: none;
  cursor: pointer;
  color: rgba(255,255,255,0.6);
  flex: 0 0 auto;
}
.comparison-tabs-scroll {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(188, 199, 213, 0.56) transparent;
  overscroll-behavior-x: contain;
}
.comparison-tabs-scroll::-webkit-scrollbar {
  height: 3px;
}
.comparison-tabs-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.comparison-tabs-scroll::-webkit-scrollbar-thumb {
  background: rgba(188, 199, 213, 0.44);
  border-radius: 999px;
}
.comparison-tabs-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(235, 241, 250, 0.72);
}
.comparison-tabs-scroll :deep(.cir-tabs) {
  min-width: 100%;
}
.comparison-tabs-clear:hover {
  color: #fff;
}
.screenshot-state.container-main,
.screenshot-state .wt-tree {
  height: auto;
}
.container-main:not(.screenshot-state) .tree-area {
  padding-top: 65px;
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
.func-button {
  width: 30px;
  text-align: center;
  border-radius: 10px 0 0 10px;
  line-height: 18px;
  background-color: rgba(26, 33, 45, 0.8);
  padding: 10px 3px;
  font-size: 14px;
  margin: 5px 0;
  cursor: pointer;
  user-select: none;
}
.func-button-bar {
  top: 50%;
  transform: translate(0, -50%);
}
.func-button:hover {
  background-color: rgba(51, 63, 85, 0.8);
}
</style>

<style>
.country-icon svg {
  width: 40px;
}
</style>

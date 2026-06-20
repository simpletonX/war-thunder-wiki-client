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

  <div class="container-main">
    <!-- 载具军种切换tab栏 -->
    <!-- <div class="fill-placeholder h-[66px]"></div> -->
    <wt_type_tabs
      :vt="types.vehicle_type"
      v-model:pt="currentPointsType"
      @update:vt="(val) => updateTypes('vehicle_type', val)"
      @clear="requestTreeData"
    />

    <!-- 科技树主体 -->
    <div class="wt-tree w-[1350px] mx-auto relative">
      <!-- 遮罩层，解决因backdrop-filter带来的包含块对fixed定位的影响 -->
      <div class="backdrop-filter"></div>

      <div class="tree-area pb-[140px] pt-[22px]" v-if="tree_data?.length">
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
                  @jumpItemDetailPage="jumpItemDetailPage"
                  @joinQueue="joinQueue"
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
                  @jumpItemDetailPage="jumpItemDetailPage"
                  @joinQueue="joinQueue"
                />
              </div>
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

      <!-- 动态规划队列入口按钮 -->
      <Button
        class="queue_button"
        @click="openQueueDialog"
        v-if="['ground', 'aviation'].includes(types.vehicle_type)"
      >
        <PhCrownSimple :size="20" weight="bold" />
        <span>动态规划队列</span>
      </Button>
    </div>
  </div>

  <!-- 当前数据库更新时间与版本号 -->
  <div
    class="current-database fixed bottom-2 left-[46px] text-white flex justify-center items-center text-[12px] opacity-60 w-full"
  >
    <img :src="`/static/database-network.svg`" />
    <span class="ml-2">2.55.1.142</span>
    <span class="ml-3">-> 2026/06/11</span>
  </div>

  <!-- 顶级加载动画 -->
  <public_loading :modelValue="loading_visible" />

  <!-- 载具详情页组件 -->
  <wt_item_details v-model="detail_visible" :item="current_detail_item">
  </wt_item_details>

  <!-- 动态规划队列面板 -->
  <public_dialog v-model="queue_visible">
    <template #header>
      <div class="title flex justify-between items-center">
        <span>动态规划队列</span>
        <div
          class="faq w-[28px] h-[28px] bg-[rgba(255,255,255,0.1)] rounded-full flex justify-center items-center cursor-pointer"
        >
          <PhQuestionMark :size="18" />
        </div>
      </div>
    </template>
    <template #main>
      <div class="w-[650px]">
        <div class="sub-title">
          <span>最终目标载具</span>
          <div class="line"></div>
        </div>
        <div class="targets flex flex-wrap mt-[20px]">
          <div
            class="target-item flex items-center relative"
            v-for="(item, index) in targets"
            :key="index"
          >
            <img :src="item.vehicle_icon" />
            <span class="ml-1">{{ item.title }}</span>
            <div
              class="close-button cursor-pointer ml-1"
              @click="leaveQueue(false, item)"
            >
              <PhX :size="16" />
            </div>
          </div>
        </div>

        <div class="sub-title mt-[40px]">
          <span>预备高级载具</span>
          <div class="line"></div>
        </div>
        <div class="planner flex flex-wrap mt-[20px]">
          <div
            class="target-item flex items-center relative"
            :class="[item?.class_name]"
            v-for="(item, index) in planner"
            :key="index"
          >
            <img :src="item.vehicle_icon" />
            <span class="ml-1">{{ item.title }}</span>
            <div
              class="close-button cursor-pointer ml-1"
              @click="leaveQueue(true, item)"
            >
              <PhX :size="16" />
            </div>
          </div>
        </div>

        <div class="sub-title mt-[40px]">
          <span>非主线列补位优先级</span>
          <div class="line"></div>
        </div>
        <div class="priority_vehicle_list flex mt-4">
          <priority_selector
            v-model="priorityList"
            :count="priorityVehicleList"
            :ignoreColumns="ignoreColumns"
          >
            <template #item="{ items, priority, index }">
              <div class="priority_vehicle_column">
                <div
                  class="target-item flex items-center relative w-[105px] !pl-[58px] !mx-0"
                  v-for="(subItem, subIndex) in items"
                  :key="subIndex"
                >
                  <img :src="subItem.vehicle_icon" class="!w-[46px]" />
                  <span class="ml-1">{{ subItem.br }}</span>
                  <div class="arrow_to_end" v-if="subIndex == 0">↓</div>
                </div>
                <div class="selected_number text-center">
                  {{
                    priority
                      ? priority
                      : ignoreColumns.includes(index)
                        ? "主线"
                        : "请选择"
                  }}
                </div>
              </div>
            </template>
          </priority_selector>
        </div>

        <div class="sub-title mt-[40px]">
          <span>非主线列补位策略模式</span>
          <div class="line"></div>
        </div>

        <div class="flex mt-4 mb-8">
          <RadioGroup v-model="priority_mode">
            <div class="flex">
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="r1" value="soft" class="cursor-pointer" />
                <Label for="r1" class="cursor-pointer"
                  >最短路径先行（最少研发点）</Label
                >
              </div>
              <div class="flex items-center space-x-2 ml-6">
                <RadioGroupItem id="r2" value="hard" class="cursor-pointer" />
                <Label for="r2" class="cursor-pointer"
                  >非主线列补位优先级先行（非最少研发点）</Label
                >
              </div>
            </div>
          </RadioGroup>
        </div>

        <div class="flex justify-center">
          <Button class="mb-6" @click="runResearchPathPlanner"
            >一键计算开线路径</Button
          >
        </div>
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed, toRaw } from "vue";
import wt_tree_item from "@/components/wt_tree_item.vue";
import wt_country_tabs from "@/components/wt_country_tabs.vue";
import wt_type_tabs from "@/components/wt_type_tabs.vue";
import public_mask from "@/components/public_mask.vue";
import { useTreeDataStore } from "@/stores/tree_data_store";
import { storeToRefs } from "pinia";
import {
  createArrowPointsMap,
  createVehicleCostMap,
  parseNumber,
  formatChineseNumber,
  findShortestPathToVehicleWorker,
} from "@/utils/treeDataUtils";
import {
  createResearchableSet,
  getColumnBoundaryVehicles,
} from "@/utils/treeDataUtils";
import { unlock_quantitys, preset_wallpapers } from "@/utils/dict";
import { getTreeDataLocal } from "./api/tree_data";
import Wt_item_details from "./components/wt_item_details.vue";
import public_loading from "./components/public_loading.vue";
import { PhX, PhQuestionMark, PhCrownSimple } from "@phosphor-icons/vue";
import priority_selector from "@/components/priority_selector.vue";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

/** stores初始化 */
const treeDataStore = useTreeDataStore();
const {
  updateTreeData,
  updateTypes,
  updateVehicleCostMap,
  updateResearchableSet,
  loading,
} = treeDataStore;
const {
  tree_data,
  settings,
  types,
  rankStats,
  loading_visible,
  contextmenu_state,
} = storeToRefs(treeDataStore);

const queue_visible = ref(false);
// 最终目标载具
const targets = ref([]);
// 预备高级载具
const planner = ref([]);
// 已排序的列优先级 例如：[1, 3, 0, 2]
const priorityList = ref([]);
// 规划队列面板中显示的列数及顶端/低端载具（由请求tree_data时获取一次）
const priorityVehicleList = ref([]);
// 优先级排序中忽略的列（targets中出现过的载具所属列皆为主线，不参与列优先级排序）
const ignoreColumns = ref([]);
// 缓存targets下的item的列下标，用于在执行leaveQueue时能获取到对应item的列下标
const colIndexMap = ref({});
// 算法优先级策略模式，soft: 总最少RP先行，hard: 非主线列优先级先行
const priority_mode = ref("soft");

function openQueueDialog() {
  queue_visible.value = true;
}
// 从规划队列加入指定item
function joinQueue({ isPremium, item, colIndex }) {
  if (isPremium) {
    const isExist = planner.value.includes(item);
    if (!isExist) planner.value.push(item);
  } else {
    const isExist = targets.value.includes(item);
    if (!isExist) targets.value.push(item);

    const colMapItem = colIndexMap.value[item.data_unit_id];
    if (!colMapItem) {
      colIndexMap.value[item.data_unit_id] = {
        item,
        colIndex,
      };
    }
    getUniqueColIndexes();
    priorityList.value = [];
  }
}
// 从规划队列移除指定item
function leaveQueue(isPremium, item) {
  if (isPremium) {
    planner.value.splice(
      planner.value.findIndex(
        (item_) => item_.data_unit_id === item.data_unit_id,
      ),
      1,
    );
  } else {
    targets.value.splice(
      targets.value.findIndex(
        (item_) => item_.data_unit_id === item.data_unit_id,
      ),
      1,
    );

    const colMapItem = colIndexMap.value[item.data_unit_id];
    if (colMapItem) {
      delete colIndexMap.value[item.data_unit_id];
    }
    getUniqueColIndexes();
  }
}
// 计算当前需忽略的列
function getUniqueColIndexes() {
  const map = colIndexMap.value;
  ignoreColumns.value = [
    ...new Set(Object.values(map).map((item) => item.colIndex)),
  ];
}
// 一键计算开线路径
function runResearchPathPlanner() {
  const params = {
    targets: targets.value.map((el) => {
      return {
        data_unit_id: el.data_unit_id,
      };
    }),
    planned_prems: planner.value.map((el) => {
      return {
        data_unit_id: el.data_unit_id,
      };
    }),
    priority_column: toRaw(priorityList.value),
    priority_mode: priority_mode.value,
  };
  console.log(params);
  console.log(findShortestPathToVehicleWorker(params));
  // console.log(params);
}
// 清空规划面板相关数据
function clearQueueDatas() {
  targets.value = [];
  planner.value = [];
  priorityList.value = [];
  ignoreColumns.value = [];
  colIndexMap.value = {};
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
  // loading.show();
  // const res = await getTreeDataJsdelivr(types.value);
  const res = await getTreeDataLocal(types.value);

  loading.hide(() => {
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
    // 获取priorityVehicleList（规划队列面板中显示的列数及顶端/低端载具）
    priorityVehicleList.value = getColumnBoundaryVehicles(tree_data.value);
    // 清空规划面板数据
    clearQueueDatas();
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

// 监听contextmenu状态，隐藏显示中的item右键菜单
function onGlobalClick() {
  if (contextmenu_state.value.visible) {
    contextmenu_state.value.visible = false;
    contextmenu_state.value.target_data_unit_id = "";
  }
}

onMounted(async () => {
  requestTreeData();
  document.addEventListener("click", onGlobalClick);
});
</script>

<style scoped>
.sub-title {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sub-title span {
  flex: 0 0 auto;
}
.sub-title .line {
  height: 1px;
  flex: 1;
  min-width: 0;
  background-image: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.15)
  );
}
.target-item {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 90px;
  padding-left: 62px;
  padding-right: 5px;
  line-height: 32px;
  margin: 0 5px 20px;
}
.target-item.prem {
  background-color: transparent;
  background-image: linear-gradient(to bottom, #594b20, #3f3415);
}
.target-item.prem span {
  color: #f2e2b4;
}
.target-item.squad {
  /* #588537 */
  /* #40642c */
  /* #3b5734 */
  background-color: transparent;
  background-image: linear-gradient(to bottom, #40642c, #2f432a);
}
.target-item.squad span {
  color: #c1eaab;
}
.target-item img {
  position: absolute;
  width: 50px;
  bottom: 5px;
  left: 10px;
}
.target-item .close-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
}
.target-item .close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
.target-item .arrow_to_end {
  position: absolute;
  top: 80%;
  font-size: 20px;
  color: #c1eaab;
}
.bg-liner {
  width: 100%;
  height: 100%;
  background-size: cover;
  object-fit: cover;
}
.queue_button {
  width: 150px;
  height: 34px;
  position: absolute;
  bottom: 65px;
  left: calc(50% - 75px);
  border-radius: 100px;
  padding: 0;
  cursor: pointer;
  background-color: rgba(69, 92, 100, 0.25);
  backdrop-filter: blur(10px);
  color: #fff;
  box-shadow: 0 0 15px 1px rgba(0, 0, 0, 0.3);
}
.queue_button::after {
  content: "";
  width: 90%;
  height: 1px;
  position: absolute;
  top: 0;
  left: 5%;
  background-image: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
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
  /* background-color: #fff; */
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
  /* box-shadow: 0 0 30px 2px rgba(0, 0, 0, 0.3); */
  color: #fff;
}

.tree-area {
  height: var(--tree_height);
  overflow: auto;
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
  /* backdrop-filter: blur(20px); */
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

.rank-rpsp-total {
  padding: 1px 17px 0 8px;
  height: 28px;
  position: relative;
}
</style>

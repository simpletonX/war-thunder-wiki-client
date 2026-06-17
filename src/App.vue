<template>
  <!-- 背景 -->
  <div
    class="content-background-promo w-[100vw] h-[100vh] fixed top-0 left-0 z-[-1]"
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
                  parseNumber(rankStats[rankItem.rank]?.rp, true)
                }}</span>
                <img :src="`/static/rp.png`" class="w-[16px] mr-1" />
                <span>/</span>
                <span class="sps ml-2">{{
                  parseNumber(rankStats[rankItem.rank]?.sp, true)
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
                  :currentPointsType="currentPointsType"
                  :arrow_points="arrow_points_map[item.data_unit_id]"
                  @jumpItemDetailPage="jumpItemDetailPage"
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
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
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
  findShortestPathToVehicle,
} from "@/utils/treeDataUtils";
import { createResearchableSet } from "@/utils/treeDataUtils";
import { unlock_quantitys, preset_wallpapers } from "@/utils/dict";
import { getTreeDataLocal } from "./api/tree_data";
import Wt_item_details from "./components/wt_item_details.vue";
import public_loading from "./components/public_loading.vue";

/** stores初始化 */
const treeDataStore = useTreeDataStore();
const {
  updateTreeData,
  updateTypes,
  updateVehicleCostMap,
  updateResearchableSet,
  updateSelectedStateMapAllLocal,
  loading,
} = treeDataStore;
const { tree_data, settings, types, rankStats, loading_visible } =
  storeToRefs(treeDataStore);

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
  loading.show();
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

    const result = findShortestPathToVehicle({
      targets: [{ data_unit_id: "fr_leclerc_azur", rank: "VIII" }],
      planned_prems: [{ data_unit_id: "fr_leopard_2a4nl_les", rank: "VII" }],
      priority_column: [3, 2],
    });
    console.log(result.selected_state_map);
    updateSelectedStateMapAllLocal(result.selected_state_map, true);
  });
}

/** 切换currentCountry/currentVehicleType时进行requestTreeData，更新当前tree_data */
watch(types, () => requestTreeData(), { deep: true });

// 动态获取当前国家_军种的unlock_quantity
const current_uq = computed(
  () => unlock_quantitys[types.value.country_code][types.value.vehicle_type],
);

const detail_visible = ref(false);
const current_detail_item = ref({
  type: "single",
  title: "Leopard 2 (PzBtl 123)",
  vehicle_icon:
    "https://static.encyclopedia.warthunder.com/slots/germ_leopard_2a4_pzbtl_123.png",
  br: "10.7",
  rp: 0,
  rp_view: 0,
  sp: 0,
  sp_view: 0,
  data_unit_id: "germ_leopard_2a4_pzbtl_123",
  class_name: "prem",
  main_role: "Medium tank",
});
// 打开item-detail-page组件，跳过iframe请求并显示详情页
function jumpItemDetailPage(item) {
  current_detail_item.value = item;
  detail_visible.value = true;
}

onMounted(async () => {
  requestTreeData();
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

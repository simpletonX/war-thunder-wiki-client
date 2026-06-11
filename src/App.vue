<template>
  <!-- 背景 -->
  <div
    class="content-background-promo w-[100vw] h-[100vh] fixed top-0 left-0 z-[-1]"
  >
    <div
      class="content-background-promo-mask w-[100vw] h-[100vh] absolute top-0 left-0"
    ></div>
    <video
      v-if="!bg_hidden"
      autoplay
      muted
      loop
      :src="`/static/reel-2023.mp4`"
    />
  </div>

  <div class="container-main">
    <!-- 载具军种切换tab栏 -->
    <!-- <div class="fill-placeholder h-[66px]"></div> -->
    <wt_type_tabs
      v-model:vt="currentVehicleType"
      v-model:pt="currentPointsType"
      :totalSummary="totalSummary"
      :totalSelectNum="totalSelectNum"
      @toggleSelectAll="toggleSelectAll_"
      @clearCache="clearCache"
      @exportToImage="exportToImage"
    />

    <!-- 科技树主体 -->
    <div class="wt-tree w-[1300px] mx-auto relative">
      <!-- 遮罩层，解决因backdrop-filter带来的包含块对fixed定位的影响 -->
      <div class="backdrop-filter"></div>

      <div class="tree-area pb-[140px]" ref="treeArea" v-if="tree_data?.length">
        <!-- 每个等级 -->
        <!-- 全局通用遮罩层 -->
        <public_mask />
        <div
          class="rank-item px-3 relative"
          v-for="(rankItem, rankIndex) in tree_data"
          :key="rankItem.rank"
        >
          <div class="rank-title absolute mt-2 flex items-center">
            <span class="text-[#c3c3c3bf] text-[13px]"
              >Rank {{ rankItem.rank }}</span
            >

            <div class="flex rank-sprps text-[13px] ml-5">
              <span class="rps">{{ rankRpSps[rankIndex].total_rp_text }}</span>
              <img :src="`/static/rp.svg`" class="w-[16px] mr-1" />
              <span>,</span>
              <span class="sps ml-2">{{
                rankRpSps[rankIndex].total_sp_text
              }}</span>
              <img :src="`/static/war-points.svg`" class="w-[18px]" />
            </div>
          </div>

          <div
            :hidden="rankIndex == tree_data.length - 1"
            class="unlock-quantity absolute top-[calc(50%-15px)] left-[8px] text-[12px] w-[30px] h-[30px] bg-[rgba(255,255,255,.05)] rounded-full flex justify-center items-center text-[rgba(255,255,255,.75)]"
          >
            {{
              rankItem.selected.length > current_uq[rankItem.rank]
                ? current_uq[rankItem.rank]
                : rankItem.selected.length
            }}/{{ current_uq[rankItem.rank] }}
          </div>

          <div class="wt-tree-instance pr-4 pl-12 flex justify-between">
            <!-- 普通载具 -->
            <div
              class="researchable-instance flex justify-center w-full pt-[40px]"
            >
              <div
                class="wt-tree-column mx-2 w-[150px]"
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
                  :totalSelectNum="totalSelectNum"
                  :planPathToTarget2Params="{
                    tree_data,
                    instantCaching,
                    t_c: currentCountry,
                    type: currentVehicleType,
                  }"
                  @updateItemSelected="updateItemSelected"
                />
                <!-- 如果 columnItem 为空数组依旧会渲染占位列（无 item） -->
              </div>
            </div>

            <div class="vertical-split-line w-[1px] bg-[#444] mx-6"></div>

            <!-- 高级载具 -->
            <div class="premium-instance flex justify-between pt-[40px]">
              <div
                class="wt-tree-column mx-2 w-[150px]"
                v-for="(columnItem, colIndex) in rankItem.premium_vehicles"
                :key="`p-col-${rankIndex}-${colIndex}`"
              >
                <wt_tree_item
                  v-for="(item, rowIndex) in columnItem"
                  :key="item?.data_unit_id || `p-${colIndex}-${rowIndex}`"
                  :item="item"
                  :isPremium="true"
                  :currentPointsType="currentPointsType"
                  :totalSelectNum="totalSelectNum"
                  @updateItemSelected="updateItemSelected"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-show="showBottomInfo">
          <div class="flex justify-center items-center mt-5 z-10 relative">
            <div class="text-[14px] mr-4 opacity-50">
              <span>{{ country_code_texts[currentCountry] }}</span>
              <span class="mx-[2px]">·</span>
              <span>{{ vehicle_type_texts[currentVehicleType] }}</span>
            </div>
            <img
              :src="`/static/country_ico/${currentCountry}.svg`"
              width="30"
              class="mr-2"
            />
            <span class="text-[16px] opacity-75 mr-2">Total: </span>
            <span class="text-[16px] mr-[2px]">{{ totalSummary.rp }}</span>
            <img :src="`/static/rp.svg`" width="18" />
            <span class="text-[16px] ml-1 mr-2">/</span>
            <span class="text-[16px] mr-[2px]">{{ totalSummary.sp }}</span>
            <img :src="`/static/war-points.svg`" width="18" />
          </div>

          <div class="absolute right-6 z-10 text-[14px] opacity-30">
            © War Thunder Wiki for Blind-Thunder.
          </div>
          <div class="mt-8 h-[1px]"></div>
        </div>
      </div>

      <div
        class="blank-fill z-10 relative w-full flex justify-center mt-[160px]"
        v-else
      >
        <img :src="`/static/unlink.svg`" class="w-[18px] mr-2" />
        <span class="opacity-50 mt-1">This technology tree has no data.</span>
      </div>

      <!-- 国家切换tab栏 -->
      <wt_country_tabs v-model="currentCountry" />
    </div>
  </div>

  <!-- 全局通用弹出通知框 -->
  <public_message_dialog />

  <!-- 当前数据库更新时间与版本号 -->
  <div class="current-database fixed bottom-2 left-[46px] text-white flex justify-center items-center text-[12px] opacity-60 w-full">
    <img :src="`/static/database-network.svg`" />
    <span class="ml-2">2.55.1.142</span>
    <span class="ml-3">-> 2026/06/11</span>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import wt_tree_item from "@/components/wt_tree_item.vue";
import wt_country_tabs from "@/components/wt_country_tabs.vue";
import wt_type_tabs from "@/components/wt_type_tabs.vue";
import public_mask from "@/components/public_mask.vue";
import public_message_dialog from "@/components/public_message_dialog.vue";
import { usePublicMessageDialogStore } from "@/stores/public_message_dialog";
import { usePublicMaskStore } from "@/stores/public_mask";
import { useTreeDataStore } from "@/stores/tree_data";
import { abort_batch_request, clearTreeDataCache } from "@/utils/cache";
import { storeToRefs } from "pinia";
import { usePointsSummary } from "@/composables/usePointsSummary";
import { mountArrowPoints } from "@/utils/mountArrowPoints";
import {
  updateTreeItemSelected,
  toggleSelectAll,
  areAllDetailsTrueInTree,
} from "@/utils/treeDataUtils";
import { loadLocalJSON } from "@/utils/loadLocalJson";
import {
  exportElementToImage,
  downloadDataUrl,
  modernScreenshot,
} from "@/utils/exportElementToImage";
import {
  unlock_quantitys,
  country_code,
  vehicle_type,
  vehicle_type_texts,
  country_code_texts,
} from "@/utils/dict";

/** stores初始化 */
const public_mask_store = usePublicMaskStore();
const treeDataStore = useTreeDataStore();
const { updateTreeData, instantCaching } = treeDataStore;
const { tree_data, bg_hidden } = storeToRefs(treeDataStore);

/** 当前选中的类型值（国家/军种/点数值） */
const currentCountry = ref(localStorage.getItem("currentCountry") || "usa");
const currentVehicleType = ref(
  localStorage.getItem("currentVehicleType") || "ground",
);
const currentPointsType = ref(localStorage.getItem("currentPointsType") || "0");
/** 当前总计算点数值（RP/SP）、当前已选中的载具数量 */
const { totalSummary, totalSelectNum } = usePointsSummary(
  tree_data,
  currentPointsType,
);

/** 全选/反全选 */
function toggleSelectAll_() {
  toggleSelectAll({
    tree_data,
    selectAll: !totalSelectNum.value,
    t_c: currentCountry,
    type: currentVehicleType,
    instantCaching,
  });
}

/** 清除当前国家缓存中的tree_data */
// function clearCache() {
//   localStorage.removeItem(
//     `${currentCountry.value}_${currentVehicleType.value}`
//   );
//   requestTreeData();
// }
function clearCache() {
  clearTreeDataCache();
  requestTreeData();
}

const messageStore = usePublicMessageDialogStore();
/** 单个载具选中/取消选中状态 */
const updateItemSelected = (item, selected) => {
  // 检测tree_data是否全部加载完详情
  if (areAllDetailsTrueInTree(tree_data.value)) {
    updateTreeItemSelected({
      tree_data,
      target_item: item,
      selected,
      t_c: currentCountry,
      type: currentVehicleType,
      instantCaching,
    });
  } else {
    messageStore.show(
      "Please wait for the details request to be completed.",
      2000,
    );
  }
};

/** 缓存命中检测 */
async function cacheHit(cacheCallback, request) {
  const cache_tree_data = localStorage.getItem(
    `${currentCountry.value}_${currentVehicleType.value}`,
  );
  const t_c = currentCountry.value,
    type = currentVehicleType.value;

  // 缓存命中
  if (cache_tree_data) {
    console.log(
      `${currentCountry.value}_${currentVehicleType.value} 本地缓存命中`,
    );
    await mountArrowPoints({
      tree_data: {
        value: JSON.parse(cache_tree_data),
      },
      _t_c: t_c,
      _type: type,
      instantCaching,
    });

    updateTreeData(JSON.parse(cache_tree_data));
    // 进入details请求队列
    // batch_request_details(JSON.parse(cache_tree_data), t_c, type);

    return cacheCallback && cacheCallback();
  }
  // 缓存未命中，发起请求
  request && request();
}

/** 请求tree_data数据 */
async function requestTreeData() {
  public_mask_store.openLoading();
  public_mask_store.setOpacity(0.8);
  public_mask_store.show();

  // clearTreeDataCache();

  cacheHit(
    // 缓存命中的回调
    () => {
      // 至少300毫秒后才能再次切换currentCountry/currentVehicleType
      setTimeout(() => {
        public_mask_store.hide();
      }, 300);
    },
    // 缓存未命中的回调
    async () => {
      console.log(
        `${currentCountry.value}_${currentVehicleType.value} 缓存未命中，将从本地读取数据`,
      );
      // 不再请求Node.js服务器，直接从Github线上仓库读取database
      // const res = await getTreeDataApiForGithub(
      //   currentCountry.value,
      //   currentVehicleType.value
      // );
      const res = await loadLocalJSON(currentCountry, currentVehicleType);
      // 进入指向箭头计算程序（内附即时缓存）
      await mountArrowPoints({
        tree_data: { value: res },
        _t_c: currentCountry.value,
        _type: currentVehicleType.value,
        instantCaching,
      });
      public_mask_store.hide();
    },
  );
}

/** 切换currentCountry/currentVehicleType时进行requestTreeData，更新当前tree_data */
watch(
  [currentCountry, currentVehicleType],
  async ([newFirst, newLast], [oldFirst, oldLast]) => {
    // 中断当前details请求队列
    await abort_batch_request();
    localStorage.setItem("currentCountry", newFirst);
    localStorage.setItem("currentVehicleType", newLast);

    requestTreeData();
  },
);

const treeArea = ref();
const showBottomInfo = ref(false);
/** 导出科技树结构为图像并触发自动下载 */
async function exportToImage() {
  // messageStore.show("开发试验性功能，敬请期待！", 2000);
  // return;

  showBottomInfo.value = true;
  public_mask_store.openLoading();
  public_mask_store.setOpacity(0.8);
  public_mask_store.show();
  await nextTick();

  if (document.fonts) {
    await document.fonts.ready;
  }
  await exportElementToImage(treeArea.value);
  showBottomInfo.value = false;
  public_mask_store.hide();
}

/** 动态获取当前国家/军种的unlock_quantity */
const current_uq = computed(
  () => unlock_quantitys[currentCountry.value][currentVehicleType.value],
);

const format_with_comma = (num = 0) => Number(num).toLocaleString("en-US");
/** 动态计算每个rank的总rp&总sp */
const rankRpSps = computed(() => {
  return tree_data.value.map((rankItem) => {
    let total_rp = 0;
    let total_sp = 0;

    rankItem.selected?.forEach((sel) => {
      total_rp +=
        Number(
          typeof sel.rp === "string" ? sel.rp.replace(/,/g, "") : sel.rp,
        ) || 0;

      total_sp +=
        Number(
          typeof sel.sp === "string" ? sel.sp.replace(/,/g, "") : sel.sp,
        ) || 0;
    });

    return {
      rank: rankItem.rank,
      total_rp,
      total_sp,
      total_rp_text: total_rp.toLocaleString("en-US"),
      total_sp_text: total_sp.toLocaleString("en-US"),
    };
  });
});

/** 处理版本信息 */
async function versionIteration() {
  // 检查本地存储与本地文件中的version_timestamp是否一致（版本校验）
  const file_v = await (await fetch("/v-verify.json")).json();
  const local_v = localStorage.getItem("version_timestamp");
  console.log(
    `%c版本号v: ${local_v} %c(${local_v}[本地] -> ${file_v.version_timestamp}[更新])`,
    "color: #339966",
    "color: #999966",
  );

  // 版本不一致：清空本地存储中所有tree_data，替换新的version_timestamp
  if (file_v.version_timestamp != local_v) {
    country_code.forEach((el) => {
      vehicle_type.forEach((sel) => localStorage.removeItem(`${el}_${sel}`));
    });
    localStorage.setItem("version_timestamp", file_v.version_timestamp);
  }
}

onMounted(async () => {
  await versionIteration();
  requestTreeData();
});
</script>

<style scoped>
.container-main {
  width: 1300px;
  margin: 50px auto;
  height: calc(100vh - 100px);
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(25, 33, 36, 0.65),
    transparent
  );
  /* background-color: #fff; */
  position: relative;
  left: 40px;
}

.content-background-promo-mask {
  backdrop-filter: blur(60px);
}

.tree-area {
  height: calc(90vh - 67px);
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

.tree-area::-webkit-scrollbar {
  display: none;
}

.wt-tree {
  /* box-shadow: 0 0 30px 2px rgba(0, 0, 0, 0.3); */
  color: #fff;
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
</style>

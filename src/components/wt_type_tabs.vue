<template>
  <div
    class="type-tabs absolute z-100 top-0 left-0 text-white w-full"
    :class="fixedClass"
  >
    <div
      class="type-tabs-container w-[1300px] h-[66px] mx-auto px-4 flex justify-between items-center"
    >
      <div class="flex items-center">
        <div
          class="type-tab-item flex items-center px-[10px] cursor-pointer"
          v-for="item in vehicle_type"
          :class="{ active: vt == item }"
          @click="toggleVehicleType(item)"
        >
          <div class="type-icon">
            <img :src="`/static/${item}.svg`" class="h-[18px]" />
          </div>
          <div class="text ml-[4px] text-[14px]">
            {{ vehicle_type_texts[item] }}
          </div>
        </div>

        <div class="split-line mx-[20px]"></div>

        <div class="cursor-pointer flex items-center" @click="togglePointsType">
          <!-- <span class="text-[14px] opacity-75 mr-1">指标: </span> -->
          <div class="showtype-tab-item flex items-center">
            <div class="text-[14px] opacity-75 mr-1">
              {{ pointsType[pt].title }}
            </div>
            <img :src="`/static/outbound.svg`" class="w-[16px] opacity-55" />
          </div>
        </div>
      </div>

      <div class="flex items-center">
        <div class="flex items-center mr-6">
          <span class="text-[14px] opacity-75 mr-1">总计: </span>
          <span class="text-[14px] mr-[2px]">{{ totalSummary.rp }}</span>
          <img :src="`/static/rp.svg`" width="18" />
          <span class="text-[14px] ml-1 mr-2">/</span>
          <span class="text-[14px] mr-[2px]">{{ totalSummary.sp }}</span>
          <img :src="`/static/war-points.svg`" width="18" />
        </div>

        <div
          class="cursor-pointer flex items-center mr-5"
          @click="toggleSelectAll"
        >
          <img :src="`/static/swtich.svg`" class="w-[16px] opacity-55" />
          <span class="text-[14px] opacity-75 ml-[6px]">{{
            totalSelectNum ? "取消全选" : "全选"
          }}</span>
        </div>

        <div
          class="cursor-pointer flex items-center mr-5"
          @click="setting_visible = true"
        >
          <img :src="`/static/settings.svg`" class="w-[16px] opacity-55" />
          <span class="text-[14px] opacity-75 ml-1">设置</span>
        </div>

        <div
          class="cursor-pointer flex items-center mr-5"
          @click="exportToImage"
        >
          <img :src="`/static/local.svg`" class="w-[16px] opacity-55" />
          <span class="text-[14px] opacity-75 ml-1">导出图像</span>
        </div>

        <div class="cursor-pointer flex items-center mr-5" @click="clearCache">
          <img :src="`/static/clear_cache.svg`" class="w-[16px] opacity-55" />
          <span class="text-[14px] opacity-75 ml-1">清除缓存</span>
        </div>
      </div>
    </div>
    <div class="bottom-line"></div>
  </div>
  <public_dialog v-model="setting_visible">
    <template #header>
      <div class="title">偏好设置</div>
    </template>
    <template #main>
      <div class="setting-item">
        <el-checkbox :checked="bg_hidden" @input="toggleBgVisible"
          >隐藏背景</el-checkbox
        >
        <el-checkbox :checked="multiple_mode" @input="toggleMultipleModeVisible"
          >单击选中首个折叠载具</el-checkbox
        >
        <el-checkbox
          :checked="all_select_mode"
          @input="toggleAllSelectModeVisible"
          >全选仅选中第一个折叠载具</el-checkbox
        >
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
import { vehicle_type, vehicle_type_texts } from "@/utils/dict";
import { onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import public_dialog from "@/components/public_dialog.vue";
import { useTreeDataStore } from "@/stores/tree_data";

const treeDataStore = useTreeDataStore();
const { toggleBgHidden, toggleMultipleMode, toggleAllSelectMode } =
  treeDataStore;
const { bg_hidden, multiple_mode, all_select_mode } =
  storeToRefs(treeDataStore);
const setting_visible = ref(false);

const props = defineProps({
  vt: String, // 当前军种类型
  pt: String, // 当前点数（指标）类型"Battle Rating", "Research", "Purchase"
  totalSummary: String,
  totalSelectNum: Number,
});
const emit = defineEmits([
  "update:vt",
  "update:pt",
  "toggleSelectAll",
  "clearCache",
  "exportToImage",
]);

function toggleBgVisible(event) {
  toggleBgHidden(event.target.checked);
}

function toggleMultipleModeVisible(event) {
  toggleMultipleMode(event.target.checked);
}

function toggleAllSelectModeVisible(event) {
  toggleAllSelectMode(event.target.checked);
}

const pointsType = [
  { title: "战斗权重", us_text: "Battle Rating", id: 0 },
  { title: "研发点数", us_text: "Research", id: 1 },
  { title: "银狮", us_text: "Purchase", id: 2 },
];
function togglePointsType() {
  let currentPointsType = props.pt;
  if (currentPointsType == pointsType.length - 1) {
    currentPointsType = "0";
  } else {
    currentPointsType++;
  }
  emit("update:pt", currentPointsType);
  localStorage.setItem("currentPointsType", currentPointsType);
}

function toggleVehicleType(item) {
  emit("update:vt", item);
}

function toggleSelectAll() {
  emit("toggleSelectAll");
}

function clearCache() {
  emit("clearCache");
}

function exportToImage() {
  emit("exportToImage");
}

const fixedClass = ref("");
function handleScroll() {
  const scrollY = window.scrollY || window.pageYOffset;
  const triggerPoint = 114; // 滚动距离阈值（px）

  if (scrollY >= triggerPoint) {
    // 将type-tabs置于固定定位，形成黏性导航栏
    fixedClass.value = "scroll-trigger";
  } else {
    fixedClass.value = "";
  }
}

onMounted(() => {
  handleScroll();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.setting-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-wrap: wrap;
  height: 40px;
}
.type-tabs-container {
  border-top: 1px solid #293340;
}
.type-tab-item {
  border-bottom: 3px solid transparent;
  transition: 0.2s;
  opacity: 0.3;
  user-select: none;
}
.type-tab-item.active {
  opacity: 1;
}
.bottom-line {
  width: 100%;
  margin: 0 auto;
  height: 1px;
  /* background-color: rgba(255, 170, 170, 0.25); */
  background-image: linear-gradient(
    to right,
    transparent,
    rgba(189, 233, 181, 0.35),
    transparent
  );
}
.type-tabs.scroll-trigger {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 888;
  animation: show 0.3s;
}
.type-tabs.scroll-trigger .type-tabs-container {
  height: 58px;
  background-image: linear-gradient(
    to bottom,
    rgba(25, 33, 36, 0.45),
    rgba(25, 33, 36, 0.25)
  );
  backdrop-filter: blur(30px);
  box-shadow: 0 4px 15px 1px rgba(0, 0, 0, 0.2);
}
@keyframes show {
  0% {
    top: -80px;
  }
  100% {
    top: 0;
  }
}
.split-line {
  width: 1px;
  height: 55%;
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
}
.logo {
  font-family: amarurgt;
}
</style>

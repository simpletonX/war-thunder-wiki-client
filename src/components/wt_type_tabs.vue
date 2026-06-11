<template>
  <div class="type-tabs text-white w-full" :class="fixedClass">
    <div
      class="type-tabs-container w-full px-8 flex justify-between items-center"
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
      </div>

      <div class="flex items-center">
        <div
          class="total-panel-bar flex justify-center items-center absolute left-0 w-full"
        >
          <div
            class="total-panel flex justify-between items-center rounded-full py-6 pl-6 h-[46px]"
          >
            <div class="flex items-center">
              <span class="text-[14px] opacity-75 mr-2">当前总计: </span>
              <span class="text-[14px] mr-[2px]">{{ rpNumber }}</span>
              <img :src="`/static/rp.svg`" width="18" />
              <span class="text-[14px] ml-1 mr-2">/</span>
              <span class="text-[14px] mr-[2px]">{{ spNumber }}</span>
              <img :src="`/static/war-points.svg`" width="18" />
            </div>
            <div class="show-mode ml-6 mr-[6px]">
              <cir_tabs
                :modelValue="pt"
                :options="pointsType"
                @change="togglePointsType"
              />
            </div>
          </div>
        </div>

        <div class="cursor-pointer flex items-center mr-7">
          <light_checkbox :checked="totalSelectNum" @_click="toggleSelectAll" />
        </div>

        <div
          class="cursor-pointer flex items-center mr-5"
          @click="setting_visible = true"
        >
          <!-- <img :src="`/static/settings.svg`" class="w-[22px]" /> -->
          <div class="cirle bg-[#ff5f58]"></div>
          <span class="text-[14px] ml-1">偏好设置</span>
        </div>

        <div class="cursor-pointer flex items-center mr-5" @click="exportToImage">
          <!-- <img :src="`/static/local.svg`" class="w-[16px]" /> -->
          <div class="cirle bg-[#ffbc2e]"></div>
          <span class="text-[14px] ml-1">导出图像</span>
        </div>
        <div class="cursor-pointer flex items-center mr-5" @click="clearCache">
          <!-- <img :src="`/static/clear_cache.svg`" class="w-[18px]" /> -->
          <div class="cirle bg-[#28c840]"></div>
          <span class="text-[14px] ml-1">缓存修复</span>
        </div>

        <button class="cir-btn" type="button">
          <span class="text-[14px]">有问题？加入群聊反馈</span>
          <svg
            class="cir-btn__arrow"
            viewBox="0 0 23 23"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7"></path>
            <path d="M7 7h10v10"></path>
          </svg>
        </button>
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
import { onMounted, onUnmounted, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import public_dialog from "@/components/public_dialog.vue";
import light_checkbox from "@/components/light_checkbox.vue";
import light_button from "@/components/light_button.vue";
import cir_tabs from "@/components/cir_tabs.vue";
import { useTreeDataStore } from "@/stores/tree_data";

const treeDataStore = useTreeDataStore();
const { toggleBgHidden, toggleMultipleMode, toggleAllSelectMode } =
  treeDataStore;
const { bg_hidden, multiple_mode, all_select_mode } =
  storeToRefs(treeDataStore);
const setting_visible = ref(false);

const props = defineProps({
  vt: String, // 当前军种类型
  pt: String, // 点数信息显示类型（pointsType）
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

const formatToWan = (str) => {
  const num = Number(String(str).replace(/,/g, "").trim());
  if (!Number.isFinite(num)) return "0";

  const result = num / 10000;

  // 保留最多2位小数，但去掉末尾0
  const formatted = result.toFixed(2).replace(/\.?0+$/, "");
  const text = formatted > 0 ? "万" : "";

  return formatted + text;
};

const rpNumber = computed(() => {
  return formatToWan(props.totalSummary.rp);
});

const spNumber = computed(() => {
  return formatToWan(props.totalSummary.sp);
});

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
  { title: "研发点数", us_text: "Research", id: 1 },
  { title: "战斗权重", us_text: "Battle Rating", id: 0 },
  { title: "银狮", us_text: "Purchase", id: 2 },
];
// 切换点数信息显示类型（pointsType）
function togglePointsType({ id }) {
  emit("update:pt", id);
  localStorage.setItem("currentPointsType", id);
}

function toggleVehicleType(item) {
  emit("update:vt", item);
}

function toggleSelectAll() {
  emit("toggleSelectAll");
  console.log(props.totalSelectNum);
}

function clearCache() {
  emit("clearCache");
}

function exportToImage() {
  alert("导出图像功能维护中，敬请期待！");
  // emit("exportToImage");
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
.cirle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.total-panel-bar {
  bottom: 50px;
}

/* @media (max-height: 779px) {
  .total-panel-bar {
    bottom: 50px;
  }
} */

.total-panel {
  background-color: rgba(69, 92, 100, 0.25);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.total-panel::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 1px;
  background-image: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
}

.type-tabs {
  width: 1300px;
  margin: 0 auto;
  /* background-image: linear-gradient(
    to top,
    rgba(25, 33, 36, 0.65),
    transparent
  ); */
  /* border-radius: 100px; */
  /* background-color: #293340; */
}
.setting-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 1);
  display: flex;
  flex-wrap: wrap;
  height: 40px;
}
.type-tabs-container {
  height: 66px;
}
.type-tab-item {
  border-bottom: 3px solid transparent;
  transition: 0.2s;
  user-select: none;
  padding: 8px 16px 5px;
  border-radius: 10px;
}
.type-tab-item.active {
  background: #202733;
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

/* 复选框 */
/* From Uiverse.io by Nawsome */
.clear {
  clear: both;
}

.checkBox {
  display: block;
  cursor: pointer;
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  box-shadow: 0px 0px 0px 2px #fff;
}

.checkBox div {
  width: 60px;
  height: 60px;
  background-color: #fff;
  top: -52px;
  left: -52px;
  position: absolute;
  transform: rotateZ(45deg);
  z-index: 100;
}

.checkBox input[type="checkbox"]:checked + div {
  left: -10px;
  top: -10px;
}

.checkBox input[type="checkbox"] {
  position: absolute;
  left: 50px;
  visibility: hidden;
}

.transition {
  transition: 300ms ease;
}
/* 复选框 */

/* 加入群聊 */
/* From Uiverse.io by d4niz */
.cir-btn {
  --ink: rgb(32, 39, 51);
  --cloud: var(--color-cloud, #ffffff);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 20px 0 22px;
  border: 0;
  border-radius: 999px;
  background: var(--ink);
  color: var(--cloud);
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.005em;
  line-height: 1;
  cursor: pointer;
  box-shadow:
    0 1px 1px rgba(14, 17, 22, 0.06),
    0 14px 28px -18px rgba(14, 17, 22, 0.4);
  transition:
    transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.cir-btn__arrow {
  width: 16px;
  height: 16px;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.cir-btn:hover {
  background: #1a1f28;
  box-shadow:
    0 1px 1px rgba(14, 17, 22, 0.08),
    0 20px 36px -16px rgba(14, 17, 22, 0.48);
}

.cir-btn:hover .cir-btn__arrow {
  transform: translate(2px, -2px);
}

.cir-btn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(46, 125, 239, 0.32),
    0 14px 28px -18px rgba(14, 17, 22, 0.4);
}

.cir-btn:active {
  opacity: 0.8;
}
/* 加入群聊 */
</style>

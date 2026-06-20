<template>
  <div class="type-tabs text-white w-full">
    <div
      class="type-tabs-container w-full px-8 flex justify-between items-center"
    >
      <!-- 顶部导航栏-左侧军种切换 -->
      <div class="flex items-center">
        <div
          class="type-tab-item flex items-center px-[10px] cursor-pointer"
          v-for="item in vehicle_type"
          :class="{ active: vt == item }"
          @click="toggleVehicleType(item)"
        >
          <div
            class="type-icon"
            v-html="main_role_icons[vehicle_type_icons[item]]"
          ></div>
          <div class="text ml-[4px] text-[14px]">
            {{ vehicle_type_texts[item] }}
          </div>
        </div>

        <div class="split-line mx-[20px]"></div>
      </div>

      <!-- 顶部导航栏-右侧功能区、底部悬浮信息栏（当前总计、切换显示研发点数、战斗权重、银狮） -->
      <div class="flex items-center">
        <div class="cursor-pointer flex items-center mr-5">
          <div class="content">
            <label class="checkBox">
              <input
                id="ch1"
                type="checkbox"
                :checked="is_all_selected"
                @input="toggleSelectAll"
              />
              <div class="transition"></div>
            </label>
          </div>
          <p class="text-[14px] ml-2 pt-[2px]">
            {{ is_all_selected ? "反选" : "全选" }}
          </p>
        </div>

        <div
          class="cursor-pointer flex items-center mr-5"
          @click="setting_visible = true"
        >
          <!-- <img :src="`/static/settings.svg`" class="w-[22px]" /> -->
          <div class="cirle bg-[#ff5f58]"></div>
          <span class="text-[14px] ml-1">偏好设置</span>
        </div>

        <div
          class="cursor-pointer flex items-center mr-5"
          @click="exportToSelectedMap"
        >
          <!-- <img :src="`/static/local.svg`" class="w-[16px]" /> -->
          <div class="cirle bg-[#ffbc2e]"></div>
          <span class="text-[14px] ml-1">方案管理</span>
        </div>
        <div class="cursor-pointer flex items-center mr-5" @click="clearCache">
          <!-- <img :src="`/static/clear_cache.svg`" class="w-[18px]" /> -->
          <div class="cirle bg-[#28c840]"></div>
          <span class="text-[14px] ml-1">清理缓存</span>
        </div>

        <button class="cir-btn" type="button" @click="join_visible = true">
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

        <!-- 底部悬浮信息栏（当前总计、切换显示研发点数、战斗权重、银狮） -->
        <div
          class="total-panel-bar flex justify-center items-center absolute max-auto left-0 w-full"
        >
          <div
            class="total-panel flex justify-between items-center rounded-full py-6 pl-6 h-[46px] relative"
          >
            <!-- 总计 -->
            <div class="flex items-center">
              <span class="text-[14px] opacity-75 mr-2">当前总计: </span>
              <span class="text-[14px] mr-[2px]">{{ current_totals.rp }}</span>
              <img :src="`/static/rp.png`" width="18" />
              <span class="text-[14px] ml-1 mr-2">/</span>
              <span class="text-[14px] mr-[2px]">{{ current_totals.sp }}</span>
              <img :src="`/static/war-points.png`" width="18" />
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
      </div>
    </div>
    <div class="bottom-line"></div>
  </div>

  <!-- 偏好设置面板 -->
  <public_dialog v-model="setting_visible">
    <template #header>
      <div class="title">偏好设置</div>
    </template>
    <template #main>
      <div class="setting-banner mb-5">
        <img :src="`/static/setting-banner-2.jpg`" class="w-[440px]" />
      </div>

      <!-- 个性化配置 -->
      <div class="personalization">
        <div class="setting-type mb-2 relative w-full flex justify-center">
          <div
            class="type-line absolute w-full h-[1px] bg-gray-700 left-0 top-1/2 mt-[-1px]"
          ></div>
          <div
            class="label text-gray-500 text-[14px] text-center bg-[rgb(26,38,41)] relative px-4"
          >
            个性化配置
          </div>
        </div>

        <div class="setting-item flex justify-between items-center mb-2">
          <div class="label text-[15px]">全局背景图像/视频</div>
          <Select
            :modelValue="settings.bg_img"
            @update:model-value="(val) => updateSettings('bg_img', val)"
          >
            <SelectTrigger class="max-w-[310px]">
              <SelectValue placeholder="请选择预设壁纸" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>wallpapers</SelectLabel>
                <SelectItem
                  :value="item.value"
                  v-for="item in preset_wallpapers"
                >
                  <div
                    v-if="item.type == 'color'"
                    class="cirle"
                    :style="{
                      backgroundColor: item.color,
                    }"
                  ></div>
                  {{ item.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="setting-item flex justify-between items-center mb-2">
          <div class="label text-[15px]">背景模糊度</div>
          <NumberField
            :model-value="settings.blur_number"
            :min="0"
            :max="60"
            @update:model-value="(val) => updateSettings('blur_number', val)"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>

        <div class="setting-item flex justify-between items-center mb-2">
          <div class="label text-[15px]">科技树还原游戏UI风格</div>
          <div class="flex items-center gap-3">
            <Checkbox
              id="true_tree"
              :modelValue="settings.true_tree_mode"
              @update:model-value="
                (val) => updateSettings('true_tree_mode', val)
              "
            />
            <Label for="true_tree">启用</Label>
          </div>
        </div>

        <div class="setting-item flex justify-between items-center mb-2">
          <div class="label text-[15px]">数学格式</div>
          <Select
            :modelValue="settings.math_format"
            @update:model-value="(val) => updateSettings('math_format', val)"
          >
            <SelectTrigger class="max-w-[310px]">
              <SelectValue placeholder="请选择数学格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>math format</SelectLabel>
                <SelectItem value="thousands_separator"
                  >千位分隔制（1,008,611）</SelectItem
                >
                <SelectItem value="Chinese_number_unit_system"
                  >中文万亿单位制（100.86万）</SelectItem
                >
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- 快捷操作配置 -->
      <div class="quick-operation">
        <div class="setting-type mb-2 relative w-full flex justify-center">
          <div
            class="type-line absolute w-full h-[1px] bg-gray-700 left-0 top-1/2 mt-[-1px]"
          ></div>
          <div
            class="label text-gray-500 text-[14px] text-center bg-[rgb(26,38,41)] relative px-4"
          >
            快捷操作
          </div>
        </div>

        <div class="setting-item flex justify-between items-center">
          <div class="label text-[15px] flex">
            左键单击折叠载具策略
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <PhWarningCircle :size="18" class="ml-1 opacity-60" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    勾选后，鼠标左键单击折叠载具组时会自动选择其下第一个折叠载具
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div class="flex items-center gap-3">
            <Checkbox
              id="terms"
              :modelValue="settings.multiple_mode"
              @update:model-value="
                (val) => updateSettings('multiple_mode', val)
              "
            />
            <Label for="terms">单击首选折叠载具</Label>
          </div>
        </div>

        <div class="setting-item flex justify-between items-center">
          <div class="label text-[15px] flex">
            全选折叠载具策略
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <PhWarningCircle :size="18" class="ml-1 opacity-60" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>勾选后，全选载具时仅选中折叠载具组下的第一个折叠载具</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div class="flex items-center gap-3">
            <Checkbox
              id="terms-2"
              :modelValue="settings.all_select_mode"
              @update:model-value="
                (val) => updateSettings('all_select_mode', val)
              "
            />
            <Label for="terms-2">全选时仅首选折叠载具</Label>
          </div>
        </div>
      </div>
    </template>
  </public_dialog>

  <!-- 加入群聊面板 -->
  <public_dialog v-model="join_visible">
    <template #header>
      <div class="title">扫码加入群聊</div>
    </template>
    <template #main>
      <div class="flex items-center mb-2">
        <div class="group-item text-center">
          <img :src="`/static/group-1.png`" class="w-[140px]" />
          <p class="mt-4">QQ-1群</p>
        </div>
        <div class="group-item text-center mx-6">
          <img :src="`/static/group-2.png`" class="w-[140px]" />
          <p class="mt-4">QQ-2群</p>
        </div>
        <div class="group-item text-center">
          <img :src="`/static/group-3.png`" class="w-[140px]" />
          <p class="mt-4">QQ-3群</p>
        </div>
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
import {
  vehicle_type,
  vehicle_type_texts,
  preset_wallpapers,
} from "@/utils/dict";
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import public_dialog from "@/components/public_dialog.vue";
import cir_tabs from "@/components/cir_tabs.vue";
import { useTreeDataStore } from "@/stores/tree_data_store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { PhWarningCircle } from "@phosphor-icons/vue";
import {
  parseNumber,
  formatChineseNumber,
  toggleResearchableSelectAll,
} from "@/utils/treeDataUtils";
import { main_role_icons } from "@/utils/icon_svgs";

const props = defineProps({
  vt: String, // 当前军种类型
  pt: String, // 点数信息显示类型（pointsType）
});
const emit = defineEmits(["update:vt", "update:pt", "exportToImage", "clear"]);

const vehicle_type_icons = {
  ground: "Medium tank",
  aviation: "Fighter",
  helicopters: "Attack helicopter",
  ships: "Battlecruiser",
  boats: "Heavy boat",
};
const treeDataStore = useTreeDataStore();
const { updateSettings, updateSelectedStateMapAllLocal } = treeDataStore;
const {
  settings,
  total_stats,
  selected_state_map,
  tree_data,
  researchable_set,
} = storeToRefs(treeDataStore);
const setting_visible = ref(false);
const join_visible = ref(false);
const current_totals = computed(() => {
  if (settings.value.math_format == "thousands_separator") {
    return {
      rp: parseNumber(total_stats.value.rp, true),
      sp: parseNumber(total_stats.value.sp, true),
    };
  } else {
    return {
      rp: formatChineseNumber(total_stats.value.rp, true),
      sp: formatChineseNumber(total_stats.value.sp, true),
    };
  }
});

const is_all_selected = computed(() => {
  const selected = selected_state_map.value;
  const total = researchable_set.value;

  if (!total || total.size === 0) return false;

  for (const id of total) {
    if (!selected[id]) {
      return false;
    }
  }

  return true;
});

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
  toggleResearchableSelectAll({
    tree_data,
    selected_state_map,
    settings,
  });
}

// 重置所有本地存储选中态数据
function clearCache() {
  const ssmap = selected_state_map.value;
  updateSelectedStateMapAllLocal({}, true);
  alert("已清理旧缓存: " + JSON.stringify(ssmap));
  emit("clear");
}

// 导出当前选中状态
function exportToSelectedMap() {
  alert("敬请期待！");
  // const export_result = {
  //   types: { ...types.value },
  //   selected_state_map: { ...selected_state_map.value },
  // };

  // const jsonStr = JSON.stringify(export_result, null, 2);

  // const blob = new Blob([jsonStr], { type: "application/json" });
  // const url = URL.createObjectURL(blob);

  // const a = document.createElement("a");
  // a.href = url;
  // a.download = `${types.value.country_code}_${types.value.vehicle_type}_ssmap.json`;

  // document.body.appendChild(a);
  // a.click();

  // document.body.removeChild(a);
  // URL.revokeObjectURL(url);
}
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

.total-panel {
  background-color: rgba(69, 92, 100, 0.25);
  backdrop-filter: blur(10px);
  z-index: 10;
  overflow: hidden;
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
    rgba(255, 255, 255, 0.3),
    transparent,
    transparent
  );
}

.type-tabs {
  width: 1350px;
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
  width: 14px;
  height: 14px;
  border: 3px solid rgba(255, 255, 255, 0);
  border-radius: 4px;
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
  border-radius: 90px;
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

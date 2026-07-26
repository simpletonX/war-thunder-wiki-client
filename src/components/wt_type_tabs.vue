<template>
  <div class="type-tabs text-white w-full">
    <div
      class="type-tabs-container w-full px-8 flex justify-between items-center"
    >
      <!-- 顶部导航栏-左侧军种切换 -->
      <div class="flex items-center">
        <div
          class="type-tab-item flex items-center cursor-pointer"
          v-for="item in filtered_vehicle_type"
          :key="item"
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
                :disabled="isComparisonPreview"
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
          <div class="cirle bg-[#ff5f58]"></div>
          <span class="text-[14px] ml-1 pt-[1px]">偏好设置</span>
        </div>

        <!-- <div
          class="cursor-pointer flex items-center mr-5"
          @click="plan_visible = true"
        >
          <div class="cirle bg-[#ffbc2e]"></div>
          <span class="text-[14px] ml-1 pt-[1px]">方案管理</span>
        </div> -->
        <div class="cursor-pointer flex items-center mr-5" @click="clearCache">
          <div class="cirle bg-[#28c840]"></div>
          <span class="text-[14px] ml-1 pt-[1px]">清理缓存</span>
        </div>
        <div class="cursor-pointer flex items-center mr-5" @click="exportImage">
          <div class="cirle bg-[#169ccd]"></div>
          <span class="text-[14px] ml-1 pt-[1px]">导出图像</span>
        </div>

        <button class="cir-btn" type="button" @click="join_visible = true">
          <span class="text-[14px]">加入群聊</span>
        </button>

        <button
          class="cir-btn success"
          type="button"
          @click="sponsor_visible = true"
        >
          <span class="text-[14px]">赞助一下</span>
        </button>

        <!-- 底部悬浮信息栏（当前总计、切换显示研发点数、战斗权重、银狮） -->
        <div
          class="total-panel-bar flex justify-center items-center absolute max-auto left-0 w-full"
        >
          <div
            class="total-panel flex justify-between items-center rounded-full py-6 pl-6 h-[46px] relative"
          >
            <!-- 总计 -->
            <div class="flex items-center pt-1">
              <span class="text-[14px] opacity-75 mr-2">
                {{
                  total_stats_mode === "pending" ? "待研发总计:" : "完整总计:"
                }}
              </span>
              <span class="text-[14px] mr-[2px]">{{ current_totals.rp }}</span>
              <img :src="`/static/rp.png`" width="18" />
              <span class="text-[14px] ml-1 mr-2">/</span>
              <span class="text-[14px] mr-[2px]">{{ current_totals.sp }}</span>
              <img :src="`/static/war-points.png`" width="18" />

              <!-- 总计显示方式 -->
              <Button
                variant="ghost"
                class="cursor-pointer rounded-full"
                @click="toggleStatsMode"
              >
                <!-- pending：待研发，complete：完整 -->
                <PhArrowsDownUp :size="20" />
              </Button>
            </div>
            <!-- 自动计算开线路径入口按钮 -->
            <Button
              variant="ghost"
              v-if="!['helicopters'].includes(vt)"
              class="automatic_button ml-1 cursor-pointer !px-3 pt-[10px]"
              @click="emit('automatic-calculate')"
            >
              <PhInfinity :size="20" weight="bold" />
              <span class="pt-[2px]">自动计算</span>
            </Button>
            <!-- 切换点数类型 -->
            <div class="show-mode ml-3 mr-[6px]">
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
    <!-- <div class="bottom-line"></div> -->
  </div>

  <!-- 偏好设置面板 -->
  <public_dialog v-model="setting_visible">
    <template #header>
      <div class="title">偏好设置</div>
    </template>
    <template #main>
      <div class="setting-banner mb-5">
        <img :src="`/static/setting-banner-2_mini.png`" class="w-[490px]" />
      </div>

      <!-- 个性化选项 -->
      <div class="personalization">
        <div class="setting-type mb-2 relative w-full flex justify-center">
          <div
            class="type-line absolute w-full h-[1px] bg-gray-700 left-0 top-1/2 mt-[-1px]"
          ></div>
          <div
            class="label text-gray-500 text-[14px] text-center bg-[rgb(26,38,41)] relative px-4"
          >
            个性化选项
          </div>
        </div>

        <div class="setting-item flex justify-between items-center mb-1">
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

        <div class="setting-item flex justify-between items-center mb-1">
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

        <div class="setting-item flex justify-between items-center mb-1">
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

        <!-- <div class="setting-item flex justify-between items-center mb-1">
          <div class="label text-[15px] flex items-center">
            全局加载动画
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <PhWarningCircle :size="18" class="ml-1 opacity-60" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p class="text-[14px]">
                    关闭加载动画后科技树切换会比较生硬、在此期间请等待数据加载完毕，避免执行其他操作
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div class="flex items-center gap-3">
            <Checkbox
              id="loading_animation"
              :modelValue="settings.loading_animation"
              @update:model-value="
                (val) => updateSettings('loading_animation', val)
              "
            />
            <Label for="loading_animation">启用</Label>
          </div>
        </div> -->

        <div class="setting-item flex justify-between items-center mb-1">
          <div class="label text-[15px] flex items-center">
            导出图像质量
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <PhWarningCircle :size="18" class="ml-1 opacity-60" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p class="text-[14px]">
                    更高质量会导出更清晰的图片，但也会增加生成时间和内存占用。
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            :modelValue="settings.export_image_quality"
            @update:model-value="
              (val) => updateSettings('export_image_quality', val)
            "
          >
            <SelectTrigger class="max-w-[310px]">
              <SelectValue placeholder="请选择导出质量" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>export image quality</SelectLabel>
                <SelectItem value="standard">标准（快速）</SelectItem>
                <SelectItem value="high">高清（均衡）</SelectItem>
                <SelectItem value="ultra">超清（慢）</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- 数据模型选项 -->
      <div class="data-model">
        <div class="setting-type mb-2 relative w-full flex justify-center">
          <div
            class="type-line absolute w-full h-[1px] bg-gray-700 left-0 top-1/2 mt-[-1px]"
          ></div>
          <div
            class="label text-gray-500 text-[14px] text-center bg-[rgb(26,38,41)] relative px-4"
          >
            数据模型选项
          </div>
        </div>

        <div class="setting-item flex justify-between items-center mb-1">
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

        <div class="setting-item flex justify-between items-center mb-1">
          <div class="label text-[15px]">载具名称格式</div>
          <Select
            :modelValue="settings.vehicle_title_type"
            @update:model-value="
              (val) => updateSettings('vehicle_title_type', val)
            "
          >
            <SelectTrigger class="max-w-[310px]">
              <SelectValue placeholder="请选择名称格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>vehicle-title type</SelectLabel>
                <SelectItem value="chinese_title">中文简体_Chinese</SelectItem>
                <SelectItem value="t_chinese_title"
                  >中文繁體_TChinese</SelectItem
                >
                <SelectItem value="title">English International</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="setting-item flex justify-between items-center mb-1">
          <div class="label text-[15px] flex items-center">
            启用隐藏的银币载具
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <PhWarningCircle :size="18" class="ml-1 opacity-60" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p class="text-[14px]">
                    隐藏中的银币载具多见于已过期的限时活动，在游戏科技树中已不可见。为了研发计算的准确性，建议非必要不启用。
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div class="flex items-center gap-3">
            <Checkbox
              id="hidden_vehicle_visible"
              :modelValue="settings.hidden_vehicle_visible"
              @update:model-value="
                (val) => updateSettings('hidden_vehicle_visible', val)
              "
            />
            <Label for="hidden_vehicle_visible">启用</Label>
          </div>
        </div>
      </div>

      <!-- 快捷操作选项 -->
      <div class="quick-operation">
        <div class="setting-type mb-2 relative w-full flex justify-center">
          <div
            class="type-line absolute w-full h-[1px] bg-gray-700 left-0 top-1/2 mt-[-1px]"
          ></div>
          <div
            class="label text-gray-500 text-[14px] text-center bg-[rgb(26,38,41)] relative px-4"
          >
            快捷操作选项
          </div>
        </div>

        <div class="setting-item flex justify-between items-center">
          <div class="label text-[15px] flex">
            左键单击折叠载具组
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <PhWarningCircle :size="18" class="ml-1 opacity-60" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p class="text-[14px]">
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
            <Label for="terms">直接选中第一个折叠载具</Label>
          </div>
        </div>

        <div class="setting-item flex justify-between items-center">
          <div class="label text-[15px] flex">
            全选时折叠载具执行策略
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <PhWarningCircle :size="18" class="ml-1 opacity-60" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p class="text-[14px]">
                    勾选后，全选载具时仅选中折叠载具组下的第一个折叠载具
                  </p>
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
            <Label for="terms-2">仅选中第一个折叠载具</Label>
          </div>
        </div>

        <div class="setting-item flex justify-between items-center">
          <div class="label text-[15px] flex">开发者模式</div>
          <div class="flex items-center gap-3">
            <Checkbox
              id="developer-mode"
              :modelValue="settings.developer_mode"
              @update:model-value="
                (val) => updateSettings('developer_mode', val)
              "
            />
            <Label for="developer-mode">启用调试面板</Label>
          </div>
        </div>
      </div>
    </template>
  </public_dialog>

  <!-- 加入群聊面板 join_visible -->
  <public_dialog v-model="join_visible">
    <template #header>
      <div class="title">加入群聊</div>
    </template>
    <template #main>
      <div class="flex items-center mb-2 text-[14px]">
        <div class="group-item text-center">
          <img :src="`/static/group-1.png`" class="w-[130px]" />
          <p class="mt-4">QQ-交流1群</p>
        </div>
        <div class="group-item text-center mx-6">
          <img :src="`/static/group-2.png`" class="w-[130px]" />
          <p class="mt-4">QQ-交流2群</p>
        </div>
        <div class="group-item text-center">
          <img :src="`/static/group-3.png`" class="w-[130px]" />
          <p class="mt-4">QQ-交流3群</p>
        </div>
      </div>

      <div class="flex justify-center items-center mt-6 mb-2">
        <PhWechatLogo :size="28" />
        <span class="ml-2">loven-cruel</span>
        <!-- https://space.bilibili.com/640676625?spm_id_from=333.337.0.0 -->
      </div>
    </template>
  </public_dialog>

  <!-- 方案管理面板 -->
  <plan_management v-model="plan_visible"></plan_management>

  <!-- 赞助面板 -->
  <sponsor_options v-model="sponsor_visible"></sponsor_options>
</template>

<script setup>
import {
  PhInfinity,
  PhWarningCircle,
  PhArrowsDownUp,
  PhWechatLogo,
} from "@phosphor-icons/vue";
import {
  vehicle_type,
  vehicle_type_texts,
  preset_wallpapers,
  ignore_tree_data,
} from "@/utils/dict";
import { ref, computed, watch } from "vue";
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
import { Button } from "@/components/ui/button";
import {
  parseNumber,
  formatChineseNumber,
  toggleResearchableSelectAll,
} from "@/utils/treeDataUtils";
import { main_role_icons } from "@/utils/icon_svgs";
import Sponsor_options from "./sponsor_options.vue";

const props = defineProps({
  vt: String, // 当前军种类型
  pt: String, // 点数信息显示类型（pointsType）
  // 对比预览时由父组件提供独立快照的统计结果。
  comparisonTotalStats: { type: Object, default: null },
  isComparisonPreview: { type: Boolean, default: false },
});
const emit = defineEmits([
  "update:vt",
  "update:pt",
  "exportToImage",
  "clear",
  "automatic-calculate",
  "exportImage",
  "update:totals",
]);

function exportImage() {
  emit("exportImage");
}

const vehicle_type_icons = {
  ground: "Medium tank",
  aviation: "Fighter",
  helicopters: "Attack helicopter",
  ships: "Battlecruiser",
  boats: "Heavy boat",
};
const treeDataStore = useTreeDataStore();
const { updateSettings, updateOwnedVehicleIds, clearAllSSMap } = treeDataStore;
const {
  settings,
  total_stats_complete,
  total_stats_pending,
  selected_state_map,
  tree_data,
  researchable_set,
  types,
} = storeToRefs(treeDataStore);
const setting_visible = ref(false);
const join_visible = ref(false);
const total_stats_mode = ref("pending");
const active_total_stats = computed(() =>
  props.comparisonTotalStats
    ? total_stats_mode.value === "complete"
      ? props.comparisonTotalStats.complete
      : props.comparisonTotalStats.pending
    : total_stats_mode.value === "complete"
      ? total_stats_complete.value
      : total_stats_pending.value,
);
const current_totals = computed(() => {
  if (settings.value.math_format == "thousands_separator") {
    return {
      rp: parseNumber(active_total_stats.value.rp, true),
      sp: parseNumber(active_total_stats.value.sp, true),
    };
  } else {
    return {
      rp: formatChineseNumber(active_total_stats.value.rp, true),
      sp: formatChineseNumber(active_total_stats.value.sp, true),
    };
  }
});
const formatted_totals = computed(() => {
  // 完整total
  const complete =
    props.comparisonTotalStats?.complete || total_stats_complete.value;
  // 剪除已拥有后的total
  const pending =
    props.comparisonTotalStats?.pending || total_stats_pending.value;

  if (settings.value.math_format === "thousands_separator") {
    return {
      crp: parseNumber(complete.rp, true),
      prp: parseNumber(pending.rp, true),
      csp: parseNumber(complete.sp, true),
      psp: parseNumber(pending.sp, true),
    };
  } else {
    return {
      crp: formatChineseNumber(complete.rp, true),
      prp: formatChineseNumber(pending.rp, true),
      csp: formatChineseNumber(complete.sp, true),
      psp: formatChineseNumber(pending.sp, true),
    };
  }
});
watch(
  formatted_totals,
  (val) => {
    emit("update:totals", val);
  },
  { immediate: true, deep: true },
);

const filtered_vehicle_type = computed(() => {
  return vehicle_type.filter((item) => {
    return !ignore_tree_data?.[types.value.country_code]?.[item];
  });
});

function toggleStatsMode() {
  if (total_stats_mode.value == "pending") {
    total_stats_mode.value = "complete";
  } else {
    total_stats_mode.value = "pending";
  }
}

const is_all_selected = computed(() => {
  if (props.isComparisonPreview) return false;

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
  if (props.isComparisonPreview) return;

  toggleResearchableSelectAll({
    tree_data,
    selected_state_map,
    settings,
    falseEffect() {
      // 在清理owned_vehicle_ids之前，将owned_vehicle_ids缓存到本地存储（计划需求，待定）
      // ...

      updateOwnedVehicleIds([]);
    },
  });
}

// 重置所有本地存储选中态数据
function clearCache() {
  clearAllSSMap();
  alert("已清理所有科技树的选中状态缓存");
  emit("clear");
}

const sponsor_visible = ref(false);
const plan_visible = ref(false);
</script>

<style scoped>
.cirle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.total-panel-bar {
  bottom: 40px;
}

.automatic_button {
  border-radius: 100px;
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
  padding: 8px 14px 5px;
  border-radius: 10px;
}
.type-tab-item.active {
  background: #383f4d;
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
</style>

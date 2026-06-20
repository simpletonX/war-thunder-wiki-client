<template>
  <!-- .wt-tree-item_mask 为了解决stacking context问题 -->
  <div class="wt-tree-item_mask relative">
    <div
      class="wt-tree-item w-[156px] h-[56px] mb-[30px]"
      :class="{
        true_select_mode:
          !selected_state_map[item.data_unit_id] &&
          !isPremium &&
          settings.true_tree_mode,
        default_select_mode: !settings.true_tree_mode,
        unactive_mode: totalSelectNum,
        selected: isItemSelected(item),
        single_item: item.type == 'single',
        [item.class_name || 'default']: true,
      }"
      :style="{
        marginTop: `${86 * (helicopters?.move_bottom || 0)}px`,
      }"
      @contextmenu.prevent.stop="openContextMenu(item)"
      :data_unit_id="item.data_unit_id"
    >
      <div
        class="inner-click-mask cursor-pointer absolute w-full h-full top-0 left-0"
        @click="clickTrigger(item)"
        draggable="true"
      >
        <div class="icon absolute bottom-[3px] left-[2px]">
          <img :src="item.vehicle_icon" loading="lazy" v-fade-image />
        </div>
        <div
          class="title absolute right-[5px] top-[5px] text-[13px] z-10"
          :title="item.title"
        >
          {{ item.title }}
        </div>

        <!-- currentPointsType: 0 显示Br，isDefault: false 显示Br -->
        <!-- 当具备items时，显示其下第一个子载具的main_role -->
        <template v-if="currentPointsType == 0 || !isDefault">
          <div
            class="br absolute right-[20px] bottom-[4px] text-[rgba(255,255,255,.6)] text-[12px] z-10"
          >
            {{ item.br }}
          </div>
          <div
            v-if="item.main_role"
            class="main_role"
            v-html="main_role_icons[item.main_role]"
          ></div>
          <div
            v-else-if="item.items"
            class="main_role"
            v-html="main_role_icons[item.items[0].main_role]"
          ></div>
        </template>
        <!-- currentPointsType: 1 显示Rp -->
        <div
          class="war-points-number absolute right-[2px] bottom-[4px] flex items-center"
          v-if="currentPointsType == 1 && isDefault"
        >
          <span class="text-[12px] mr-[1px]">{{
            item.items
              ? item.items[0].rp_view || "初始"
              : item.rp_view || "初始"
          }}</span>
          <img :src="`/static/rp.png`" class="w-[16px]" />
        </div>
        <!-- currentPointsType: 2 显示Sp -->
        <div
          class="war-points-number absolute right-[3px] bottom-[4px] flex items-center"
          v-if="currentPointsType == 2 && isDefault"
        >
          <span class="text-[12px] mr-[1px]">{{
            item.items
              ? item.items[0].sp_view || "初始"
              : item.sp_view || "初始"
          }}</span>
          <img :src="`/static/war-points.png`" class="w-[18px]" />
        </div>
        <!-- group-梯形角 -->
        <div class="trapezoid" v-if="item.type == 'multiple'"></div>

        <!-- 护身符 -->
        <div class="amulet" v-if="item.class_name == 'prem'">
          <img :src="`/static/premium_vehicle.png`" alt="" />
        </div>

        <!-- 选中态显示图标 -->
        <PhArrowFatLineUp class="selected-icon" :size="17" />
      </div>

      <!-- 直升机指向箭头 -->
      <template v-if="types.vehicle_type == 'helicopters'">
        <div
          class="arrow_down absolute left-1/2 bottom-0 w-[8px]"
          :style="{
            top: '59px',
            height: `${helicopters_arrowHeight - 13}px`,
            transform: 'translateX(-50%)',
          }"
        >
          <!-- 左下关联箭头 -->
          <div
            class="arrow_down arrow-next-left"
            v-if="helicopters?.has_next_left_item"
          >
            <div
              class="arrow_down top-rect relative w-[8px]"
              :style="{
                height: helicopters?.has_next_item ? '0px' : '20px',
              }"
            >
              <div
                class="arrow_down left-long-rect absolute h-[8px] w-[173px] left-[-173px] bottom-0"
                :style="{
                  bottom: helicopters?.has_next_item ? '-12px' : '0',
                }"
              >
                <div
                  class="arrow_down bottom-rect absolute w-[8px] left-0"
                  :style="{
                    height:
                      helicopters?.cross_level && !helicopters?.placeholder_item
                        ? `${37 * helicopters?.cross_level}px`
                        : '5px',
                    bottom:
                      helicopters?.cross_level && !helicopters?.placeholder_item
                        ? `${-37 * helicopters?.cross_level}px`
                        : '-5px',
                  }"
                >
                  <div
                    class="arrow-tip w-0 h-0 absolute bottom-[-4px] left-[-3px]"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 右下关联箭头 -->
          <div
            class="arrow_down arrow-next-left"
            v-if="helicopters?.has_next_right_item"
          >
            <div
              class="arrow_down top-rect relative w-[8px]"
              :style="{
                height: helicopters?.has_next_item ? '0px' : '20px',
              }"
            >
              <div
                class="arrow_down left-long-rect absolute h-[8px] w-[173px] right-[-173px] bottom-0"
                :style="{
                  bottom: helicopters?.has_next_item ? '-12px' : '0',
                }"
              >
                <div
                  class="arrow_down bottom-rect absolute w-[8px] right-0"
                  :style="{
                    height:
                      helicopters?.cross_level && !helicopters?.placeholder_item
                        ? `${37 * helicopters?.cross_level}px`
                        : '5px',
                    bottom:
                      helicopters?.cross_level && !helicopters?.placeholder_item
                        ? `${-37 * helicopters?.cross_level}px`
                        : '-5px',
                  }"
                >
                  <div
                    class="arrow-tip w-0 h-0 absolute bottom-[-4px] right-[-3px]"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="helicopters?.has_next_item"
            class="arrow-tip w-0 h-0 absolute bottom-[-4px] left-[-3px]"
          ></div>
        </div>
      </template>
      <!-- 右水平关联箭头 -->
      <div
        class="arrow_down arrow-right absolute right-[-11px] top-[22px]"
        v-if="helicopters?.has_right_item"
      >
        <div class="arrow_down top-rect relative w-[9px] h-[8px]">
          <div
            class="arrow-tip tip-right w-0 h-0 absolute bottom-[-2.5px] right-[-13px]"
          ></div>
        </div>
      </div>
      <!-- 其它通用指向箭头 -->
      <div
        v-else-if="!isPremium && arrowHeight !== 0 && !is_terminal"
        class="arrow_down absolute left-1/2 bottom-0 w-[8px]"
        :style="{
          top: '59px',
          height: `${arrowHeight - 13}px`,
          transform: 'translateX(-50%)',
        }"
      >
        <div class="arrow-tip w-0 h-0 absolute bottom-[-4px] left-[-3px]"></div>
      </div>

      <!-- 快捷功能栏 -->
      <div
        class="fast-funcs flex items-center"
        v-if="
          contextmenu_state.target_data_unit_id === item.data_unit_id &&
          contextmenu_state.visible
        "
      >
        <div class="func-item" @click="automaticPlanning(item)">
          <div class="flex justify-center">
            <PhArrowElbowLeftUp :size="18" />
          </div>
          <p class="label">向上全选</p>
        </div>
        <div class="func-item" @click="joinQueue(item)">
          <div class="flex justify-center">
            <PhFunction :size="18" />
          </div>
          <p class="label">加入队列</p>
        </div>
        <div class="func-item" @click="jumpDetails(item)">
          <div class="flex justify-center">
            <PhArrowRight :size="18" />
          </div>
          <p class="label">跳转详情</p>
        </div>
      </div>
    </div>

    <!-- 展开折叠载具 -->
    <template v-if="item.items">
      <transition name="fade">
        <div class="folding-vehicle" v-show="showStatus">
          <div
            class="wt-tree-item w-[156px] h-[56px] mb-[30px] cursor-pointer"
            v-for="(subItem, subIndex) in item.items"
            :class="{
              true_select_mode:
                !selected_state_map[subItem.data_unit_id] &&
                !isPremium &&
                settings.true_tree_mode,
              default_select_mode: !settings.true_tree_mode,
              unactive_mode: totalSelectNum,
              selected: selected_state_map[subItem.data_unit_id],
              single_item: subItem.type == 'single',
              [subItem.class_name || 'default']: true,
            }"
            @click="clickTrigger(subItem)"
            @contextmenu.prevent.stop="openContextMenu(subItem)"
          >
            <div class="icon absolute bottom-[3px] left-[2px]">
              <img :src="subItem.vehicle_icon" alt="" />
            </div>
            <div class="title absolute right-[5px] top-[5px] text-[13px] z-10">
              {{ subItem.title }}
            </div>

            <!-- currentPointsType: 0 显示Br，isDefault: false 显示Br -->
            <template v-if="currentPointsType == 0 || !isDefault">
              <div
                class="br absolute right-[20px] bottom-[4px] text-[rgba(255,255,255,.6)] text-[12px] z-10"
              >
                {{ subItem.br }}
              </div>
              <div
                v-if="subItem.main_role"
                class="main_role"
                v-html="main_role_icons[subItem.main_role]"
              ></div>
            </template>
            <!-- currentPointsType: 1 显示Rp -->
            <div
              class="war-points-number absolute right-[2px] bottom-[4px] flex items-center"
              v-if="currentPointsType == 1 && isDefault"
            >
              <span class="text-[12px] mr-[1px]">{{
                subItem.rp_view || "初始"
              }}</span>
              <img :src="`/static/rp.png`" class="w-[16px]" />
            </div>
            <!-- currentPointsType: 2 显示Sp -->
            <div
              class="war-points-number absolute right-[3px] bottom-[4px] flex items-center"
              v-if="currentPointsType == 2 && isDefault"
            >
              <span class="text-[12px] mr-[1px]">{{
                subItem.sp_view || "初始"
              }}</span>
              <img :src="`/static/war-points.png`" class="w-[18px]" />
            </div>

            <div
              v-if="!isPremium && subIndex < item.items.length - 1"
              class="arrow_down absolute left-1/2 bottom-0 w-[8px] bg-[#6a8082] cursor-default"
              @click.stop="() => {}"
              :style="{
                top: '59px',
                height: `16px`,
                transform: 'translateX(-50%)',
              }"
            >
              <!-- 底三角 -->
              <div
                class="arrow-tip w-0 h-0 absolute bottom-[-4px] left-[-3px]"
              ></div>
            </div>

            <!-- 选中态显示图标 -->
            <PhArrowFatLineUp class="selected-icon" :size="17" />

            <!-- 快捷功能栏 -->
            <div
              class="fast-funcs flex items-center"
              v-if="
                contextmenu_state.target_data_unit_id ===
                  subItem.data_unit_id && contextmenu_state.visible
              "
            >
              <div class="func-item" @click="automaticPlanning(subItem)">
                <div class="flex justify-center">
                  <PhArrowElbowLeftUp :size="18" />
                </div>
                <p class="label">向上全选</p>
              </div>
              <div class="func-item">
                <div class="flex justify-center" @click="joinQueue(subItem)">
                  <PhFunction :size="18" />
                </div>
                <p class="label">加入队列</p>
              </div>
              <div class="func-item" @click="jumpDetails(subItem)">
                <div class="flex justify-center">
                  <PhArrowRight :size="18" />
                </div>
                <p class="label">跳转详情</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup>
import { computed, defineProps, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePublicMaskStore } from "@/stores/public_mask";
import { toggleSelectColumnAbove } from "@/utils/treeDataUtils";
import { useTreeDataStore } from "@/stores/tree_data_store";
import {
  PhArrowFatLineUp,
  PhArrowRight,
  PhArrowElbowLeftUp,
  PhFunction,
} from "@phosphor-icons/vue";
import { terminal_vehicles } from "@/utils/terminal_vehicles";
import { main_role_icons } from "@/utils/icon_svgs";

const props = defineProps({
  // 当前载具对象
  item: { type: Object, required: true },
  // 是否为高级载具
  isPremium: { type: Boolean, default: false },
  // 是否为普通载具，只有普通载具才会显示研发点/银狮
  isDefault: { type: Boolean, default: false },
  // 当前载具所属列下标
  colIndex: { type: Number },
  // 当前points类型（0: 权重、1: 研发点、2: 银狮）
  currentPointsType: { type: Number, default: 0 },
  // 当前载具箭头计算数据元信息
  arrow_points: { type: Object, required: false },
});
const emit = defineEmits(["jumpItemDetailPage, joinQueue"]);

const treeDataStore = useTreeDataStore();
const { settings, selected_state_map, tree_data, types, contextmenu_state } =
  storeToRefs(treeDataStore);
const is_terminal = computed(
  () =>
    terminal_vehicles[types.value.country_code][types.value.vehicle_type][
      props.item.data_unit_id
    ],
);
const totalSelectNum = computed(
  () => !!Object.keys(selected_state_map.value).length,
);

const public_mask = usePublicMaskStore();
// 折叠载具面板显示状态
const showStatus = ref(false);
// 判断当前item选中状态
function isItemSelected(item) {
  // single：直接查 map
  if (item.type === "single") {
    return !!selected_state_map.value[item.data_unit_id];
  }

  // multiple：判断 group 逻辑
  if (item.type === "multiple") {
    return item.items.some(
      (child) => selected_state_map.value[child.data_unit_id],
    );
  }

  return false;
}
// 点击item时更新选中状态策略
function clickTrigger(item) {
  if (item.type == "multiple") {
    // settings.multiple_mode: true -> 选中/反选其下第一个折叠载具
    if (settings.value.multiple_mode) {
      treeDataStore.updateSelectedStateMap(item.items[0].data_unit_id);
    }
    // settings.multiple_mode: false -> 打开折叠面板
    else {
      public_mask.setOpacity(0.65);
      public_mask.show();
      showStatus.value = !showStatus.value;
    }
  } else {
    treeDataStore.updateSelectedStateMap(item.data_unit_id);
  }
}

/** 计算其它vehicle_type箭头的高度 */
const arrowHeight = ref(0);
function calcArrowHeight() {
  const ITEM_HEIGHT = 56; // 单个 item 的高度（px）
  const ITEM_MARGIN = 30; // 每个 item 的下外边距（px）
  const RANK_MARGIN = 40; // 等级区域div之间的额外间距（px）

  if (!props.arrow_points) return;
  const { cross_level, placeholder_item, has_next_item } = props.arrow_points;
  const itemHeightSum = placeholder_item * (ITEM_HEIGHT + ITEM_MARGIN); // item高度+下外边距之和
  const rankHeightSum = cross_level * RANK_MARGIN; // 跨行的总外边距之和

  arrowHeight.value =
    itemHeightSum + rankHeightSum + has_next_item * ITEM_MARGIN; // 箭头实际的总长度
}
calcArrowHeight();

/** 计算直升机箭头的高度 */
const helicopters_arrowHeight = ref(0);
const helicopters =
  terminal_vehicles[types.value.country_code][types.value.vehicle_type][
    props.item.data_unit_id
  ];
function calcHelicoptersArrowHeight() {
  const ITEM_HEIGHT = 56; // 单个 item 的高度（px）
  const ITEM_MARGIN = 30; // 每个 item 的下外边距（px）
  const RANK_MARGIN = 40; // 等级区域div之间的额外间距（px）

  if (!helicopters) return;
  const { cross_level, placeholder_item, has_next_item } = helicopters;
  const itemHeightSum = placeholder_item * (ITEM_HEIGHT + ITEM_MARGIN); // item高度+下外边距之和
  const rankHeightSum = cross_level * RANK_MARGIN; // 跨行的总外边距之和

  helicopters_arrowHeight.value =
    itemHeightSum + rankHeightSum + has_next_item * ITEM_MARGIN; // 箭头实际的总长度
}
calcHelicoptersArrowHeight();

/** 监听public_mask.visible的值，让showStatus与其同步 */
watch(
  () => public_mask.visible,
  (newVal) => {
    if (!newVal) {
      showStatus.value = false;
    }
  },
);

/**
 * 右键自动选择当前载具以及同列的上方所有载具
 */
function automaticPlanning(item) {
  let clicked_item;
  if (item.type == "multiple") {
    // settings.multiple_mode: true -> 列选中的最终节点为当下第一个折叠载具
    if (settings.value.multiple_mode) {
      clicked_item = item.items[0];
    }
    // settings.multiple_mode: false -> 列选中的最终节点为当下最后一个折叠载具
    else {
      clicked_item = item.items[item.items.length - 1];
    }
  } else {
    clicked_item = item;
  }

  toggleSelectColumnAbove({
    tree_data,
    clicked_item,
    selected_state_map,
  });
}

// 跳转详情页
function jumpDetails(item) {
  emit("jumpItemDetailPage", item);
}

// 打开右键菜单
function openContextMenu(target_item) {
  if (target_item.type == "multiple") {
    return;
  }
  contextmenu_state.value.target_data_unit_id = target_item.data_unit_id;
  contextmenu_state.value.visible = true;
}

// 加入动态规划队列
function joinQueue(item) {
  emit("joinQueue", {
    isPremium: props.isPremium,
    colIndex: props.colIndex,
    item,
  });
}
</script>

<style>
.main_role svg {
  height: 14px !important;
}
</style>

<style scoped>
.fast-funcs {
  position: absolute;
  right: 0;
  bottom: -60px;
  background-color: #1c2b2e;
  z-index: 11;
  border-radius: 4px;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.4);
  border: 1px solid rgb(37, 55, 60);
  padding: 4px;
  animation: showOpa 0.2s;
}
@keyframes showOpa {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.fast-funcs::before {
  content: "";
  position: absolute;
  top: -6px;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #1c2b2e;
}
.func-item {
  width: 58px;
  padding: 2px 0;
  border-radius: 5px;
  cursor: pointer;
}
.func-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.func-item .label {
  font-size: 11px;
  margin-top: 2px;
  color: #c9c9c9;
  text-align: center;
}
.main_role {
  position: absolute;
  bottom: 6px;
  right: 3px;
}
.folding-vehicle {
  position: absolute;
  background-color: rgb(30, 43, 46);
  border: 1px solid #38434d;
  box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.2);
  z-index: 1000 !important;
  top: -30px;
  left: -25px;
  padding: 25px 25px 0;
}
/* item背景点状压纹 */
.wt-tree-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #fff 1px, transparent 1px);
  background-size: 5px 5px;
  -webkit-mask-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 30%,
    rgba(0, 0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 30%,
    rgba(0, 0, 0, 0) 100%
  );
  opacity: 0.04; /* 👈 控制透明度 */
}
.wt-tree-item {
  border: 1px solid #495a5f;
  border-top: 2px solid #6a7b82;
  box-shadow: 0 2px 3px 1px rgba(0, 0, 0, 0.1);
  background-color: rgb(66, 78, 90);
  position: relative;
  user-select: none;
  top: 0;
  transition: 0.2s;
  /* 真实还原模式下的银币载具未选中状态样式 */
  /* item背景色 */
  --true_mode_item_bgc: #300d13;
  /* item边框色 */
  --true_mode_item_border: #501521;
  /* item顶边框色 */
  --true_mode_item_border_top: #8a1129;
  /* item指向箭头色 */
  --true_mode_item_arrow: #6d1829;

  /* 载具选中状态样式 */
  /* 普通载具选中状态图标主题色 */
  --default-icon-bg: rgba(185, 215, 243, 0.5);
  /* 高级载具选中状态图标主题色 */
  --prem-icon-bg: rgba(255, 211, 124, 0.5);
  /* 高级载具选中状态图标主题色 */
  --squad-icon-bg: rgba(126, 227, 31, 0.5);
  /* 普通载具选中状态顶边框色 */
  --default-selected_border_top: #adadad;
  /* 高级载具选中状态顶边框色 */
  --prem-selected_border_top: #daac50;
  /* 联队载具选中状态顶边框色 */
  --squad-selected_border_top: #7ecd46;
}
/* 高级载具未选中状态配色 */
.wt-tree-item.prem {
  border: 1px solid #57441e;
  border-top: 2px solid #8b6626;
  background-color: #594b20;
  background-image: linear-gradient(to bottom, transparent, #372f15);
}
/* 联队载具未选中状态配色 */
.wt-tree-item.squad {
  border: 1px solid #40642c;
  border-top: 2px solid #588537;
  background-color: #3b5734;
}
.wt-tree-item.selected {
  /* border-image: linear-gradient(to right, #4e4e4e, #adadad, #53555a) 1; */
  border-top-color: var(--default-selected_border_top);
}
.wt-tree-item.prem.selected {
  /* border-image: linear-gradient(to right, #764f0a, #daac50, #5d3c02) 1; */
  border-top-color: var(--prem-selected_border_top);
}
.wt-tree-item.squad.selected {
  /* border-image: linear-gradient(to right, #3d6724, #7ecd46, #2a6c04) 1; */
  border-top-color: var(--squad-selected_border_top);
}
.selected-icon {
  position: absolute;
  left: 2px;
  top: 1px;
  opacity: 0;
}
.wt-tree-item.selected .selected-icon {
  opacity: 1;
  fill: var(--default-icon-bg);
}
.wt-tree-item.selected.prem .selected-icon {
  fill: var(--prem-icon-bg);
}
.wt-tree-item.selected.squad .selected-icon {
  fill: var(--squad-icon-bg);
}
.wt-tree-item.selected::after {
  content: "";
  position: absolute;
  width: 22px;
  height: 25px;
  top: 0;
  left: 0;
  background-image: linear-gradient(
    to bottom,
    var(--default-icon-bg),
    transparent
  );
}
.wt-tree-item.prem.selected::after {
  background-image: linear-gradient(
    to bottom,
    var(--prem-icon-bg),
    transparent
  );
}
.wt-tree-item.squad.selected::after {
  background-image: linear-gradient(
    to bottom,
    var(--squad-icon-bg),
    transparent
  );
}
.wt-tree-item.unactive_mode:not(.true_select_mode) {
  opacity: 0.4;
}
.wt-tree-item.selected {
  opacity: 1 !important;
}
.trapezoid {
  width: 30%;
  height: 5px;
  position: absolute;
  left: -1px;
  top: -5px;
  background-color: #6a7b82;
  clip-path: polygon(0 0, 85% 0, 100% 100%, 0 100%);
}
.wt-tree-item.selected .trapezoid {
  background-color: var(--default-selected_border_top);
}
.wt-tree-item.prem .trapezoid {
  background-color: #8b6626;
}
.wt-tree-item.prem.selected .trapezoid {
  background-color: var(--prem-selected_border_top);
}
.wt-tree-item.squad .trapezoid {
  background-color: #588537;
}
.wt-tree-item.squad.selected .trapezoid {
  background-color: var(--squad-selected_border_top);
}
.arrow_down {
  background-color: #6a8082;
}
.wt-tree-item.true_select_mode:not(.selected) .arrow_down {
  background-color: var(--true_mode_item_arrow);
}
.arrow-tip {
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 6px solid #6a8082;
}
.arrow-tip.tip-right {
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 6px solid #6a8082;
}
.wt-tree-item.true_select_mode:not(.selected) .arrow-tip {
  border-top: 6px solid var(--true_mode_item_arrow);
}
.wt-tree-item.true_select_mode:not(.selected) {
  background-color: var(--true_mode_item_bgc);
  border-color: var(--true_mode_item_border);
  border-top-color: var(--true_mode_item_border_top);
}
.wt-tree-item.true_select_mode:not(.selected) .trapezoid {
  background-color: var(--true_mode_item_border_top);
}
.wt-tree-item.true_select_mode:not(.selected) .icon {
  opacity: 0.3;
}
/* 其它样式 + ------------------------------------------------------- + */
.wt-tree-item .icon img {
  height: 46px;
}
.amulet {
  position: absolute;
  left: calc(50% - 10px);
  top: -10px;
}
.amulet img {
  width: 20px;
}
.wt-tree-item .title,
.folding-vehicle .wt-tree-item .title {
  max-width: 90%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>

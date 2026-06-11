<template>
  <!-- .wt-tree-item_mask是为了解决stacking context问题而设立的 -->
  <div
    class="wt-tree-item_mask relative"
    @contextmenu.prevent.stop="automaticPlanning(item)"
  >
    <div
      class="wt-tree-item w-[150px] h-[56px] mb-[30px]"
      :class="{
        select_mode: totalSelectNum,
        selected: item.selected,
        [item.class_name]: true,
      }"
      :title="item.items ? 'Click to expand the folded vehicle' : ''"
      :data_unit_id="item.data_unit_id"
    >
      <div
        class="inner-click-mask cursor-pointer absolute w-full h-full top-0 left-0"
        @click="clickTrigger(item)"
      >
        <div class="icon absolute bottom-[3px] left-[2px]">
          <img :src="item.vehicle_icon" />
        </div>
        <div
          class="title absolute right-[5px] top-[5px] text-[13px] z-10"
          :title="item.title"
        >
          {{ item.title }}
        </div>
        <div
          class="public-loader small absolute right-[5px] bottom-[5px]"
          v-if="!item.details"
        ></div>

        <template v-else>
          <!-- currentPointsType: 0 显示Br，isDefault: false 显示Br -->
          <!-- 当具备items时，显示其下第一个子载具的main_role -->
          <template v-if="currentPointsType == 0 || !isDefault">
            <div
              class="br absolute right-[20px] bottom-[4px] text-[rgba(255,255,255,.6)] text-[12px] z-10"
            >
              {{ item.br }}
            </div>
            <img
              v-if="item.main_role"
              :src="`/static/main_role/${item.main_role}.svg`"
              class="h-[14px] absolute bottom-[6px] right-[4px]"
            />
            <img
              v-else-if="item.items"
              :src="`/static/main_role/${item.items[0].main_role}.svg`"
              class="h-[14px] absolute bottom-[6px] right-[4px]"
            />
          </template>
          <!-- currentPointsType: 1 显示Rp -->
          <div
            class="war-points-number absolute right-[2px] bottom-[4px] flex items-center"
            v-if="currentPointsType == 1 && isDefault"
          >
            <span class="text-[12px] mr-[1px]">{{
              item.items ? item.items[0].rp || "free" : item.rp || "free"
            }}</span>
            <img :src="`/static/rp.svg`" class="w-[16px]" />
          </div>
          <!-- currentPointsType: 2 显示Sp -->
          <div
            class="war-points-number absolute right-[3px] bottom-[4px] flex items-center"
            v-if="currentPointsType == 2 && isDefault"
          >
            <span class="text-[12px] mr-[1px]">{{
              item.items ? item.items[0].sp || "free" : item.sp || "free"
            }}</span>
            <img :src="`/static/war-points.svg`" class="w-[18px]" />
          </div>
        </template>
        <!-- 左上角梯形 -->
        <div
          class="trapezoid"
          :class="item.class_name"
          :hidden="item.type == 'single'"
        >
          <div class="left-border-fill"></div>
          <div class="right-tip"></div>
        </div>
        <!-- 护身符 -->
        <div class="amulet" :hidden="item.class_name != 'prem'">
          <img :src="`/static/premium_vehicle.svg`" alt="" />
        </div>

        <!-- 金鹰背景 -->
        <div class="gold" :hidden="item.class_name != 'prem'"></div>

        <!-- 银狮背景 -->
        <div class="war-points" :hidden="item.class_name != ''"></div>
      </div>

      <!-- 指向箭头 -->
      <div
        v-if="
          !isPremium &&
          arrowHeight !== 0 &&
          planPathToTarget2Params?.type !== 'helicopters'
        "
        class="absolute left-1/2 bottom-0 w-[8px] bg-[#6a8082]"
        :style="{
          top: '59px',
          height: `${arrowHeight - 13}px`,
          transform: 'translateX(-50%)',
        }"
      >
        <!-- 底三角 -->
        <div
          class="arrow-tip w-0 h-0 absolute bottom-[-4px] left-[-3px]"
          style="
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            /* border-top: 8px solid #6a8082; */
            border-top: 6px solid #6a8082;
          "
        ></div>
      </div>
    </div>

    <!-- 展开折叠载具 -->
    <template v-if="item.items">
      <transition name="fade">
        <div class="folding-vehicle" v-show="showStatus">
          <div
            class="wt-tree-item w-[150px] h-[56px] mb-[30px] cursor-pointer"
            v-for="(subItem, subIndex) in item.items"
            :class="{
              select_mode: totalSelectNum,
              selected: subItem.selected,
              [subItem.class_name]: true,
            }"
            @click="clickTrigger(subItem)"
            @contextmenu.prevent.stop="automaticPlanning(subItem)"
          >
            <div class="icon absolute bottom-[3px] left-[2px]">
              <img :src="subItem.vehicle_icon" alt="" />
            </div>
            <div class="title absolute right-[5px] top-[5px] text-[13px] z-10">
              {{ subItem.title }}
            </div>
            <div
              class="public-loader small absolute right-[5px] bottom-[5px]"
              v-if="!subItem.details"
            ></div>

            <template v-else>
              <!-- currentPointsType: 0 显示Br，isDefault: false 显示Br -->
              <template v-if="currentPointsType == 0 || !isDefault">
                <div
                  class="br absolute right-[20px] bottom-[4px] text-[rgba(255,255,255,.6)] text-[12px] z-10"
                >
                  {{ subItem.br }}
                </div>
                <img
                  v-if="subItem.main_role"
                  :src="`/static/main_role/${subItem.main_role}.svg`"
                  class="h-[14px] absolute bottom-[6px] right-[4px]"
                />
              </template>
              <!-- currentPointsType: 1 显示Rp -->
              <div
                class="war-points-number absolute right-[2px] bottom-[4px] flex items-center"
                v-if="currentPointsType == 1 && isDefault"
              >
                <span class="text-[12px] mr-[1px]">{{
                  subItem.rp || "free"
                }}</span>
                <img :src="`/static/rp.svg`" class="w-[16px]" />
              </div>
              <!-- currentPointsType: 2 显示Sp -->
              <div
                class="war-points-number absolute right-[3px] bottom-[4px] flex items-center"
                v-if="currentPointsType == 2 && isDefault"
              >
                <span class="text-[12px] mr-[1px]">{{
                  subItem.sp || "free"
                }}</span>
                <img :src="`/static/war-points.svg`" class="w-[18px]" />
              </div>
            </template>

            <div
              v-if="!isPremium && subIndex < item.items.length - 1"
              class="absolute left-1/2 bottom-0 w-[8px] bg-[#6a8082] cursor-default"
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
                style="
                  border-left: 7px solid transparent;
                  border-right: 7px solid transparent;
                  /* border-top: 8px solid #6a8082; */
                  border-top: 6px solid #6a8082;
                "
              ></div>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePublicMaskStore } from "@/stores/public_mask";
import { usePublicMessageDialogStore } from "@/stores/public_message_dialog";
import {
  getSelectedPremiumIds,
  toggleSelectColumnAbove,
} from "@/utils/treeDataUtils";
import { planPathToTarget2 } from "@/utils/planPathToTarget2";
import { useTreeDataStore } from "@/stores/tree_data";

const treeDataStore = useTreeDataStore();
const { multiple_mode } = storeToRefs(treeDataStore);

const props = defineProps({
  /**
   * 当前载具对象
   * @type {Object}
   */
  item: { type: Object, required: true },
  isPremium: { type: Boolean, default: false },
  // 是否为普通载具，只有普通载具才会显示研发点/银狮
  isDefault: { type: Boolean, default: false },
  // 当前points类型（0: 权重、1: 研发点、2: 银狮）
  currentPointsType: { type: Number, default: 0 },
  // 当前已选中载具数量
  totalSelectNum: { type: Number, default: 0 },
  // planPathToTarget2函数所需必要参数
  planPathToTarget2Params: { type: Object },
});
const emit = defineEmits(["updateItemSelected"]);

const public_mask = usePublicMaskStore();
const showStatus = ref(false);
function clickTrigger(item) {
  if (!item.items) {
    /**
     * 单载具，切换其selected，触发tree_data更新
     */
    emit("updateItemSelected", item, !item.selected);
  } else {
    /**
     * 多载具，根据偏好设置中的multiple_mode项执行不同逻辑：
     *  - multiple_mode为true时，执行multipleEvent函数逻辑
     *  - multiple_mode为false时，执行展开折叠列表逻辑
     */
    if (multiple_mode.value) {
      return multipleEvent(item);
    }
    public_mask.setOpacity(0.55);
    public_mask.show();
    showStatus.value = !showStatus.value;
  }
}

const arrowHeight = ref(0);
/** 计算箭头的高度 */
function calcArrowHeight() {
  const ITEM_HEIGHT = 56; // 单个 item 的高度（px）
  const ITEM_MARGIN = 30; // 每个 item 的下外边距（px）
  const RANK_MARGIN = 40; // 等级区域div之间的额外间距（px）

  if (!props.item.arrow_points) return;
  const { cross_level, placeholder_item, has_next_item } =
    props.item.arrow_points;
  const itemHeightSum = placeholder_item * (ITEM_HEIGHT + ITEM_MARGIN); // item高度+下外边距之和
  const rankHeightSum = cross_level * RANK_MARGIN; // 跨行的总外边距之和

  arrowHeight.value =
    itemHeightSum + rankHeightSum + has_next_item * ITEM_MARGIN; // 箭头实际的总长度
}
calcArrowHeight();

/** 监听public_mask.visible的值，让showStatus与其同步 */
watch(
  () => public_mask.visible,
  (newVal) => {
    if (!newVal) {
      showStatus.value = false;
    }
  }
);

const messageStore = usePublicMessageDialogStore();

/** 一键自动规划路线 */
function automaticPlanning_(item) {
  const _item = item;
  messageStore.show(
    "⚠️ 一键规划路线属于开放实验性功能，结果不一定符合预期，请知悉！",
    3000
  );
  // 如果对一个multiple-item进行单击，则直接规划其下items中第一个item
  if (item.items) {
    _item = item.items[0];
  }
  // 遍历tree_data，筛选出所有premium_vehicles下selected为true的item，并将其data_unit_id导出到一个数组中
  const preset_data_unit_ids = getSelectedPremiumIds(
    props.planPathToTarget2Params.tree_data
  );
  // 开始规划路线
  planPathToTarget2({
    ...props.planPathToTarget2Params,
    target_data_unit_id: _item.data_unit_id,
    preset_data_unit_ids,
  });
}

/**
 * 一键自动规划路线临时替代方案-全选当前列
 */
function automaticPlanning(item) {
  console.log(item);
  toggleSelectColumnAbove({
    ...props.planPathToTarget2Params,
    clicked_item: item,
    select: !item.selected,
  });
  // console.log(props.planPathToTarget2Params);
}

let lastClickTime = 0,
  multipleTimer = null;

function multipleEvent({ selected, items }) {
  const now = Date.now();

  // 双击
  if (now - lastClickTime < 300) {
    lastClickTime = 0;
    clearTimeout(multipleTimer);
    // 展开折叠列表
    public_mask.setOpacity(0.55);
    public_mask.show();
    showStatus.value = !showStatus.value;
    return;
  }

  lastClickTime = now;
  multipleTimer = setTimeout(() => {
    if (Date.now() - lastClickTime >= 300) {
      // 单击
      // 其下items均未选中则默认选中第一个子item
      if (!selected) {
        emit("updateItemSelected", items[0], true);
      }
      // 否则其下items所有子item全部取消选中
      else {
        for (let i = 0; i < items.length; i++) {
          emit("updateItemSelected", items[i], false);
        }
      }
    }
  }, 300);
}
</script>

<style scoped>
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
.wt-tree-item {
  border: 1px solid #3d4c51;
  border-top: 2px solid #62737a;
  box-shadow: 0 2px 3px 1px rgba(0, 0, 0, 0.1);
  background-color: rgb(56, 67, 77, 1);
  position: relative;
  user-select: none;
  top: 0;
  transition: 0.3s;
}
.wt-tree-item.select_mode {
  /* filter: brightness(50%); */
  opacity: 0.4;
}
.wt-tree-item.selected {
  /* filter: brightness(100%); */
  opacity: 1;
}
.wt-tree-item.prem {
  border: 1px solid #57441e;
  border-top: 2px solid #8b6626;
  background-color: #493e1a;
  background-image: linear-gradient(to bottom, transparent, #372f15);
}
.wt-tree-item.squad {
  border: 1px solid #3e5c2c;
  border-top: 2px solid #4b712f;
  background-color: #32492d;

}
.wt-tree-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("/static/6417ea1848ed628c46d5.png");
  opacity: 0.3; /* 👈 控制透明度 */
}
.wt-tree-item.prem::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("/static/6417ea1848ed628c46d5-white.png");
  opacity: 0.1; /* 👈 控制透明度 */
}
.wt-tree-item .icon img {
  height: 46px;
}
.trapezoid {
  width: 30px;
  height: 6px;
  background-color: #38434d;
  /* background-color: #fff; */
  position: absolute;
  top: -6px;
  left: 0;
  border-top: 2px solid #62737a;
}
.trapezoid.prem {
  background-color: #433c28;
  border-top: 2px solid #7b591f;
}
.trapezoid::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("/static/6417ea1848ed628c46d5.png");
  opacity: 0.3; /* 👈 控制透明度 */
}
.left-border-fill {
  position: absolute;
  left: -1px;
  top: -2px;
  width: 1px;
  height: 7px;
  background-color: #3d4c51;
}
.trapezoid.prem .left-border-fill {
  background-color: #5b471f;
}
.right-tip {
  width: 7px;
  height: 0;
  border-right: 7px solid transparent;
  border-bottom: 6px solid #62737a;
  position: absolute;
  right: -7px;
  top: -2px;
  z-index: 100;
}
.trapezoid.prem .right-tip {
  border-bottom: 6px solid #7b591f;
}
.right-tip::after {
  content: "";
  width: 4px;
  height: 0;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #38474b;
  position: absolute;
  left: 0;
  bottom: -6px;
}
.trapezoid.prem .right-tip::after {
  content: "";
  width: 4px;
  height: 0;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #433c28;
  position: absolute;
  left: 0;
  bottom: -6px;
}
.amulet {
  position: absolute;
  left: calc(50% - 10px);
  top: -9px;
}
.amulet img {
  width: 20px;
}
.gold {
  background-image: url(/static/gold-.svg);
  background-repeat: no-repeat;
  background-position: right top;
  background-size: auto 135%;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  z-index: 0;
  opacity: 0.1;
}
.war-points {
  background: url(/static/war-points.svg) no-repeat right top;
  background-size: auto 135%;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  z-index: 0;
  opacity: 0.02;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.wt-tree-item .title,
.folding-vehicle .wt-tree-item .title {
  max-width: 90%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.wt-tree-item.selected {
  border-image: linear-gradient(to right, #4e4e4e, #adadad, #53555a) 1;
  box-shadow: #aaaaaa 0 20px 80px -15px;
}
.wt-tree-item.prem.selected {
  border-image: linear-gradient(to right, #764f0a, #daac50, #5d3c02) 1;
  box-shadow: #ae8635 0 20px 80px -15px;
}
.wt-tree-item.squad.selected {
  border-image: linear-gradient(to right, #3d6724, #7ecd46, #2a6c04) 1;
  box-shadow: #66b22f 0 20px 80px -15px;
}
</style>

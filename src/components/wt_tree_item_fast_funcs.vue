<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fast-funcs"
      :style="positionStyle"
      @click.stop
      @contextmenu.prevent.stop
    >
      <button
        type="button"
        class="func-item"
        :class="{
          'func-item-divider': item.dividerBefore,
          disabled: item.disabled,
          'cancel-target-mark': item.trigger === 'set-target' && item.isCancel,
          'cancel-waypoint-mark':
            item.trigger === 'set-waypoint' && item.isCancel,
        }"
        :disabled="item.disabled"
        @click="trigger(item.trigger)"
        v-for="item in visibleOptions"
        :key="item.trigger"
      >
        <!-- <component :is="item.icon" :size="16" /> -->
        <span class="func-item-label">{{ item.label }}</span>
        <span v-if="item.shortcut" class="func-item-shortcut">
          {{ item.shortcut }}
        </span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import {
  PhArrowElbowLeftUp,
  PhPlay,
  PhTarget,
  PhMapPin,
  PhArrowRight,
} from "@phosphor-icons/vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  anchorRect: { type: Object, default: null },
  showAsTarget: { type: Boolean, default: false },
  isTarget: { type: Boolean, default: false },
  showQuickPlanning: { type: Boolean, default: false },
  showAddToComparison: { type: Boolean, default: false },
  showAsWaypoint: { type: Boolean, default: false },
  isWaypoint: { type: Boolean, default: false },
  isMacOS: { type: Boolean, default: false },
  isComparisonPreview: { type: Boolean, default: false },
});
const emit = defineEmits([
  "automatic-planning",
  "quick-planning",
  "add-to-comparison",
  "set-target",
  "set-waypoint",
  "jump-details",
  "close",
]);

const func_options = [
  {
    icon: PhArrowElbowLeftUp,
    label: "向上全选",
    trigger: "automatic-planning",
  },
  {
    icon: PhArrowElbowLeftUp,
    label: "加入对比列表",
    trigger: "add-to-comparison",
  },
  {
    icon: PhTarget,
    label: "标记为目标载具",
    trigger: "set-target",
    dividerBefore: true,
  },
  {
    icon: PhMapPin,
    label: "标记为途径点",
    trigger: "set-waypoint",
  },
  {
    icon: PhPlay,
    label: "快速规划",
    trigger: "quick-planning",
  },
  {
    icon: PhArrowRight,
    label: "跳转详情",
    trigger: "jump-details",
    dividerBefore: true,
  },
];

function isOptionAvailable(option) {
  if (
    props.isComparisonPreview &&
    !["add-to-comparison", "jump-details"].includes(option.trigger)
  ) {
    return false;
  }
  if (option.trigger === "set-target") return props.showAsTarget;
  if (option.trigger === "set-waypoint") return props.showAsWaypoint;
  if (option.trigger === "quick-planning") return props.showQuickPlanning;
  if (option.trigger === "add-to-comparison") return props.showAddToComparison;
  return true;
}

const visibleOptions = computed(() =>
  func_options.map((option) => {
    const item = { ...option, disabled: !isOptionAvailable(option) };

    if (option.trigger === "set-target") {
      item.label = props.isTarget ? "取消目标载具标记" : "标记为目标载具";
      item.isCancel = props.isTarget;
    }
    if (option.trigger === "set-waypoint") {
      item.label = props.isWaypoint ? "取消途径点标记" : "标记为途径点";
      item.isCancel = props.isWaypoint;
    }

    const shortcuts = props.isMacOS
      ? {
          "automatic-planning": "⇧+单击",
          "quick-planning": "⌘+单击",
          "set-target": "⌥+单击",
          "set-waypoint": "⌃+单击",
        }
      : {
          "automatic-planning": "Shift+单击",
          "quick-planning": "Ctrl+单击",
          "set-target": "Alt+单击",
          "set-waypoint": "Tab+单击",
        };
    item.shortcut = shortcuts[option.trigger] || "";

    return item;
  }),
);

// 菜单容器的宽度
const MENU_WIDTH = 192;
// 每个菜单选项的高度
const MENU_ITEM_HEIGHT = 29;
// 菜单容器定位时的额外安全距离
const MENU_SAFE_MARGIN = 30;
// 菜单与载具、菜单与浏览器视口边缘之间的间距
const GAP = 8;
const menuHeight = computed(
  () => visibleOptions.value.length * MENU_ITEM_HEIGHT + MENU_SAFE_MARGIN,
);

const positionStyle = computed(() => {
  const rect = props.anchorRect;
  if (!rect) return {};
  const menuWidth = MENU_WIDTH;

  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - menuWidth / 2, GAP),
    Math.max(GAP, window.innerWidth - menuWidth - GAP),
  );
  const fitsBelow = rect.bottom + GAP + menuHeight.value <= window.innerHeight;
  const top = fitsBelow
    ? rect.bottom + GAP
    : Math.max(GAP, rect.top - menuHeight.value - GAP);

  return { left: `${left}px`, top: `${top}px`, width: `${MENU_WIDTH}px` };
});

function trigger(eventName) {
  if (eventName === "automatic-planning") emit("automatic-planning");
  if (eventName === "quick-planning") emit("quick-planning");
  if (eventName === "add-to-comparison") emit("add-to-comparison");
  if (eventName === "set-target") emit("set-target");
  if (eventName === "set-waypoint") emit("set-waypoint");
  if (eventName === "jump-details") emit("jump-details");
  emit("close");
}

function closeOnViewportChange() {
  if (props.visible) emit("close");
}

onMounted(() => {
  window.addEventListener("resize", closeOnViewportChange);
  window.addEventListener("scroll", closeOnViewportChange, true);
});

onUnmounted(() => {
  window.removeEventListener("resize", closeOnViewportChange);
  window.removeEventListener("scroll", closeOnViewportChange, true);
});
</script>

<style scoped>
.fast-funcs {
  position: fixed;
  z-index: 10020;
  display: flex;
  flex-direction: column;
  padding: 4px;
  color: #f2f2f7;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 6px;
  /* background:
    linear-gradient(135deg, rgba(41, 41, 46, 0.8), rgba(28, 28, 32, 0.8)),
    rgba(30, 31, 34, 0.8); */
  /* background-color: #171c22; */
  background-color: #1f2730;
  box-shadow:
    0 18px 44px rgba(0, 0, 0, 0.48),
    0 3px 10px rgba(0, 0, 0, 0.38),
    inset 0 1px rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.func-item {
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  padding: 3px 12px 2px 12px;
  margin: 2px 0;
  text-align: left;
  color: inherit;
  border: 0;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.func-item:not(.disabled):hover {
  color: #fff;
  background-color: #1557bd;
}

.func-item.cancel-target-mark,
.func-item.cancel-waypoint-mark {
  color: #fff;
  background-color: #b83c3c;
}

.func-item.cancel-target-mark:not(.disabled):hover,
.func-item.cancel-waypoint-mark:not(.disabled):hover {
  background-color: #d14a4a;
}

.func-item.disabled,
.func-item:disabled {
  color: rgba(242, 242, 247, 0.36);
  cursor: default;
}

.func-item.disabled :deep(svg),
.func-item:disabled :deep(svg) {
  color: rgba(201, 201, 207, 0.36);
}

.func-item:focus-visible {
  outline: 2px solid rgba(100, 210, 255, 0.9);
  outline-offset: -2px;
}

.func-item :deep(svg) {
  flex: 0 0 auto;
  color: #c9c9cf;
}

.func-item:hover :deep(svg) {
  color: #fff;
}

.func-item span {
  color: inherit;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.2px;
}

.func-item-shortcut {
  color: rgba(242, 242, 247, 0.3) !important;
  font-size: 12px !important;
  white-space: nowrap;
  letter-spacing: 1px !important;
}

.func-item:not(.disabled):hover .func-item-shortcut,
.func-item.cancel-target-mark .func-item-shortcut,
.func-item.cancel-waypoint-mark .func-item-shortcut {
  color: rgba(255, 255, 255, 0.84);
}

.func-item-divider {
  position: relative;
  margin-top: 9px;
}

.func-item-divider::before {
  position: absolute;
  top: -5px;
  right: 8px;
  left: 8px;
  height: 1px;
  content: "";
  background-color: rgba(255, 255, 255, 0.16);
}

.func-item.disabled {
  opacity: 0.75;
}
</style>

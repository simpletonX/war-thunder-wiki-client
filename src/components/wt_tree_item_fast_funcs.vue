<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fast-funcs"
      :style="{ ...positionStyle, width: visibleOptions.length * 60 + 8 + 'px' }"
      @click.stop
      @contextmenu.prevent.stop
    >
      <button
        type="button"
        class="func-item"
        @click="trigger(item.trigger)"
        v-for="item in visibleOptions"
        :key="item.trigger"
      >
        <component :is="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import {
  PhArrowElbowLeftUp,
  PhTarget,
  PhArrowRight,
} from "@phosphor-icons/vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  anchorRect: { type: Object, default: null },
  showAsTarget: { type: Boolean, default: false },
  isTarget: { type: Boolean, default: false },
});
const emit = defineEmits([
  "automatic-planning",
  "set-target",
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
    icon: PhTarget,
    label: "标记目标",
    trigger: "set-target",
  },
  {
    icon: PhArrowRight,
    label: "跳转详情",
    trigger: "jump-details",
  },
];

const visibleOptions = computed(() =>
  func_options
    .filter(
      (option) => option.trigger !== "set-target" || props.showAsTarget,
    )
    .map((option) =>
      option.trigger === "set-target"
        ? { ...option, label: props.isTarget ? "取消标记" : "标记目标" }
        : option,
    ),
);

const MENU_HEIGHT = 64;
const GAP = 8;

const positionStyle = computed(() => {
  const rect = props.anchorRect;
  if (!rect) return {};
  const menuWidth = visibleOptions.value.length * 60 + 8;

  const left = Math.min(
    Math.max(rect.right - menuWidth, GAP),
    Math.max(GAP, window.innerWidth - menuWidth - GAP),
  );
  const fitsBelow = rect.bottom + GAP + MENU_HEIGHT <= window.innerHeight;
  const top = fitsBelow
    ? rect.bottom + GAP
    : Math.max(GAP, rect.top - MENU_HEIGHT - GAP);

  return { left: `${left}px`, top: `${top}px` };
});

function trigger(eventName) {
  if (eventName === "automatic-planning") emit("automatic-planning");
  if (eventName === "set-target") emit("set-target");
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
  align-items: center;
  padding: 4px;
  color: #fff;
  border: 1px solid rgb(37, 55, 60);
  border-radius: 4px;
  background-color: #1c2b2e;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.4);
}

.func-item {
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 0;
  color: inherit;
  border: 0;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
}

.func-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.func-item span {
  margin-top: 2px;
  color: #c9c9c9;
  font-size: 11px;
}
</style>

<template>
  <div class="cir-tabs" role="tablist" :aria-label="ariaLabel">
    <template
      v-for="(item, index) in options"
      :key="item.id ?? item.value ?? index"
    >
      <div
        class="cir-tabs__item"
        @contextmenu="onContextMenu($event, item)"
      >
        <input
          class="cir-tabs__r"
          type="radio"
          :name="name"
          :id="getId(item, index)"
          :value="item.id"
          :checked="modelValue == item.id"
          @change="onChange(item)"
        />

        <label
          class="cir-tabs__t"
          :for="getId(item, index)"
          role="tab"
          :title="item.removable ? '右键删除此对比' : undefined"
        >
          <!-- <img
            v-if="item.icon"
            class="cir-tabs__icon"
            :src="item.icon"
            alt=""
          /> -->
          {{ item.title }}
        </label>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  name: {
    type: String,
    default: () => "cir-tabs-" + Math.random().toString(36).slice(2),
  },
  ariaLabel: {
    type: String,
    default: "tabs",
  },
});

const emit = defineEmits(["update:modelValue", "change", "remove"]);

const getId = (item, index) => {
  return `${props.name}-${index}`;
};

const onChange = (item) => {
  // v-model 保存选项 ID；change 保留完整选项，兼容现有调用方。
  emit("update:modelValue", item.id);
  emit("change", item);
};

const remove = (item) => emit("remove", item);

function onContextMenu(event, item) {
  if (!item.removable) return;

  event.preventDefault();
  remove(item);
}
</script>

<style scoped>
.cir-tabs {
  display: inline-flex;
  align-items: center;
  background: rgba(14, 17, 22, 0.5);
  /* border: 1px solid var(--color-edge, #e3e8ee); */
  border-radius: 999px;
  box-shadow:
    0 1px 1px rgba(14, 17, 22, 0.04),
    0 20px 40px -24px rgba(14, 17, 22, 0.18);
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.cir-tabs__r {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.cir-tabs__item {
  position: relative;
  display: flex;
}

.cir-tabs__t {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-mist, #788396);
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1);
  font-family: "WTSymbols", "微软雅黑";
}

.cir-tabs__t:hover {
  color: var(--color-ink, #fff);
}

.cir-tabs__icon {
  width: 20px;
  height: 20px;
  margin-right: 6px;
  object-fit: contain;
}

.cir-tabs__r:checked + .cir-tabs__t {
  background: var(--color-ink, #444d5d);
  color: var(--color-cloud, #ffffff);
  box-shadow:
    0 1px 1px rgba(14, 17, 22, 0.06),
    0 8px 18px -10px rgba(14, 17, 22, 0.5);
}

.cir-tabs__r:focus-visible + .cir-tabs__t {
  box-shadow: 0 0 0 3px rgba(46, 125, 239, 0.32);
}
</style>

<!-- 使用方式示例：
<script setup>
import { ref } from "vue"
import CirTabs from "./CirTabs.vue"

const tab = ref("week")

const options = [
  { title: "Day", value: "day" },
  { title: "Week", value: "week" },
  { title: "Month", value: "month" },
  { title: "Year", value: "year" }
]

const onChange = (val) => {
  console.log("changed:", val)
}
</script>

<template>
  <CirTabs
    v-model="tab"
    :options="options"
    @change="onChange"
  />
</template>
 -->

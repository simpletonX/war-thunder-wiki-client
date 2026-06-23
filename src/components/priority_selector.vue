<template>
  <div class="priority-selector">
    <div
      v-for="(item, index) in count"
      :key="index"
      class="priority-item"
      :class="{
        selected: getPriority(index) > 0 && !ignoreColumns.includes(index),
        not_select: ignoreColumns.includes(index),
      }"
      @click="toggle(index)"
    >
      <slot
        name="item"
        :index="index"
        :priority="getPriority(index)"
        :selected="getPriority(index) > 0"
        :items="item"
      >
        <template v-if="getPriority(index)">
          {{ getPriority(index) }}
        </template>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  /**
   * 圆点数量
   */
  count: {
    type: Array,
    required: true,
  },

  /**
   * 优先级数组
   * 示例：
   * [2, 4, 0]
   * 表示：
   * 优先级1 -> 第3个
   * 优先级2 -> 第5个
   * 优先级3 -> 第1个
   */
  modelValue: {
    type: Array,
    default: () => [],
  },

  // 忽略的列（不可选中）
  ignoreColumns: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

function getPriority(itemIndex) {
  const priority = selected.value.indexOf(itemIndex);
  return priority === -1 ? 0 : priority + 1;
}

function toggle(itemIndex) {
  if (props.ignoreColumns.includes(itemIndex)) {
    return;
  }
  const newValue = [...selected.value];

  const existingIndex = newValue.indexOf(itemIndex);

  // 已选中 -> 取消
  if (existingIndex !== -1) {
    newValue.splice(existingIndex, 1);
  }
  // 未选中 -> 加到最后
  else {
    newValue.push(itemIndex);
  }

  selected.value = newValue;
}
</script>

<style scoped>
.priority-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.priority-item {
  cursor: pointer;
  user-select: none;
  padding: 5px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.priority-item.selected {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.priority-item.not_select {
  cursor: default;
  opacity: 0.4;
}
</style>

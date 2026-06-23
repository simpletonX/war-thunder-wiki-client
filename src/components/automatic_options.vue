<template>
  <public_dialog
    v-if="modelValue"
    :modelValue="modelValue"
    @update:modelValue="close_mask"
  >
    <template #header>
      <div class="title">可选列偏好</div>
    </template>
    <template #main>
      <div class="min-w-[460px]">
        <div class="priority_vehicle_list flex justify-center mt-4">
          <priority_selector
            v-model="_priorityList"
            :count="priorityVehicleList"
            :ignoreColumns="ignoreColumns"
          >
            <template #item="{ items, priority, index }">
              <div class="priority_vehicle_column">
                <div
                  v-for="(subItem, subIndex) in items"
                  :key="subItem.data_unit_id"
                  class="target-item flex items-center relative w-[120px] !pl-[58px] !mx-0"
                >
                  <img :src="subItem.vehicle_icon" class="!w-[44px]" />
                  <div class="flex items-center">
                    <div
                      class="main_role mr-[2px]"
                      v-html="main_role_icons[subItem.main_role]"
                    ></div>
                    <span>{{ subItem.br }}</span>
                  </div>
                  <div v-if="subIndex === 0" class="arrow_to_end">↓</div>
                </div>
                <div class="selected_number text-center">
                  {{
                    ignoreColumns.includes(index)
                      ? "主线"
                      : priority
                        ? priority
                        : "请选择"
                  }}
                </div>
              </div>
            </template>
          </priority_selector>
        </div>
        <div
          class="calc_button flex justify-between mt-[30px] mb-[20px] pt-[18px]"
        >
          <div class="flex items-center">
            <div class="flex justify-center items-start">
              <Checkbox
                id="terms-1"
                :modelValue="hard_mode"
                @update:modelValue="toggle_mode"
              />
              <Label for="terms-1" class="ml-2 pt-[1px]">强制执行列偏好</Label>
            </div>
            <div class="flex justify-center items-start ml-6">
              <Checkbox
                id="terms-2"
                :modelValue="ignore_multiple"
                @update:modelValue="toggle_ignore_multiple"
              />
              <Label for="terms-2" class="ml-2 pt-[1px]">绕开折叠载具</Label>
            </div>
          </div>
          <Button class="cursor-pointer" @click="automatic_calculate"
            >一键计算</Button
          >
        </div>
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import priority_selector from "@/components/priority_selector.vue";
import { main_role_icons } from "@/utils/icon_svgs";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  priorityList: { type: Array, default: () => [] },
  priorityVehicleList: { type: Array, default: () => [] },
  ignoreColumns: { type: Array, default: () => [] },
  priority_mode: { type: String, default: "hard" },
  ignore_multiple: { type: Boolean, default: true },
});

const emit = defineEmits([
  "update:modelValue",
  "update:priorityList",
  "automatic-calculate",
  "toggle-priority-mode",
  "update:ignore_multiple",
]);

const _priorityList = computed({
  get: () => props.priorityList,
  set: (value) => emit("update:priorityList", value),
});

const hard_mode = ref(props.priority_mode == "hard" ? true : false);

function toggle_mode() {
  if (hard_mode.value) {
    emit("toggle-priority-mode", "soft");
    hard_mode.value = false;
  } else {
    emit("toggle-priority-mode", "hard");
    hard_mode.value = true;
  }
}
function toggle_ignore_multiple(val) {
  emit("update:ignore_multiple", val);
}

function close_mask() {
  emit("update:modelValue", false);
}

function automatic_calculate() {
  emit("automatic-calculate");
}
</script>

<style scoped>
:deep(.main_role svg) {
  height: 14px !important;
}

.target-item {
  margin: 0 5px 20px;
  padding-right: 5px;
  padding-left: 62px;
  border-radius: 90px;
  background-color: rgba(255, 255, 255, 0.1);
  line-height: 32px;
}

.target-item img {
  position: absolute;
  bottom: 5px;
  left: 10px;
  width: 50px;
}

.target-item .arrow_to_end {
  position: absolute;
  top: 80%;
  color: #c1eaab;
  font-size: 20px;
}

.calc_button {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>

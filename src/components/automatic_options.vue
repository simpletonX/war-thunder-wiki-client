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
      <div class="min-w-[460px] max-w-[720px]">
        <div class="text text-[14px] leading-[28px]">
          ⚠️
          算法目前虽然绝大多数时候的计算结果都是正确的，但并非100%的完全替代方案，潜在问题需要用户在使用过程中审查并及时向开发者反馈，您的每一次反馈都将使算法变得更加可靠、稳定！
        </div>
        <div class="priority_vehicle_list flex justify-center mt-10">
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
                id="terms-2"
                :modelValue="ignore_multiple"
                @update:modelValue="toggle_ignore_multiple"
              />
              <Label for="terms-2" class="ml-2 pt-[1px]">绕开折叠载具</Label>
            </div>
          </div>
          <Button class="cir-btn" @click="automatic_calculate">
            <PhGitBranch :size="20" />
            <span class="mr-1">开始规划路线</span>
          </Button>
        </div>
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
import { computed } from "vue";
import priority_selector from "@/components/priority_selector.vue";
import { main_role_icons } from "@/utils/icon_svgs";
import { PhGitBranch } from "@phosphor-icons/vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  priorityList: { type: Array, default: () => [] },
  priorityVehicleList: { type: Array, default: () => [] },
  ignoreColumns: { type: Array, default: () => [] },
  ignore_multiple: { type: Boolean, default: true },
});

const emit = defineEmits([
  "update:modelValue",
  "update:priorityList",
  "automatic-calculate",
  "update:ignore_multiple",
]);

const _priorityList = computed({
  get: () => props.priorityList,
  set: (value) => emit("update:priorityList", value),
});

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

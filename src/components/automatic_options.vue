<template>
  <public_dialog
    v-if="modelValue"
    :modelValue="modelValue"
    @update:modelValue="close_mask"
  >
    <template #header>
      <div class="title">路线规划选项</div>
    </template>
    <template #main>
      <div class="min-w-[460px] max-w-[720px]">
        <div class="text text-[14px] leading-[28px]">
          ⚠️
          算法目前虽然绝大多数时候的计算结果都是正确的，但并非100%的完全替代方案，潜在问题需要用户在使用过程中审查并及时向开发者反馈，您的每一次反馈都将使算法变得更加可靠、稳定！
        </div>
        <div class="text text-[14px] leading-[28px] mt-4">
          如需指定路线方向，请在科技树中右键银币载具并标记为途径点，规划结果将强制经过这些载具。
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
import { PhGitBranch } from "@phosphor-icons/vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ignore_multiple: { type: Boolean, default: true },
});

const emit = defineEmits([
  "update:modelValue",
  "automatic-calculate",
  "update:ignore_multiple",
]);

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
.calc_button {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>

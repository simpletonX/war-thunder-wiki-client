<!-- 未选择任何目标载具提示 -->
<template>
  <public_dialog
    v-if="modelValue"
    :modelValue="modelValue"
    @update:modelValue="close_mask"
  >
    <template #header>
      <div class="title">未选择目标载具！</div>
    </template>
    <template #main>
      <div class="w-[500px]">
        <p class="mb-2">尚未选择任何目标载具，请按照以下指示操作。</p>
        <img :src="`/static/click-target.gif`" class="rounded-[15px]" />
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:modelValue",
]);

function close_mask() {
  emit("update:modelValue", false);
}
</script>

<style scoped>

</style>

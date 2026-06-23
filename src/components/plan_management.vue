<template>
  <!-- 方案管理面板 -->
  <public_dialog
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue')"
  >
    <template #header>
      <div class="title">方案管理</div>
    </template>
    <template #main>
      <div class="flex justify-center items-center text-[14px] mb-4 mt-2">
        敬请期待～
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);
</script>

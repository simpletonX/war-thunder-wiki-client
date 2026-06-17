<template>
  <public_dialog v-if="modelValue" :modelValue="modelValue" @update:modelValue="close_mask">
    <template #header>
      <div class="title">载具详情：{{ item.title }}</div>
    </template>
    <template #main>
      <iframe :src="detail_url" frameborder="0" class="w-[900px] h-[600px]"></iframe>
    </template>
  </public_dialog>
</template>

<script setup>
import public_dialog from "@/components/public_dialog.vue";
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  modelValue: Boolean,
  item: Object,
});
const emits = defineEmits(["update:modelValue"]);

const detail_url = computed(
  () => `https://wiki.warthunder.com/unit/${props.item.data_unit_id}`,
);

function close_mask(val) {
  emits("update:modelValue", val);
}
</script>

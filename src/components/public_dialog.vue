<template>
  <public_mask_copy @click="close_mask" v-show="modelValue">
    <div class="public_dialog_container" @click.stop>
      <div class="public_dialog_header">
        <slot name="header"></slot>
      </div>
      <div class="public_dialog_main">
        <slot name="main"></slot>
      </div>
    </div>
  </public_mask_copy>
</template>

<script setup>
import { defineProps, defineEmits, ref } from "vue";
import public_mask_copy from "@/components/public_mask_copy.vue";

const props = defineProps(["modelValue"]);
const emits = defineEmits(["update:modelValue"]);

function close_mask() {
  emits("update:modelValue", false);
}
</script>

<style scoped>
.public_dialog_container {
  background-color: rgb(26, 38, 41);
  border: 1px solid #2f3942;
  box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.2);
  min-width: 360px;
}
.public_dialog_header {
  padding: 0 15px 0;
  line-height: 50px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.public_dialog_main {
  padding: 18px 15px 12px;
}
</style>

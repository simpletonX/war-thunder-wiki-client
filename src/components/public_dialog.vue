<template>
  <div
    v-if="modelValue"
    class="mask- fixed inset-0 flex items-center justify-center z-[9998]"
    :style="{
      backgroundColor: `rgba(0,0,0,0.7)`,
    }"
    @click="close_mask"
  >
    <div class="public_dialog_container" @click.stop>
      <div class="public_dialog_header">
        <slot name="header"></slot>
      </div>
      <div class="public_dialog_main">
        <slot name="main"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(["modelValue"]);
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
  border-radius: 10px;
}
.public_dialog_header {
  padding: 2px 22px 0;
  line-height: 54px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #fff;
}
.public_dialog_main {
  padding: 20px 22px 12px;
  max-height: calc(96vh - 80px);
  overflow: auto;
}
.public_dialog_main::-webkit-scrollbar {
  width: 0;
}
.mask- {
  opacity: 1;
  animation: opacity 0.2s;
}
@keyframes opacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>

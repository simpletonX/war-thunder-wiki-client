<template>
  <div
    class="public-loading fixed top-0 left-0 w-full h-full select-none"
    :class="{
      show: modelValue,
    }"
    v-show="modelValue"
  >
    <img
      class="loading-icon-bg lc-origin w-[140px]"
      :src="`/static/logoWT_stripe_flat_bg_mini.png`"
    />
    <img
      class="loading-icon-text lc-origin absolute w-[260px]"
      :src="`/static/logoWT_stripe_flat_text_mini.png`"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: Boolean,
  item: Object,
});
const emits = defineEmits(["update:modelValue"]);
</script>

<style scoped>
.public-loading {
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  backdrop-filter: blur(0);
}
.public-loading.show {
  backdrop-filter: blur(20px);
}
.loading-icon-bg {
  position: absolute;
  left: calc(50% - 70px);
  top: calc(50% - 223.5px);
  animation: topJoin 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 100ms;
  animation-fill-mode: forwards;
  opacity: 0;
}
.loading-icon-text {
  position: absolute;
  left: calc(50% - 132px);
  top: calc(50% - 130px);
  animation: bottomJoin 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 100ms;
  animation-fill-mode: forwards;
  opacity: 0;
}
@keyframes topJoin {
  0% {
    transform: translateY(-220px);
    opacity: 0;
  }
  70% {
    transform: translateY(12px);
  }
  85% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bottomJoin {
  0% {
    transform: translateY(220px);
    opacity: 0;
  }
  70% {
    transform: translateY(-12px);
  }
  85% {
    transform: translateY(6px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

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
    <div class="honeycomb">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="text flex justify-center w-full absolute bottom-[21px] text-center text-[14px]">算法并非100%的完全替代方案，潜在问题需要用户在使用过程中发现并向开发者反馈。</div>
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

<style scoped>
@-webkit-keyframes honeycomb {
  0%,
  20%,
  80%,
  100% {
    opacity: 0;
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  30%,
  70% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes honeycomb {
  0%,
  20%,
  80%,
  100% {
    opacity: 0;
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  30%,
  70% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

.honeycomb {
  height: 24px;
  position: absolute;
  width: 24px;
  top: 70%;
  left: calc(50% - 12px);
}

.honeycomb div {
  -webkit-animation: honeycomb 2.1s infinite backwards;
  animation: honeycomb 2.1s infinite backwards;
  background: #f3f3f3;
  height: 12px;
  margin-top: 6px;
  position: absolute;
  width: 24px;
}

.honeycomb div:after, .honeycomb div:before {
  content: '';
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  position: absolute;
  left: 0;
  right: 0;
}

.honeycomb div:after {
  top: -6px;
  border-bottom: 6px solid #f3f3f3;
}

.honeycomb div:before {
  bottom: -6px;
  border-top: 6px solid #f3f3f3;
}

.honeycomb div:nth-child(1) {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
  left: -28px;
  top: 0;
}

.honeycomb div:nth-child(2) {
  -webkit-animation-delay: 0.1s;
  animation-delay: 0.1s;
  left: -14px;
  top: 22px;
}

.honeycomb div:nth-child(3) {
  -webkit-animation-delay: 0.2s;
  animation-delay: 0.2s;
  left: 14px;
  top: 22px;
}

.honeycomb div:nth-child(4) {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
  left: 28px;
  top: 0;
}

.honeycomb div:nth-child(5) {
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
  left: 14px;
  top: -22px;
}

.honeycomb div:nth-child(6) {
  -webkit-animation-delay: 0.5s;
  animation-delay: 0.5s;
  left: -14px;
  top: -22px;
}

.honeycomb div:nth-child(7) {
  -webkit-animation-delay: 0.6s;
  animation-delay: 0.6s;
  left: 0;
  top: 0;
}
</style>
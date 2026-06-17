<template>
  <div
    class="public-loading fixed top-0 left-0 w-full h-full flex justify-center items-center"
    :class="{
      show: modelValue,
    }"
    v-show="modelValue"
  >
    <div class="loading-animate relative w-[255px] h-[425px]">
      <template v-if="showSplit">
        <img
          class="loading-icon lc-top"
          :src="`/static/logoWT_stripe_flat.png`"
        />
        <img
          class="loading-icon lc-bottom"
          :src="`/static/logoWT_stripe_flat.png`"
        />
      </template>
      <img
        class="loading-icon lc-origin"
        :src="`/static/logoWT_stripe_flat.png`"
        v-if="showOrigin"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onUnmounted, watch } from "vue";

const props = defineProps({
  modelValue: Boolean,
  item: Object,
});
const emits = defineEmits(["update:modelValue"]);

const showSplit = ref(true);
const showOrigin = ref(false);

let timer = null;

function playAnimation() {
  timer = setTimeout(() => {
    showSplit.value = false;
    showOrigin.value = true;
    clearTimeout(timer);
    timer = null;
  }, 700);
}
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      showSplit.value = true;
      showOrigin.value = false;
      playAnimation();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});
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
.loading-icon {
  position: absolute;
  left: 0;
  top: 0;
}
.lc-top,
.lc-bottom {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}
.lc-top {
  clip-path: polygon(0 0, 100% 0, 0 100%);
  animation: topJoin 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.lc-bottom {
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  animation: bottomJoin 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes topJoin {
  0% {
    transform: translateY(-220px);
  }
  70% {
    transform: translateY(20px);
  }
  85% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes bottomJoin {
  0% {
    transform: translateY(220px);
  }
  70% {
    transform: translateY(-20px);
  }
  85% {
    transform: translateY(6px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>

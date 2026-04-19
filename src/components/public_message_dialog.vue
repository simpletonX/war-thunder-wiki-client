<template>
  <transition name="fade">
    <div
      v-if="store.visible"
      class="fixed top-5 left-1/2 transform -translate-x-1/2 z-1000 px-5 py-3 bg-[#293340] text-white rounded-lg shadow-lg text-center min-w-[200px] text-[14px]"
    >
      {{ store.text }}
    </div>
  </transition>
</template>

<script setup>
import { watch, ref } from "vue";
import { usePublicMessageDialogStore } from "@/stores/public_message_dialog";

const store = usePublicMessageDialogStore();

// 用于防止重复定时器
const timeoutRef = ref(null);

watch(
  () => store.visible,
  (val) => {
    if (val) {
      // 清除之前的定时器
      if (timeoutRef.value) clearTimeout(timeoutRef.value);

      // 自动隐藏
      timeoutRef.value = setTimeout(() => {
        store.hide();
        timeoutRef.value = null;
      }, store.duration);
    } else {
      if (timeoutRef.value) {
        clearTimeout(timeoutRef.value);
        timeoutRef.value = null;
      }
    }
  }
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

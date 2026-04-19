<template>
  <transition name="fade">
    <div
      v-if="public_mask.visible"
      class="mask- fixed inset-0 flex items-center justify-center z-[999]"
      :style="{
        backgroundColor: `rgba(0,0,0,${public_mask.opacity})`,
      }"
      @click="public_mask.hide"
    >
      <div class="loading-func flex items-center" v-if="public_mask.loadingFunc">
        <div class="public-loader"></div>
        <div class="text text-[15px] text-[#7fb2c0] ml-2">
          Waiting for server response..
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { usePublicMaskStore } from "@/stores/public_mask";
const public_mask = usePublicMaskStore();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

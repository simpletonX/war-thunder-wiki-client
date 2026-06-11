<template>
  <transition name="fade">
    <div
      v-if="public_mask.visible"
      class="mask- fixed inset-0 flex content-center justify-center flex-wrap z-[999]"
      :style="{
        '--opacity': public_mask.opacity,
      }"
      @click="public_mask.hide"
    >
      <div
        class="loading-func flex items-center mt-[200px] ml-[45px]"
        v-if="public_mask.loadingFunc"
      >
        <div class="public-loader"></div>
        <div class="text text-[15px] text-[#7fb2c0] ml-2">
          等待服务器数据响应中..
        </div>
      </div>
      <!-- <div class="desc w-[calc(100% - 70px)] ml-[70px] text-center px-[30%] mt-6 text-[13px] opacity-60">
        Покорите небо, захватите землю, добро пожаловать в программу
        исследований и разработок дерева технологий War Thunder WIKI, я — Слепой
        Гром.
      </div> -->
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
.mask- {
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(25, 33, 36, 1) 70%,
    rgba(25, 33, 36, 1) 90%
  );
  backdrop-filter: blur(100px);
}
</style>

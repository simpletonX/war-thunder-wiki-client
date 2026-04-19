<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="mask- fixed inset-0 flex items-center justify-center z-[999]"
      :style="{
        backgroundColor: `rgba(0,0,0,0.7)`,
      }"
      @click="hide"
    >
      <slot></slot>
    </div>
  </transition>
</template>

<script setup>
import { ref } from "vue";
const visible = ref(true);

function hide() {
  
}
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

/** 全局遮罩层状态 */
import { ref } from "vue";
import { defineStore } from "pinia";

export const usePublicMaskStore = defineStore("mask", () => {
  const visible = ref(false);
  const loadingFunc = ref(false); // 是否启用加载动画功能
  const opacity = ref(0.5); // 遮罩层不透明度

  function show() {
    visible.value = true;
  }

  function hide() {
    visible.value = false;
    loadingFunc.value = false;
    opacity.value = 0.5;
  }

  function toggle() {
    visible.value ? hide() : show();
  }

  function openLoading() {
    loadingFunc.value = true;
  }

  function setOpacity(opacity_) {
    opacity.value = opacity_;
  }

  return {
    visible,
    loadingFunc,
    opacity,
    show,
    hide,
    toggle,
    openLoading,
    setOpacity,
  };
});

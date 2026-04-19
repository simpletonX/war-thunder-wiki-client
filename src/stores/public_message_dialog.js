/** 全局message_dialog状态 */
import { ref } from "vue";
import { defineStore } from "pinia";

export const usePublicMessageDialogStore = defineStore("message_dialog", () => {
  const visible = ref(false);
  const duration = ref(0); // message显示时长（ms）
  const text = ref(""); // 显示内容

  function show(_text, _duration) {
    text.value = _text;
    visible.value = true;
    duration.value = _duration;
  }

  function hide() {
    visible.value = false;
  }

  function toggle(text, _duration) {
    visible.value ? hide() : show(text, _duration);
  }

  return {
    visible,
    duration,
    text,
    show,
    hide,
    toggle,
  };
});

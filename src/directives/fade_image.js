// 自定义指令：使图片加载完成后执行渐显动画

export default {
  mounted(el) {
    const animation_name = "bounce-bottom";
    const play = () => {
      el.classList.remove(animation_name);
      void el.offsetWidth;
      el.classList.add(animation_name);
    };

    if (el.complete) {
      play();
      return;
    }

    el.addEventListener("load", play);
    el._img_animation_cleanup = () => {
      el.removeEventListener("load", play);
    };
  },

  unmounted(el) {
    el._img_animation_cleanup?.();
  },
};

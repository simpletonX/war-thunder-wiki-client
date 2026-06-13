import { ref } from "vue";
import { defineStore } from "pinia";

export const useTreeDataStore = defineStore("tree_data", () => {
  const tree_data = ref([]);
  const bg_hidden = ref(
    Boolean(Number(localStorage.getItem("bg_hidden"))) || false,
  ); // （旧，已弃置）
  const bg_img = ref(localStorage.getItem("bg_img") || "default"); // 新

  const blur_number = ref(localStorage.getItem("blur_number") || "60");

  const multiple_mode = ref(
    Boolean(Number(localStorage.getItem("multiple_mode"))) || false,
  );
  const all_select_mode = ref(
    Boolean(Number(localStorage.getItem("all_select_mode"))) || false,
  );

  // 更新状态管理中的tree_data
  function updateTreeData(tree_data_) {
    tree_data.value = tree_data_;
  }

  // 即时缓存
  function instantCaching(tree_data_, t_c, type) {
    localStorage.setItem(`${t_c}_${type}`, JSON.stringify(tree_data_));

    const newTreeData = localStorage.getItem(`${t_c}_${type}`);
    updateTreeData(JSON.parse(newTreeData));
  }

  // 切换显示背景/隐藏背景（旧，已弃置）
  function toggleBgHidden(val) {
    localStorage.setItem("bg_hidden", Number(val));
    bg_hidden.value = val;
  }

  // 切换背景图像/视频（新）
  function toggleBgImg(val) {
    localStorage.setItem("bg_img", val);
    bg_img.value = val;
  }

  // 设置当前背景模糊度
  function toggleBlurNumber(val) {
    localStorage.setItem("blur_number", val);
    blur_number.value = val;
  }

  // 切换multiple载具交互模式
  function toggleMultipleMode(val) {
    localStorage.setItem("multiple_mode", Number(val));
    multiple_mode.value = val;
  }

  // 切换全选仅选中第一个折叠载具模式
  function toggleAllSelectMode(val) {
    localStorage.setItem("all_select_mode", Number(val));
    all_select_mode.value = val;
  }

  return {
    tree_data,
    updateTreeData,
    instantCaching,
    multiple_mode,
    toggleMultipleMode,
    all_select_mode,
    toggleAllSelectMode,
    bg_hidden, // （旧，已弃置）
    toggleBgHidden, // （旧，已弃置）
    bg_img, // 新
    toggleBgImg, // 新
    blur_number,
    toggleBlurNumber
  };
});

import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useTreeDataStore = defineStore("tree_data", () => {
  const tree_data = ref([]);
  const bg_hidden = ref(
    Boolean(Number(localStorage.getItem("bg_hidden"))) || false,
  );
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

  // 切换显示背景/隐藏背景
  function toggleBgHidden(val) {
    localStorage.setItem("bg_hidden", Number(val));
    bg_hidden.value = val;
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
    bg_hidden,
    multiple_mode,
    all_select_mode,
    toggleBgHidden,
    toggleMultipleMode,
    toggleAllSelectMode
  };
});

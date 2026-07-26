import { shallowRef } from "vue";

export function createTreeContentState(types) {
  // 科技树本体始终由请求结果提供，不写入本地存储。
  const tree_data = shallowRef({});
  const tree_data_key = shallowRef("");

  function getCurrentTreeKey() {
    return `${types.value.country_code}_${types.value.vehicle_type}`;
  }

  function isCurrentTreeDataReady() {
    return (
      tree_data_key.value === getCurrentTreeKey() &&
      Array.isArray(tree_data.value) &&
      tree_data.value.length > 0
    );
  }

  function updateTreeData(value, treeKey = getCurrentTreeKey()) {
    tree_data.value = value;
    tree_data_key.value = treeKey;
  }

  return {
    tree_data,
    tree_data_key,
    getCurrentTreeKey,
    isCurrentTreeDataReady,
    updateTreeData,
  };
}

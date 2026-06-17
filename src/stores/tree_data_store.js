import { ref, watch, shallowRef, computed } from "vue";
import { defineStore } from "pinia";
import { getStorage, setStorage } from "@/utils/storage";
import { country_code as cc, vehicle_type as vt } from "@/utils/dict";
import { calculateRankStats } from "@/utils/treeDataUtils";

export const useTreeDataStore = defineStore("tree_data", () => {
  // 载具类型/国家类型
  const types = ref(
    getStorage("types", {
      vehicle_type: vt[0],
      country_code: cc[0],
    }),
  );

  // 更新types
  function updateTypes(key, value) {
    types.value[key] = value;
    setStorage("types", types.value);
  }

  // 偏好设置
  const default_settings = {
    // 背景图像/视频
    bg_img: "s_leopard2_a4m",
    // 背景模糊度
    blur_number: "30",
    // 启用左键折叠载具组时默认选中第一个折叠载具
    multiple_mode: false,
    // 启用全选仅选中第一个折叠载具
    all_select_mode: false,
    // 启用真实科技树模拟
    true_tree_mode: false,
  };
  const settings_raw = getStorage("settings", {});
  const settings = ref({
    ...default_settings,
    ...settings_raw,
  });

  // 更新settings
  function updateSettings(key, value) {
    settings.value[key] = value;
    setStorage("settings", settings.value);
  }

  // tree_data无需写入本地存储，直接从cdn或本地json文件请求
  const tree_data = shallowRef({});

  // 更新tree_data
  function updateTreeData(value) {
    tree_data.value = value;
  }

  // tree_data的item选中状态镜像/HashMap映射
  const selected_state_map = ref(
    getStorage(
      `${types.value.country_code}_${types.value.vehicle_type}_ssmap`,
      {},
    ),
  );

  // 当国家或载具类型切换时，自动加载对应的 ssmap
  watch(
    () => [types.value.country_code, types.value.vehicle_type],
    () => {
      selected_state_map.value = getStorage(
        `${types.value.country_code}_${types.value.vehicle_type}_ssmap`,
        {},
      );
    },
    {
      immediate: true,
    },
  );

  // 更新单个item选中状态
  function updateSelectedStateMap(data_unit_id) {
    if (selected_state_map.value[data_unit_id]) {
      delete selected_state_map.value[data_unit_id];
    } else {
      selected_state_map.value[data_unit_id] = true;
    }
    updateSelectedStateMapAllLocal();
  }

  // 更新整个selected_state_map的本地存储
  function updateSelectedStateMapAllLocal(
    value = selected_state_map.value,
    updateState = false,
  ) {
    setStorage(
      `${types.value.country_code}_${types.value.vehicle_type}_ssmap`,
      value,
    );
    if (updateState) {
      selected_state_map.value = value;
    }
  }

  // RP/SP元数据映射
  const vehicle_cost_map = ref({});

  function updateVehicleCostMap(value) {
    vehicle_cost_map.value = value;
  }

  // 每个rank的对应RP/SP实时总计
  const rankStats = computed(() =>
    calculateRankStats(selected_state_map.value, vehicle_cost_map.value),
  );

  // 当前所有选中项的RP/SP实时总计
  const total_stats = computed(() => {
    const result = {
      rp: 0,
      sp: 0,
      count: 0, // 选中项数量
    };

    const selected = selected_state_map.value;
    const map = vehicle_cost_map.value;

    for (const id in selected) {
      if (!selected[id]) continue;

      const vehicle = map[id];
      if (!vehicle) continue;

      result.rp += vehicle.rp;
      result.sp += vehicle.sp;
      result.count++;
    }

    return result;
  });

  let researchable_set = shallowRef(new Set());

  function updateResearchableSet(value) {
    researchable_set.value = value;
  }

  // 全局加载动画组件状态
  const loading_visible = ref(false);
  let show_time = 0;
  let hide_timer = null;

  const MIN_DURATION = 1000;

  const loading = {
    show() {
      clearTimeout(hide_timer);

      loading_visible.value = true;
      show_time = Date.now();
    },

    hide(callback) {
      const elapsed = Date.now() - show_time;

      if (elapsed >= MIN_DURATION) {
        loading_visible.value = false;
        callback && callback();
        return;
      }

      hide_timer = setTimeout(() => {
        loading_visible.value = false;
        callback && callback();
      }, MIN_DURATION - elapsed);
    },
  };

  return {
    tree_data,
    updateTreeData,
    settings,
    updateSettings,
    types,
    updateTypes,
    selected_state_map,
    updateSelectedStateMap,
    updateSelectedStateMapAllLocal,
    vehicle_cost_map,
    updateVehicleCostMap,
    rankStats,
    total_stats,
    researchable_set,
    updateResearchableSet,
    loading_visible,
    loading,
  };
});

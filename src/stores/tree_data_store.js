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
    bg_img: "victory_day_2026",
    // 背景模糊度
    blur_number: "0",
    // 启用左键折叠载具组时默认选中第一个折叠载具
    multiple_mode: false,
    // 启用全选仅选中第一个折叠载具
    all_select_mode: false,
    // 启用真实科技树模拟
    true_tree_mode: true,
    // 数学格式
    math_format: "thousands_separator",
    // 是否开启开发调试面板
    developer_mode: false,
    // 是否启用全局加载动画
    loading_animation: true,
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

  // 已拥有载具仍保持选中，但不计入待研发 RP/SP。
  const owned_vehicle_ids = shallowRef(new Set());

  function updateOwnedVehicleIds(ids = []) {
    owned_vehicle_ids.value = new Set(ids);
  }

  // 每个 Rank 始终显示完整 RP/SP；已拥有载具只影响底部待研发总计。
  const rankStats = computed(() =>
    calculateRankStats(selected_state_map.value, vehicle_cost_map.value),
  );

  function calculateTotalStats(excludeOwned = false) {
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

      // 高级载具只参与选中数量，不计入完整或待研发 RP/SP。
      if (
        !vehicle.isPremium &&
        (!excludeOwned || !owned_vehicle_ids.value.has(id))
      ) {
        result.rp += vehicle.rp;
        result.sp += vehicle.sp;
      }
      result.count++;
    }

    return result;
  }

  // 完整总计包含所有选中可研发载具的成本，高级载具成本始终为零。
  const total_stats_complete = computed(() => calculateTotalStats(false));
  // 待研发总计，排除已拥有载具
  const total_stats_pending = computed(() => calculateTotalStats(true));
  // 保留原字段兼容现有调用，默认仍表示待研发总计。
  const total_stats = total_stats_pending;

  let researchable_set = shallowRef(new Set());

  function updateResearchableSet(value) {
    researchable_set.value = value;
  }

  // 全局加载动画组件状态
  const loading_visible = ref(false);
  let show_time = 0;
  let hide_timer = null;

  const MIN_DURATION = 1100;

  const loading = {
    show() {
      clearTimeout(hide_timer);

      loading_visible.value = true;
      show_time = Date.now();
    },

    hide: async (callback) => {
      const elapsed = Date.now() - show_time;

      if (elapsed >= MIN_DURATION) {
        if (callback) {
          await callback(() => {
            loading_visible.value = false;
          });
        } else {
          loading_visible.value = false;
          console.log("hide");
        }
        return;
      }

      hide_timer = setTimeout(async () => {
        if (callback) {
          await callback(() => {
            loading_visible.value = false;
          });
        } else {
          loading_visible.value = false;
          console.log("hide");
        }
      }, MIN_DURATION - elapsed);
    },
  };

  // 是否已读《用户协议》
  const agreement_accepted = ref(
    getStorage("agreement_accepted", {
      read: false,
    }),
  );

  function updateAgreementAccepted(read) {
    agreement_accepted.value = { read };
    setStorage("agreement_accepted", {
      read,
    });
  }

  // 判断当前是否有新的版本更新日志，弹出更新公告面板
  function checkAndShowUpdateNotice() {
    const cache_version = getStorage("cache_version", "");

    if (String(cache_version) != import.meta.env.VITE_APP_VERSION) {
      setStorage("cache_version", import.meta.env.VITE_APP_VERSION);
      return false;
    }
    return true;
  }

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
    owned_vehicle_ids,
    updateOwnedVehicleIds,
    rankStats,
    total_stats,
    total_stats_complete,
    total_stats_pending,
    researchable_set,
    updateResearchableSet,
    loading_visible,
    loading,
    agreement_accepted,
    updateAgreementAccepted,
    checkAndShowUpdateNotice,
  };
});

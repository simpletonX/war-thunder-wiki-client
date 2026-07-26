import { computed, ref, shallowRef } from "vue";
import { calculateRankStats } from "@/utils/treeDataUtils";

export function createTreeStatisticsState({ selected_state_map }) {
  const vehicle_cost_map = ref({});
  const owned_vehicle_ids = shallowRef(new Set());
  const researchable_set = shallowRef(new Set());

  function updateVehicleCostMap(value) {
    vehicle_cost_map.value = value;
  }

  function updateOwnedVehicleIds(ids = []) {
    owned_vehicle_ids.value = new Set(ids);
  }

  function updateResearchableSet(value) {
    researchable_set.value = value;
  }

  // 每个 Rank 始终显示完整 RP/SP；已拥有载具只影响底部待研发总计。
  const rankStats = computed(() =>
    calculateRankStats(selected_state_map.value, vehicle_cost_map.value),
  );

  function calculateTotalStats(excludeOwned = false) {
    const result = { rp: 0, sp: 0, count: 0 };

    for (const id in selected_state_map.value) {
      if (!selected_state_map.value[id]) continue;

      const vehicle = vehicle_cost_map.value[id];
      if (!vehicle) continue;

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

  const total_stats_complete = computed(() => calculateTotalStats(false));
  const total_stats_pending = computed(() => calculateTotalStats(true));

  return {
    vehicle_cost_map,
    updateVehicleCostMap,
    owned_vehicle_ids,
    updateOwnedVehicleIds,
    rankStats,
    total_stats: total_stats_pending,
    total_stats_complete,
    total_stats_pending,
    researchable_set,
    updateResearchableSet,
  };
}

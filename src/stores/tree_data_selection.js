import { ref, watch } from "vue";
import { getStorage, setStorage } from "@/utils/storage";
import { country_code as cc, vehicle_type as vt } from "@/utils/dict";

export function createTreeSelectionState({ types, isCurrentTreeDataReady }) {
  const getStorageKey = () =>
    `${types.value.country_code}_${types.value.vehicle_type}_ssmap`;
  const selected_state_map = ref(getStorage(getStorageKey(), {}));

  watch(
    () => [types.value.country_code, types.value.vehicle_type],
    () => {
      selected_state_map.value = getStorage(getStorageKey(), {});
    },
    { immediate: true },
  );

  function updateSelectedStateMap(data_unit_id) {
    if (!isCurrentTreeDataReady()) return;

    if (selected_state_map.value[data_unit_id]) {
      delete selected_state_map.value[data_unit_id];
    } else {
      selected_state_map.value[data_unit_id] = true;
    }
    updateSelectedStateMapAllLocal();
  }

  function updateSelectedStateMapAllLocal(
    value = selected_state_map.value,
    updateState = false,
  ) {
    if (!isCurrentTreeDataReady()) {
      selected_state_map.value = getStorage(getStorageKey(), {});
      return;
    }

    setStorage(getStorageKey(), value);
    if (updateState) selected_state_map.value = value;
  }

  function clearAllSSMap() {
    const cleared = {};
    const knownKeys = new Set();
    const parseStoredSSMap = (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    };

    for (const countryCode of cc) {
      for (const vehicleType of vt) {
        knownKeys.add(`${countryCode}_${vehicleType}_ssmap`);
      }
    }

    if (typeof localStorage !== "undefined") {
      for (const key of knownKeys) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          cleared[key] = parseStoredSSMap(value);
          localStorage.removeItem(key);
        }
      }

      for (let index = localStorage.length - 1; index >= 0; index--) {
        const key = localStorage.key(index);
        if (!key?.endsWith("_ssmap") || knownKeys.has(key)) continue;

        cleared[key] = parseStoredSSMap(localStorage.getItem(key));
        localStorage.removeItem(key);
      }
    }

    selected_state_map.value = {};
    return cleared;
  }

  return {
    selected_state_map,
    updateSelectedStateMap,
    updateSelectedStateMapAllLocal,
    clearAllSSMap,
  };
}

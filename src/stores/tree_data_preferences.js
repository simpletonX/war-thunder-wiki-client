import { ref } from "vue";
import { getStorage, setStorage } from "@/utils/storage";
import { country_code as cc, vehicle_type as vt } from "@/utils/dict";

const defaultSettings = {
  bg_img: "victory_day_2026",
  blur_number: "0",
  multiple_mode: false,
  all_select_mode: false,
  true_tree_mode: true,
  math_format: "Chinese_number_unit_system",
  developer_mode: false,
  loading_animation: true,
  export_image_quality: "high",
  vehicle_title_type: "chinese_title",
  hidden_vehicle_visible: false,
};

export function createTreePreferencesState({
  onHiddenVehicleVisibilityChange = () => {},
} = {}) {
  const types = ref(
    getStorage("types", {
      vehicle_type: vt[0],
      country_code: cc[0],
    }),
  );

  function updateTypes(key, value) {
    if (key && typeof key === "object") {
      types.value = { ...types.value, ...key };
    } else {
      types.value[key] = value;
    }
    setStorage("types", types.value);
  }

  const settings = ref({
    ...defaultSettings,
    ...getStorage("settings", {}),
  });

  function updateSettings(key, value) {
    settings.value[key] = value;
    setStorage("settings", settings.value);

    if (key === "hidden_vehicle_visible") {
      onHiddenVehicleVisibilityChange();
    }
  }

  return {
    types,
    updateTypes,
    settings,
    updateSettings,
  };
}

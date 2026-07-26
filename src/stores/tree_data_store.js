import { defineStore } from "pinia";
import { createTreePreferencesState } from "@/stores/tree_data_preferences";
import { createTreeContentState } from "@/stores/tree_data_content";
import { createTreeSelectionState } from "@/stores/tree_data_selection";
import { createTreeStatisticsState } from "@/stores/tree_data_statistics";
import { createTreeRuntimeState } from "@/stores/tree_data_runtime";

// 对外保留唯一 Store 入口，内部状态按职责拆分到独立模块。
export const useTreeDataStore = defineStore("tree_data", () => {
  let selectionState;
  const preferencesState = createTreePreferencesState({
    onHiddenVehicleVisibilityChange: () => selectionState?.clearAllSSMap(),
  });
  const contentState = createTreeContentState(preferencesState.types);
  selectionState = createTreeSelectionState({
    types: preferencesState.types,
    isCurrentTreeDataReady: contentState.isCurrentTreeDataReady,
  });
  const statisticsState = createTreeStatisticsState({
    selected_state_map: selectionState.selected_state_map,
  });
  const runtimeState = createTreeRuntimeState();

  return {
    ...preferencesState,
    ...contentState,
    ...selectionState,
    ...statisticsState,
    ...runtimeState,
  };
});

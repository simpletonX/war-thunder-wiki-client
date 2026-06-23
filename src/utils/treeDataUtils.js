import { useTreeDataStore } from "@/stores/tree_data_store";
import { storeToRefs } from "pinia";
import { unlock_quantitys } from "@/utils/dict";
import { terminal_vehicles } from "@/utils/terminal_vehicles";
import { planShortestResearchPath } from "@/utils/researchPathPlanner";

// 右键选中当前列至当前item
export function toggleSelectColumnAbove({
  tree_data,
  clicked_item,
  selected_state_map,
}) {
  if (!Array.isArray(tree_data.value) || !clicked_item) return;

  // =========================
  // ① 自动判断 toggle 状态
  // =========================
  const clickedId =
    clicked_item?.type === "multiple"
      ? clicked_item.items?.[0]?.data_unit_id
      : clicked_item?.data_unit_id;

  if (!clickedId) return;

  const select = !selected_state_map.value[clickedId];

  // =========================
  // ② 定位 clicked_item
  // =========================
  let pos = null;

  for (let r = 0; r < tree_data.value.length && !pos; r++) {
    const cols = tree_data.value[r].researchable_vehicles;
    if (!Array.isArray(cols)) continue;

    for (let c = 0; c < cols.length && !pos; c++) {
      const col = cols[c];

      for (let i = 0; i < col.length; i++) {
        const item = col[i];

        if (
          clicked_item.type === "multiple" &&
          item.data_unit_id === clicked_item.data_unit_id
        ) {
          pos = { r, c, i, sub: null };
          break;
        }

        if (
          clicked_item.type !== "multiple" &&
          item.data_unit_id === clicked_item.data_unit_id
        ) {
          pos = { r, c, i, sub: null };
          break;
        }

        if (Array.isArray(item.items)) {
          const sub = item.items.findIndex(
            (child) => child.data_unit_id === clicked_item.data_unit_id,
          );
          if (sub !== -1) {
            pos = { r, c, i, sub };
            break;
          }
        }
      }
    }
  }

  if (!pos) return;

  const { r: targetRank, c: targetCol, i: targetItem, sub: targetSub } = pos;

  // =========================
  // ③ map 操作工具
  // =========================
  const set = (id, val) => {
    if (val) {
      selected_state_map.value[id] = true;
    } else {
      delete selected_state_map.value[id];
    }
  };

  // =========================
  // ④ 同列向上逻辑（核心）
  // =========================
  for (let r = 0; r <= targetRank; r++) {
    const col = tree_data.value[r].researchable_vehicles?.[targetCol];
    if (!Array.isArray(col)) continue;

    const itemEnd = r < targetRank ? col.length - 1 : targetItem;

    for (let i = 0; i <= itemEnd; i++) {
      const item = col[i];

      // ===== single =====
      if (!item.items || item.type !== "multiple") {
        set(item.data_unit_id, select);
        continue;
      }

      // ===== multiple =====

      // ❗取消：清空整个节点
      if (!select) {
        set(item.data_unit_id, false);
        for (const sub of item.items) {
          set(sub.data_unit_id, false);
        }
        continue;
      }

      // ===== select === true =====

      if (r < targetRank || i < targetItem) {
        const first = item.items?.[0];
        if (first) set(first.data_unit_id, true);
        continue;
      }

      if (i === targetItem) {
        if (targetSub === null) {
          const first = item.items?.[0];
          if (first) set(first.data_unit_id, true);
        } else {
          for (let k = 0; k <= targetSub; k++) {
            const sub = item.items[k];
            if (sub) set(sub.data_unit_id, true);
          }
        }
      }
    }
  }

  // 更新本地存储数据
  const store = useTreeDataStore();
  store.updateSelectedStateMapAllLocal();
}

// 全选/反全选
export function toggleResearchableSelectAll({
  tree_data,
  selected_state_map,
  settings,
  falseEffect,
  trueEffect,
}) {
  const store = useTreeDataStore();
  const isAllSelectMode = settings.value.all_select_mode;

  // =========================
  // ① 判断是否已全选 researchable
  // =========================
  const isAllSelected = (() => {
    const selected = selected_state_map.value;

    let ok = true;

    const walkCheck = (items) => {
      for (const item of items) {
        if (!item) continue;

        if (item.type === "multiple" && Array.isArray(item.items)) {
          if (isAllSelectMode) {
            const hasOne = item.items.some((sub) => selected[sub.data_unit_id]);

            if (!hasOne) {
              ok = false;
              return;
            }
          } else {
            walkCheck(item.items);
          }
          continue;
        }

        if (item.data_unit_id && !selected[item.data_unit_id]) {
          ok = false;
          return;
        }
      }
    };

    for (const rank of tree_data.value || tree_data) {
      for (const col of rank.researchable_vehicles || []) {
        walkCheck(col);
        if (!ok) return false;
      }
    }

    return ok;
  })();

  // =========================
  // ② 如果已全选 → 清空（包括 premium）
  // =========================
  if (isAllSelected) {
    selected_state_map.value = {};
    store.updateSelectedStateMapAllLocal({});
    // 执行反选后的副作用函数
    falseEffect && falseEffect();
    return;
  }

  // =========================
  // ③ 否则 → researchable 全选（保留 premium）
  // =========================
  const map = { ...selected_state_map.value };

  const walk = (items) => {
    for (const item of items) {
      if (!item) continue;

      if (item.type === "multiple" && Array.isArray(item.items)) {
        if (isAllSelectMode) {
          const first = item.items[0];
          if (first?.data_unit_id) {
            map[first.data_unit_id] = true;
          }
        } else {
          walk(item.items);
        }
        continue;
      }

      if (item.data_unit_id) {
        map[item.data_unit_id] = true;
      }
    }
  };

  for (const rank of tree_data.value || tree_data) {
    for (const col of rank.researchable_vehicles || []) {
      walk(col);
    }
  }

  selected_state_map.value = map;
  store.updateSelectedStateMapAllLocal(map, true);
  // 执行全选后的副作用函数
  trueEffect && trueEffect();
}

// 创建researchable索引表
export function createResearchableSet(tree_data) {
  const set = new Set();

  const walk = (items) => {
    for (const item of items) {
      if (!item) continue;

      if (item.type === "multiple" && Array.isArray(item.items)) {
        walk(item.items);
        continue;
      }

      if (item.type === "single") {
        set.add(item.data_unit_id);
      }
    }
  };

  for (const rank of tree_data || []) {
    for (const col of rank.researchable_vehicles || []) {
      walk(col);
    }
  }

  return set;
}

// 数字千位分隔格式化/反格式化
export function parseNumber(value, format = false) {
  if (value == null) return format ? "0" : 0;

  // 转字符串统一处理
  let str = typeof value === "string" ? value : String(value);

  // 去除千分位字符串，解析成数字（默认）
  if (!format) {
    const normalized = str.replace(/,/g, "");

    // 非纯数字直接返回 0（避免脏数据）
    if (!/^\d+$/.test(normalized)) return 0;

    return Number(normalized);
  }

  // 格式化为千分位字符串
  const num = Number(str.replace(/,/g, ""));

  if (!Number.isFinite(num)) return "0";

  return num.toLocaleString("en-US");
}

// 数字中文万亿单位格式化/反格式化
export function formatChineseNumber(value, format = false) {
  if (value == null || value === "") return value;

  // 数值 -> 万单位
  if (format) {
    const num = Number(value);

    if (Number.isNaN(num)) return value;
    if (Math.abs(num) < 10000) {
      return String(num);
    }
    return `${parseFloat((num / 10000).toFixed(2))}万`;
  }

  // 万单位 -> 数值
  const str = String(value).trim();

  if (!str.endsWith("万")) {
    const num = Number(str);
    return Number.isNaN(num) ? value : num;
  }

  const num = parseFloat(str.slice(0, -1));
  return Number.isNaN(num) ? value : Math.round(num * 10000);
}

// 创建tree_data对应箭头计算信息的HashMap
export function createArrowPointsMap(tree_data) {
  const rankCount = tree_data.length;

  // 1) 计算每个 rank 的最长列长度
  const rankMaxColLens = new Array(rankCount).fill(0);

  for (let r = 0; r < rankCount; r++) {
    const rankObj = tree_data[r];

    const allCols = [
      ...(rankObj.researchable_vehicles || []),
      ...(rankObj.premium_vehicles || []),
    ];

    rankMaxColLens[r] =
      allCols.length === 0
        ? 0
        : Math.max(
            ...allCols.map((col) => (Array.isArray(col) ? col.length : 0)),
          );
  }

  // 2) 计算每个 rank 在虚拟纵向坐标中的起始行
  const prefixRows = new Array(rankCount).fill(0);

  for (let r = 1; r < rankCount; r++) {
    prefixRows[r] = prefixRows[r - 1] + rankMaxColLens[r - 1];
  }

  // 3) 计算最大研究列数
  const maxResearchCols = Math.max(
    0,
    ...tree_data.map((rank) => (rank.researchable_vehicles || []).length),
  );

  // 4) 判断是否为有效载具节点
  function isValidResearchItem(item) {
    return item && (item.type === "single" || item.type === "multiple");
  }

  // 5) 结果镜像
  const arrow_points_map = {};

  // 6) 主循环
  for (let colIndex = 0; colIndex < maxResearchCols; colIndex++) {
    for (let rankIndex = 0; rankIndex < rankCount; rankIndex++) {
      const rankObj = tree_data[rankIndex];
      const col = rankObj.researchable_vehicles?.[colIndex];

      if (!Array.isArray(col)) continue;

      for (let rowIndex = 0; rowIndex < col.length; rowIndex++) {
        const item = col[rowIndex];

        if (!isValidResearchItem(item)) continue;

        let found = false;
        let foundRank = -1;
        let foundRow = -1;

        // 查找同列下一个真实载具
        for (let r = rankIndex; r < rankCount && !found; r++) {
          const nextRankCol = tree_data[r].researchable_vehicles?.[colIndex];

          if (!Array.isArray(nextRankCol)) continue;

          const startRow = r === rankIndex ? rowIndex + 1 : 0;

          for (let rr = startRow; rr < nextRankCol.length; rr++) {
            const candidate = nextRankCol[rr];

            if (!isValidResearchItem(candidate)) continue;

            found = true;
            foundRank = r;
            foundRow = rr;
            break;
          }
        }

        const has_next_item = found;

        let placeholder_item = 0;
        let cross_level = 0;

        if (found) {
          cross_level = foundRank - rankIndex;

          const virtualCur = prefixRows[rankIndex] + rowIndex;

          const virtualNext = prefixRows[foundRank] + foundRow;

          placeholder_item = Math.max(0, virtualNext - virtualCur - 1);
        }

        if (item.data_unit_id) {
          arrow_points_map[item.data_unit_id] = {
            placeholder_item,
            cross_level,
            has_next_item,
          };
        }
      }
    }
  }

  return arrow_points_map;
}

// 创建RP/SP元数据映射
export function createVehicleCostMap(tree_data) {
  const map = {};

  const collect = (items, rank, isPremium) => {
    for (const item of items) {
      if (item.type === "multiple") {
        collect(item.items, rank, isPremium);
        continue;
      }

      map[item.data_unit_id] = {
        rank,
        rp: parseNumber(item.rp),
        sp: parseNumber(item.sp),
        isPremium,
      };
    }
  };

  for (const rankData of tree_data) {
    const rank = rankData.rank;

    for (const col of rankData.researchable_vehicles || []) {
      collect(col, rank, false);
    }

    for (const col of rankData.premium_vehicles || []) {
      collect(col, rank, true);
    }
  }

  return map;
}

// 计算RP/SP元数据映射结果
export function calculateRankStats(
  selected_state_map,
  vehicle_cost_map,
  owned_vehicle_ids = new Set(),
) {
  const stats = {};

  // Rank 不应硬编码。由当前科技树的载具元数据动态创建统计项，
  // 以支持空军 Rank IX 以及后续可能新增的更高 Rank。
  for (const vehicle of Object.values(vehicle_cost_map || {})) {
    if (!vehicle?.rank || stats[vehicle.rank]) continue;
    stats[vehicle.rank] = { rp: 0, sp: 0, count: 0 };
  }

  for (const data_unit_id in selected_state_map || {}) {
    if (!selected_state_map[data_unit_id]) continue;

    const vehicle = vehicle_cost_map[data_unit_id];
    if (!vehicle) continue;

    const rank = vehicle.rank;
    if (!stats[rank]) continue;

    // 高级载具参与 Rank 数量，但永远不计入 RP/SP。
    if (!vehicle.isPremium && !owned_vehicle_ids.has(data_unit_id)) {
      stats[rank].rp += vehicle.rp;
      stats[rank].sp += vehicle.sp;
    }
    stats[rank].count += 1;
  }

  return stats;
}

// 提取tree_data中银币载具区域每条线的顶端/末端载具
export function getColumnBoundaryVehicles(tree_data) {
  if (!tree_data?.length) return [];

  const rowCount = tree_data.length;

  // 找最大列数（跨所有 rank）
  let maxColumnCount = 0;
  for (const rank of tree_data) {
    maxColumnCount = Math.max(
      maxColumnCount,
      rank.researchable_vehicles?.length || 0,
    );
  }

  const result = [];

  for (let columnIndex = 0; columnIndex < maxColumnCount; columnIndex++) {
    const group = [];

    // ========== 1. 找最小等级（从上往下第一个） ==========
    let firstFound = null;

    for (let r = 0; r < rowCount; r++) {
      const column = tree_data[r]?.researchable_vehicles?.[columnIndex];
      if (!column?.length) continue;

      const item = column[0];

      firstFound =
        item.type === "single"
          ? item
          : item.type === "multiple"
            ? item.items?.[0]
            : null;

      if (firstFound) break;
    }

    if (firstFound) group.push(firstFound);

    // ========== 2. 找最大等级（从下往上最后一个） ==========
    let lastFound = null;

    for (let r = rowCount - 1; r >= 0; r--) {
      const column = tree_data[r]?.researchable_vehicles?.[columnIndex];
      if (!column?.length) continue;

      const item = column[column.length - 1];

      if (item.type === "single") {
        lastFound = item;
      } else if (item.type === "multiple") {
        const lastSubItem = item.items?.[item.items.length - 1];

        // 部分折叠组的末项没有有效 BR，不能作为列末端展示载具。
        // 此时回退到该折叠组的第一个载具。
        lastFound =
          lastSubItem?.br == null ? item.items?.[0] : lastSubItem;
      }

      if (lastFound) break;
    }

    if (lastFound) group.push(lastFound);

    if (group.length) {
      result.push(group);
    }
  }

  return result;
}

/** researchPathPlanner/Path Worker相关 */
let researchPathWorker = null;
let researchPathWorkerRequestId = 0;
const researchPathWorkerCallbacks = new Map();

function normalizeVehicleId(value) {
  return typeof value === "string" ? value : value?.data_unit_id;
}
function collectSelectedByRank(treeData, selectedMap) {
  const byRank = {};

  const push = (rankBlock, item, isPremium = false) => {
    if (!item?.data_unit_id || !selectedMap[item.data_unit_id]) return;

    if (!byRank[rankBlock.rank]) byRank[rankBlock.rank] = [];
    byRank[rankBlock.rank].push({
      data_unit_id: item.data_unit_id,
      title: item.title,
      rp: parseNumber(item.rp),
      sp: parseNumber(item.sp),
      isPremium,
    });
  };

  for (const rankBlock of treeData || []) {
    for (const column of rankBlock.researchable_vehicles || []) {
      for (const item of column || []) {
        if (item?.type === "multiple" && Array.isArray(item.items)) {
          for (const child of item.items) push(rankBlock, child);
          continue;
        }

        push(rankBlock, item);
      }
    }

    for (const column of rankBlock.premium_vehicles || []) {
      for (const item of column || []) {
        if (item?.type === "multiple" && Array.isArray(item.items)) {
          for (const child of item.items) push(rankBlock, child, true);
          continue;
        }

        push(rankBlock, item, true);
      }
    }
  }

  return byRank;
}
function createResearchPathWorker() {
  if (researchPathWorker) return researchPathWorker;
  if (typeof Worker === "undefined") return null;

  researchPathWorker = new Worker(
    new URL("./researchPathWorker.js", import.meta.url),
    { type: "module" },
  );

  researchPathWorker.onmessage = (event) => {
    const { requestId, ok, result, error } = event.data || {};
    const callback = researchPathWorkerCallbacks.get(requestId);
    if (!callback) return;

    researchPathWorkerCallbacks.delete(requestId);

    if (ok) {
      callback.resolve(result);
    } else {
      callback.reject(new Error(error || "Research path worker failed."));
    }
  };

  researchPathWorker.onerror = (event) => {
    const error = new Error(event.message || "Research path worker error.");

    for (const callback of researchPathWorkerCallbacks.values()) {
      callback.reject(error);
    }

    researchPathWorkerCallbacks.clear();
    researchPathWorker.terminate();
    researchPathWorker = null;
  };

  return researchPathWorker;
}
function normalizePlanResult({
  plan,
  treeData,
  targetIds,
  ownedResearchIds = [],
  selectedStateMapRef,
}) {
  const nextSelectedMap = {};
  const ownedIdSet = new Set(ownedResearchIds);

  for (const id of plan.selectedIds || []) {
    if (ownedIdSet.has(id)) continue;
    nextSelectedMap[id] = true;
  }

  for (const id of plan.premiumIds || []) {
    nextSelectedMap[id] = true;
  }

  // 已拥有载具的选中状态必须保留，只在成本统计中忽略。
  for (const id of ownedIdSet) {
    nextSelectedMap[id] = true;
  }

  selectedStateMapRef.value = nextSelectedMap;

  return {
    ok: plan.ok,
    selected_state_map: nextSelectedMap,
    research_ids: plan.selectedIds || [],
    premium_ids: plan.premiumIds || [],
    target_ids: targetIds,
    total_rp: plan.totalRp || 0,
    total_sp: plan.totalSp || 0,
    rank_counts: plan.rankCounts || [],
    by_rank: collectSelectedByRank(treeData, nextSelectedMap),
    warnings: plan.warnings || [],
    mode: plan.mode,
    priority_score: plan.priorityScore || 0,
    search_complete: plan.searchComplete !== false,
  };
}
export function findShortestPathToVehicle({
  targets = [],
  planned_prems = [],
  owned_researchables = [],
  priority_column = [],
  priority_mode = "soft",
  ignore_multiple = false,
} = {}) {
  const treeDataStore = useTreeDataStore();
  const { tree_data, selected_state_map, types } = storeToRefs(treeDataStore);

  const treeData = Array.isArray(tree_data.value) ? tree_data.value : [];
  const targetIds =
    targets.length > 0
      ? targets.map(normalizeVehicleId).filter(Boolean)
      : Object.keys(selected_state_map.value || {}).filter(
          (id) => selected_state_map.value[id],
        );
  const plannedPremiumIds = planned_prems
    .map(normalizeVehicleId)
    .filter(Boolean);
  const ownedResearchIds = owned_researchables
    .map(normalizeVehicleId)
    .filter(Boolean);
  treeDataStore.updateOwnedVehicleIds(ownedResearchIds);

  const plan = planShortestResearchPath({
    treeData,
    targetIds,
    plannedPremiumIds,
    ownedResearchIds,
    unlockQuantityMap:
      unlock_quantitys?.[types.value.country_code]?.[
        types.value.vehicle_type
      ] ?? {},
    terminalVehicles: terminal_vehicles,
    countryCode: types.value.country_code,
    vehicleType: types.value.vehicle_type,
    priorityColumns: priority_column,
    priorityMode: priority_mode,
    ignoreMultiple: ignore_multiple,
  });

  return normalizePlanResult({
    plan,
    treeData,
    targetIds,
    ownedResearchIds,
    selectedStateMapRef: selected_state_map,
  });
}
export async function findShortestPathToVehicleWorker({
  targets = [],
  planned_prems = [],
  owned_researchables = [],
  priority_column = [],
  priority_mode = "soft",
  ignore_multiple = false,
} = {}) {
  const treeDataStore = useTreeDataStore();
  const { tree_data, selected_state_map, types } = storeToRefs(treeDataStore);

  const treeData = Array.isArray(tree_data.value) ? tree_data.value : [];
  const targetIds =
    targets.length > 0
      ? targets.map(normalizeVehicleId).filter(Boolean)
      : Object.keys(selected_state_map.value || {}).filter(
          (id) => selected_state_map.value[id],
        );
  const plannedPremiumIds = planned_prems
    .map(normalizeVehicleId)
    .filter(Boolean);
  const ownedResearchIds = owned_researchables
    .map(normalizeVehicleId)
    .filter(Boolean);
  treeDataStore.updateOwnedVehicleIds(ownedResearchIds);

  const worker = createResearchPathWorker();

  if (!worker) {
    return findShortestPathToVehicle({
      targets,
      planned_prems,
      owned_researchables,
      priority_column,
      priority_mode,
      ignore_multiple,
    });
  }

  const requestId = ++researchPathWorkerRequestId;
  const plan = await new Promise((resolve, reject) => {
    researchPathWorkerCallbacks.set(requestId, { resolve, reject });
    worker.postMessage({
      requestId,
      payload: {
        treeData,
        targetIds,
        plannedPremiumIds,
        ownedResearchIds,
        unlockQuantityMap:
          unlock_quantitys?.[types.value.country_code]?.[
            types.value.vehicle_type
          ] ?? {},
        terminalVehicles: terminal_vehicles,
        countryCode: types.value.country_code,
        vehicleType: types.value.vehicle_type,
        priorityColumns: priority_column,
        priorityMode: priority_mode,
        ignoreMultiple: ignore_multiple,
      },
    });
  });

  return normalizePlanResult({
    plan,
    treeData,
    targetIds,
    ownedResearchIds,
    selectedStateMapRef: selected_state_map,
  });
}
/** researchPathPlanner/Path Worker相关 */

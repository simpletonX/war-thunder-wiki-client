import { useTreeDataStore } from "@/stores/tree_data";

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
    clicked_item?.data_unit_id || clicked_item?.items?.[0]?.data_unit_id;

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

        if (item === clicked_item) {
          pos = { r, c, i, sub: null };
          break;
        }

        if (item.items) {
          const sub = item.items.indexOf(clicked_item);
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

export function parseNumber(value, toFormat = false) {
  if (value == null) return toFormat ? "0" : 0;

  // 转字符串统一处理
  let str = typeof value === "string" ? value : String(value);

  // 去除千分位字符串，解析成数字（默认）
  if (!toFormat) {
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

  const collect = (items, rank) => {
    for (const item of items) {
      if (item.type === "multiple") {
        collect(item.items, rank);
        continue;
      }

      map[item.data_unit_id] = {
        rank,
        rp: parseNumber(item.rp),
        sp: parseNumber(item.sp),
      };
    }
  };

  for (const rankData of tree_data) {
    const rank = rankData.rank;

    for (const col of rankData.researchable_vehicles || []) {
      collect(col, rank);
    }

    for (const col of rankData.premium_vehicles || []) {
      collect(col, rank);
    }
  }

  return map;
}

// 计算RP/SP元数据映射结果
export function calculateRankStats(selected_state_map, vehicle_cost_map) {
  const stats = {
    I: { rp: 0, sp: 0, count: 0 },
    II: { rp: 0, sp: 0, count: 0 },
    III: { rp: 0, sp: 0, count: 0 },
    IV: { rp: 0, sp: 0, count: 0 },
    V: { rp: 0, sp: 0, count: 0 },
    VI: { rp: 0, sp: 0, count: 0 },
    VII: { rp: 0, sp: 0, count: 0 },
    VIII: { rp: 0, sp: 0, count: 0 },
  };

  for (const data_unit_id in selected_state_map) {
    if (!selected_state_map[data_unit_id]) continue;

    const vehicle = vehicle_cost_map[data_unit_id];
    if (!vehicle) continue;

    const rank = vehicle.rank;
    if (!stats[rank]) continue;

    stats[rank].rp += vehicle.rp;
    stats[rank].sp += vehicle.sp;
    stats[rank].count += 1;
  }

  return stats;
}

export function updateTreeItemSelected({
  tree_data,
  target_item,
  selected,
  t_c,
  type,
  instantCaching,
}) {
  const updateItems = (items, rankSelected, isPremium = false) => {
    if (!Array.isArray(items)) return false;

    let hasSelectedInChildren = false;
    let changed = false; // 标记：是否有任何 item 状态变化

    for (const item of items) {
      if (item.items?.length) {
        let childChanged = updateItems(item.items, rankSelected, isPremium);

        // 对 type: multiple 更新其选中状态
        if (item.type === "multiple") {
          const prev = item.selected;
          item.selected = item.items.some((i) => i.selected && i.details);
          if (item.selected !== prev) childChanged = true;
        }

        if (childChanged) {
          hasSelectedInChildren = true;
          changed = true;
        }
      } else if (item.data_unit_id === target_item.data_unit_id) {
        const prev = item.selected;
        item.selected = selected;

        // 更新 rank.selected
        const idx = rankSelected.findIndex(
          (i) => i.data_unit_id === item.data_unit_id,
        );

        if (selected) {
          if (idx === -1) {
            // ✅ 如果是 premium 载具，rp/sp 设为 0
            rankSelected.push({
              data_unit_id: item.data_unit_id,
              rp: isPremium ? 0 : item.rp,
              sp: isPremium ? 0 : item.sp,
            });
          }
        } else {
          if (idx !== -1) rankSelected.splice(idx, 1);
        }

        if (item.selected !== prev) changed = true;
        hasSelectedInChildren = selected;
      }
    }

    return changed;
  };

  // 遍历每个 rank 层
  for (const rank of tree_data.value) {
    if (!rank.selected) rank.selected = [];

    // 处理 researchable_vehicles（普通载具）
    if (rank.researchable_vehicles) {
      for (const col of rank.researchable_vehicles) {
        if (updateItems(col, rank.selected, false)) {
          instantCaching(tree_data.value, t_c.value, type.value);
          return;
        }
      }
    }

    // 处理 premium_vehicles（金币载具）=> rp/sp 强制为 0
    if (rank.premium_vehicles) {
      for (const col of rank.premium_vehicles) {
        if (updateItems(col, rank.selected, true)) {
          instantCaching(tree_data.value, t_c.value, type.value);
          return;
        }
      }
    }
  }
}

/**
 * 全选/反全选整个 tree_data
 * @param {Ref} tree_data - 科技树数据
 * @param {boolean} selectAll - true 全选，false 反选
 * @param {string} t_c - 国家代号，用于缓存
 * @param {string} type - 军种或类型，用于缓存
 * @param {Function} instantCaching - 缓存函数
 */
export function toggleSelectAll({
  tree_data,
  selectAll,
  t_c,
  type,
  instantCaching,
}) {
  if (!tree_data?.value) return;

  const allSelectMode =
    Boolean(Number(localStorage.getItem("all_select_mode"))) || false;

  for (const rank of tree_data.value) {
    rank.selected = [];

    const processItems = (items, includeInSelectAll) => {
      if (!Array.isArray(items)) return;

      for (const item of items) {
        if (item.items?.length) {
          // ⭐ 新逻辑：multiple 只选第一个子项
          if (
            selectAll &&
            includeInSelectAll &&
            allSelectMode &&
            item.type === "multiple"
          ) {
            const first = item.items[0];

            if (first) {
              first.selected = first.details;

              if (first.selected) {
                rank.selected.push({
                  data_unit_id: first.data_unit_id,
                  rp: first.rp,
                  sp: first.sp,
                });
              }
            }

            // 其余子项取消
            for (let i = 1; i < item.items.length; i++) {
              item.items[i].selected = false;
            }

            item.selected = first?.selected || false;
          } else {
            processItems(item.items, includeInSelectAll);

            if (item.type === "multiple") {
              item.selected = item.items.some((i) => i.selected && i.details);
            }
          }
        } else {
          if (selectAll && includeInSelectAll) {
            item.selected = item.details;
          } else if (!selectAll) {
            item.selected = false;
          }

          if (item.selected) {
            rank.selected.push({
              data_unit_id: item.data_unit_id,
              rp: item.rp,
              sp: item.sp,
            });
          }
        }
      }
    };

    // 全选只处理 researchable
    if (Array.isArray(rank.researchable_vehicles)) {
      for (const col of rank.researchable_vehicles) {
        processItems(col, true);
      }
    }

    // 反选清空 premium
    if (!selectAll && Array.isArray(rank.premium_vehicles)) {
      for (const col of rank.premium_vehicles) {
        processItems(col, false);
      }
    }
  }

  if (typeof instantCaching === "function") {
    instantCaching(tree_data.value, t_c.value, type.value);
  }
}

/**
 * 全选/反全选列到当前item
 */
export function toggleSelectColumnAbove({
  tree_data,
  clicked_item,
  select,
  t_c,
  type,
  instantCaching,
}) {
  if (!Array.isArray(tree_data) || !clicked_item) return;

  // =========================
  // ① 定位 clicked_item
  // =========================
  let pos = null;

  for (let r = 0; r < tree_data.length && !pos; r++) {
    const cols = tree_data[r].researchable_vehicles;
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
  // ② 同列向上执行
  // =========================
  for (let r = 0; r <= targetRank; r++) {
    const col = tree_data[r].researchable_vehicles?.[targetCol];
    if (!Array.isArray(col)) continue;

    const itemEnd = r < targetRank ? col.length - 1 : targetItem;

    for (let i = 0; i <= itemEnd; i++) {
      const item = col[i];

      // ===== single =====
      if (!item.items || item.type !== "multiple") {
        item.selected = select;
        continue;
      }

      // ===== multiple =====

      // ⭐ 取消：无条件全清
      if (select === false) {
        for (const subItem of item.items) {
          subItem.selected = false;
        }
        continue;
      }

      // ===== 以下只可能是 select === true =====

      // 上方 rank 或 当前 rank 之前
      if (r < targetRank || i < targetItem) {
        item.items[0].selected = true;
        continue;
      }

      // 当前 rank + 目标 item
      if (i === targetItem) {
        // 点 multiple 本体
        if (targetSub === null) {
          item.items[0].selected = true;
        }
        // 点 items[k]
        else {
          for (let k = 0; k <= targetSub; k++) {
            item.items[k].selected = true;
          }
        }
      }
    }
  }

  // =========================
  // ③ 同步派生状态（合并式）
  // =========================
  for (const rank of tree_data) {
    // 先把已有 selected 放进 Map，防止被覆盖
    const selectedMap = new Map(
      (rank.selected || []).map((i) => [i.data_unit_id, i]),
    );

    const sync = (items) => {
      for (const item of items) {
        if (item.items) {
          sync(item.items);
          item.selected = item.items.some((i) => i.selected);
        } else {
          if (item.selected) {
            // ✅ 新增 / 覆盖
            selectedMap.set(item.data_unit_id, {
              data_unit_id: item.data_unit_id,
              rp: item.rp,
              sp: item.sp,
            });
          } else {
            // ✅ 取消选中时才移除
            selectedMap.delete(item.data_unit_id);
          }
        }
      }
    };

    for (const col of rank.researchable_vehicles || []) {
      sync(col);
    }

    // 最终回写
    rank.selected = Array.from(selectedMap.values());
  }

  if (typeof instantCaching === "function") {
    console.log(tree_data[0]);
    instantCaching(tree_data, t_c, type);
  }
}

/**
 * 检测整个 tree_data 中所有载具（含 researchable_vehicles 与 premium_vehicles）
 * 是否全部加载完详情（details === true）
 * @param {Array} tree_data - 完整的科技树数据
 * @returns {boolean} - 若所有载具的 details 都为 true，则返回 true
 */
export function areAllDetailsTrueInTree(tree_data) {
  if (!Array.isArray(tree_data) || tree_data.length === 0) return false;

  const checkItems = (items) => {
    if (!Array.isArray(items)) return true;

    for (const item of items) {
      // multiple 类型：递归检查其子项
      if (item.type === "multiple" && Array.isArray(item.items)) {
        if (!checkItems(item.items)) return false;
      } else {
        // single 类型或普通对象：必须有 details = true
        if (!item.details) return false;
      }
    }

    return true;
  };

  // 遍历每个 rank
  for (const rank of tree_data) {
    // 检查 researchable_vehicles
    if (Array.isArray(rank.researchable_vehicles)) {
      for (const col of rank.researchable_vehicles) {
        if (!checkItems(col)) return false;
      }
    }

    // 检查 premium_vehicles
    if (Array.isArray(rank.premium_vehicles)) {
      for (const col of rank.premium_vehicles) {
        if (!checkItems(col)) return false;
      }
    }
  }

  return true;
}

/**
 * 遍历 tree_data，筛选出所有 premium_vehicles 下 selected 为 true 的 item，
 * 并导出它们的 data_unit_id 到一个数组中
 */
export function getSelectedPremiumIds(tree_data) {
  const result = [];

  for (const rank of tree_data) {
    if (!Array.isArray(rank.premium_vehicles)) continue;

    for (const column of rank.premium_vehicles) {
      if (!Array.isArray(column)) continue;

      for (const item of column) {
        // multiple 类型
        if (item.type === "multiple" && Array.isArray(item.items)) {
          for (const subItem of item.items) {
            if (subItem.selected) {
              result.push(subItem.data_unit_id);
            }
          }
        }

        // single 类型
        if (item.type === "single" && item.selected) {
          result.push(item.data_unit_id);
        }
      }
    }
  }

  return result;
}

// instantCaching(tree_data.value, t_c.value, type.value);

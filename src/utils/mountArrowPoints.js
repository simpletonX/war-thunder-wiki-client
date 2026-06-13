/**
 * 为 researchable_vehicles 中的每个 item 挂载 arrow_points（placeholder_item、cross_level、has_next_item）
 * - 不修改原始 tree_data，仅在深拷贝上计算
 * - 不会插入 { type: "placeholder" }
 * - 计算逻辑基于 rank 的虚拟行轴（prefixRows + rowIndex）
 * - 已存在 arrow_points 的 item 不再重复计算（性能优化）
 *
 * @param {Object} options
 * @param {Ref<Array>} options.tree_data - Vue3 响应式科技树数据（通过 .value 访问）
 * @param {Ref<string>} options._t_c - 国家代号（如 "sweden"）
 * @param {Ref<string>} options._type - 军种类型（如 "ground"）
 * @param {Function} options.instantCaching - 缓存函数 (data, t_c, type)
 */
export async function mountArrowPoints({ tree_data, _t_c, _type, instantCaching }) {
  if (!tree_data || !tree_data.value) {
    console.warn("mountArrowPoints: 无效的 tree_data 输入");
    return;
  }

  // 深拷贝原始数据，避免污染
  const copy_tree_data = JSON.parse(JSON.stringify(tree_data.value));
  const rankCount = copy_tree_data.length;

  // 1) 计算每个 rank 的最长列长度
  const rankMaxColLens = new Array(rankCount).fill(0);
  for (let r = 0; r < rankCount; r++) {
    const rankObj = copy_tree_data[r];
    const allCols = [
      ...(rankObj.researchable_vehicles || []),
      ...(rankObj.premium_vehicles || []),
    ];
    rankMaxColLens[r] =
      allCols.length === 0
        ? 0
        : Math.max(
            ...allCols.map((col) => (Array.isArray(col) ? col.length : 0))
          );
  }

  // 2) prefixRows：到当前 rank 顶部为止的虚拟行数
  const prefixRows = new Array(rankCount).fill(0);
  for (let r = 1; r < rankCount; r++) {
    prefixRows[r] = prefixRows[r - 1] + rankMaxColLens[r - 1];
  }

  // 3) 计算最大列数
  const maxResearchCols = Math.max(
    ...copy_tree_data.map((rk) => (rk.researchable_vehicles || []).length, 0)
  );

  // 4) 判断是否为有效 item
  function isValidResearchItem(item) {
    if (!item) return false;
    return item.type === "single" || item.type === "multiple";
  }

  // 5) 主循环
  for (let colIndex = 0; colIndex < maxResearchCols; colIndex++) {
    for (let rankIndex = 0; rankIndex < rankCount; rankIndex++) {
      const rankObj = copy_tree_data[rankIndex];
      const col = rankObj.researchable_vehicles?.[colIndex];
      if (!Array.isArray(col)) continue;

      for (let rowIndex = 0; rowIndex < col.length; rowIndex++) {
        const item = col[rowIndex];
        if (!isValidResearchItem(item)) continue;

        // 如果已存在 arrow_points，跳过本轮计算（性能优化）
        if (item.arrow_points && typeof item.arrow_points === "object")
          continue;

        let found = false;
        let foundRank = -1;
        let foundRow = -1;

        // 查找同列下一个真实 item
        for (let r = rankIndex; r < rankCount && !found; r++) {
          const nextRankCol =
            copy_tree_data[r].researchable_vehicles?.[colIndex];
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

        const has_next_item = found; // ✅ 新增：标记当前 item 下方是否有载具

        if (!found) {
          item.arrow_points = {
            placeholder_item: 0,
            cross_level: 0,
            has_next_item,
          };
          continue;
        }

        const cross_level = foundRank - rankIndex;
        const virtualCur = prefixRows[rankIndex] + rowIndex;
        const virtualNext = prefixRows[foundRank] + foundRow;
        const placeholder_item = Math.max(0, virtualNext - virtualCur - 1);

        item.arrow_points = {
          placeholder_item,
          cross_level,
          has_next_item, // ✅ 新增字段
        };
      }
    }
  }

  // ✅ 即时缓存，tree_data进本地存储
  await instantCaching(copy_tree_data, _t_c, _type);
}

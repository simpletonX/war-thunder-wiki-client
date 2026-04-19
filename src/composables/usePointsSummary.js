import { computed } from "vue";

/**
 * 根据 currentPointsType 计算科技树总 RP 或 SP
 * 并统计已选中载具数量
 * @param {Ref} tree_data - 科技树数据
 * @returns {Object} { totalSummary：{ rp, sp }, totalSelectNum：已选中的载具数 }
 */
export function usePointsSummary(tree_data) {
  /** 将字符串或数字转成数值，例如 "63,000" -> 63000 */
  const parseNumber = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return val;
    return Number(String(val).replace(/,/g, "")) || 0;
  };

  /** 格式化数字为带逗号的字符串 */
  const formatNumber = (num) => num.toLocaleString("en-US");

  /** 总 RP 与 SP */
  const totalSummary = computed(() => {
    let totalRP = 0;
    let totalSP = 0;

    for (const rank of tree_data.value) {
      if (!Array.isArray(rank.selected)) continue;

      for (const item of rank.selected) {
        totalRP += parseNumber(item.rp);
        totalSP += parseNumber(item.sp);
      }
    }

    return {
      rp: formatNumber(totalRP),
      sp: formatNumber(totalSP),
    };
  });

  /** 当前已选中载具数量 */
  const totalSelectNum = computed(() => {
    let count = 0;

    for (const rank of tree_data.value) {
      if (Array.isArray(rank.selected)) {
        count += rank.selected.length;
      }
    }

    return count;
  });

  return { totalSummary, totalSelectNum };
}

function toId(value) {
  return typeof value === "string" ? value : value?.data_unit_id;
}

function parseCost(value) {
  if (value == null) return 0;
  const normalized = String(value).replace(/,/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function getPriority(columnIndex, priorityColumns) {
  const index = priorityColumns.indexOf(columnIndex);
  return index === -1 ? 9999 : index;
}

function hasArrowToNext(root, terminalVehicles, countryCode, vehicleType) {
  if (!root?.data_unit_id) return false;

  const meta = terminalVehicles?.[countryCode]?.[vehicleType]?.[root.data_unit_id];

  if (meta && vehicleType !== "helicopters") return false;
  if (meta === true) return false;

  if (meta && typeof meta === "object") {
    return Boolean(
      meta.has_next_item ||
        meta.has_next_left_item ||
        meta.has_next_right_item ||
        meta.has_right_item,
    );
  }

  return true;
}

function rankRequirements(treeData, unlockQuantityMap, targetRankIndex) {
  return treeData.map((rankBlock, rankIndex) =>
    rankIndex < targetRankIndex ? (unlockQuantityMap?.[rankBlock.rank] ?? 0) : 0,
  );
}

function buildGraph({
  treeData,
  terminalVehicles,
  countryCode,
  vehicleType,
  priorityColumns,
}) {
  const hasPriorityColumns = priorityColumns.length > 0;
  const research = new Map();
  const premium = new Map();
  const deps = new Map();
  const byRank = new Map();
  const maxColumns = Math.max(
    0,
    ...treeData.map((rankBlock) => rankBlock.researchable_vehicles?.length || 0),
  );

  const addResearch = (entry) => {
    research.set(entry.id, entry);
    if (!byRank.has(entry.rankIndex)) byRank.set(entry.rankIndex, []);
    byRank.get(entry.rankIndex).push(entry);
    if (!deps.has(entry.id)) deps.set(entry.id, []);
  };

  const createEntry = ({
    item,
    root,
    rankBlock,
    rankIndex,
    columnIndex,
    rowIndex,
    childIndex = null,
  }) => ({
    id: item.data_unit_id,
    title: item.title,
    item,
    root,
    rank: rankBlock.rank,
    rankIndex,
    columnIndex,
    rowIndex,
    childIndex,
    rp: parseCost(item.rp),
    sp: parseCost(item.sp),
    priority: getPriority(columnIndex, priorityColumns),
  });

  for (let columnIndex = 0; columnIndex < maxColumns; columnIndex++) {
    let previousMainId = null;

    treeData.forEach((rankBlock, rankIndex) => {
      const column = rankBlock.researchable_vehicles?.[columnIndex] || [];

      column.forEach((root, rowIndex) => {
        const entries = [];

        if (root?.type === "multiple" && Array.isArray(root.items)) {
          root.items.forEach((item, childIndex) => {
            if (!item?.data_unit_id) return;
            entries.push(
              createEntry({
                item,
                root,
                rankBlock,
                rankIndex,
                columnIndex,
                rowIndex,
                childIndex,
              }),
            );
          });
        } else if (root?.data_unit_id) {
          entries.push(
            createEntry({
              item: root,
              root,
              rankBlock,
              rankIndex,
              columnIndex,
              rowIndex,
            }),
          );
        }

        if (!entries.length) return;

        for (const entry of entries) addResearch(entry);

        if (previousMainId) {
          deps.get(entries[0].id).push(previousMainId);
        }

        for (let i = 1; i < entries.length; i++) {
          deps.get(entries[i].id).push(entries[i - 1].id);
        }

        previousMainId = hasArrowToNext(
          root,
          terminalVehicles,
          countryCode,
          vehicleType,
        )
          ? entries[0].id
          : null;
      });
    });
  }

  treeData.forEach((rankBlock, rankIndex) => {
    rankBlock.premium_vehicles?.forEach((column, columnIndex) => {
      column?.forEach((root, rowIndex) => {
        const addPremium = (item, childIndex = null) => {
          if (!item?.data_unit_id) return;
          premium.set(item.data_unit_id, {
            id: item.data_unit_id,
            title: item.title,
            item,
            rank: rankBlock.rank,
            rankIndex,
            columnIndex,
            rowIndex,
            childIndex,
            rp: parseCost(item.rp),
            sp: parseCost(item.sp),
          });
        };

        if (root?.type === "multiple" && Array.isArray(root.items)) {
          root.items.forEach((item, childIndex) => addPremium(item, childIndex));
        } else {
          addPremium(root);
        }
      });
    });
  });

  for (const entries of byRank.values()) {
    entries.sort((a, b) => {
      if (!hasPriorityColumns) {
        if (a.rp !== b.rp) return a.rp - b.rp;
        if (a.sp !== b.sp) return a.sp - b.sp;
        if (a.columnIndex !== b.columnIndex) {
          return a.columnIndex - b.columnIndex;
        }
        if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
        return (a.childIndex ?? -1) - (b.childIndex ?? -1);
      }

      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.columnIndex !== b.columnIndex) return a.columnIndex - b.columnIndex;
      if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
      if ((a.childIndex ?? -1) !== (b.childIndex ?? -1)) {
        return (a.childIndex ?? -1) - (b.childIndex ?? -1);
      }

      return 0;
    });
  }

  return { research, premium, deps, byRank };
}

function createClosureGetter(deps, warnings) {
  const cache = new Map();

  const visit = (id, stack = new Set()) => {
    if (cache.has(id)) return cache.get(id);

    if (stack.has(id)) {
      warnings.push(`Dependency cycle detected at ${id}`);
      return [];
    }

    stack.add(id);
    const result = [];

    for (const depId of deps.get(id) || []) {
      result.push(...visit(depId, stack));
    }

    result.push(id);
    stack.delete(id);

    const unique = [...new Set(result)];
    cache.set(id, unique);
    return unique;
  };

  return visit;
}

function getInitialFreeResearchIds(graph) {
  return [...graph.research.values()]
    .filter((entry) => entry.rankIndex === 0 && entry.rp === 0)
    .sort((a, b) => {
      if (a.columnIndex !== b.columnIndex) return a.columnIndex - b.columnIndex;
      if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
      return (a.childIndex ?? -1) - (b.childIndex ?? -1);
    })
    .map((entry) => entry.id);
}

export function planShortestResearchPath({
  treeData = [],
  targetIds = [],
  plannedPremiumIds = [],
  unlockQuantityMap,
  terminalVehicles,
  countryCode,
  vehicleType,
  priorityColumns = [],
  priorityMode = "soft",
  maxIterations = 120000,
}) {
  const warnings = [];
  const normalizedTargets = targetIds.map(toId).filter(Boolean);
  const normalizedPremiums = plannedPremiumIds.map(toId).filter(Boolean);
  const normalizedPriorityMode = priorityMode === "hard" ? "hard" : "soft";
  const allowRankOverflow =
    priorityColumns.length > 0 && normalizedPriorityMode === "hard";
  const searchMode =
    priorityColumns.length > 0
      ? `priority-${normalizedPriorityMode}`
      : "min-rp";

  const graph = buildGraph({
    treeData,
    terminalVehicles,
    countryCode,
    vehicleType,
    priorityColumns,
  });
  const getClosure = createClosureGetter(graph.deps, warnings);

  const targetRankIndex = Math.max(
    -1,
    ...normalizedTargets
      .map((id) => graph.research.get(id)?.rankIndex)
      .filter((value) => typeof value === "number"),
  );
  const requirements = rankRequirements(
    treeData,
    unlockQuantityMap,
    targetRankIndex,
  );

  const premiumIds = new Set();
  const premiumCounts = new Array(treeData.length).fill(0);

  for (const id of normalizedPremiums) {
    const entry = graph.premium.get(id);
    if (!entry) {
      warnings.push(`Planned premium vehicle was not found: ${id}`);
      continue;
    }

    premiumIds.add(id);

    if (entry.rankIndex < targetRankIndex) {
      premiumCounts[entry.rankIndex]++;
    }
  }

  const initialSelected = new Set();

  for (const id of getInitialFreeResearchIds(graph)) {
    for (const depId of getClosure(id)) initialSelected.add(depId);
  }

  for (const id of normalizedTargets) {
    if (!graph.research.has(id)) {
      warnings.push(`Target is not a researchable vehicle: ${id}`);
      continue;
    }

    for (const depId of getClosure(id)) initialSelected.add(depId);
  }

  const countRanks = (selectedIds) => {
    const counts = [...premiumCounts];

    for (const id of selectedIds) {
      const entry = graph.research.get(id);
      if (entry) counts[entry.rankIndex]++;
    }

    return counts;
  };

  const costOf = (selectedIds) => {
    let rp = 0;
    let sp = 0;

    for (const id of selectedIds) {
      const entry = graph.research.get(id);
      if (!entry) continue;
      rp += entry.rp;
      sp += entry.sp;
    }

    return { rp, sp };
  };

  const costOfIds = (ids) => {
    let rp = 0;
    let sp = 0;

    for (const id of ids) {
      const entry = graph.research.get(id);
      if (!entry) continue;
      rp += entry.rp;
      sp += entry.sp;
    }

    return { rp, sp };
  };

  const overflows = (counts) =>
    requirements.some(
      (required, rankIndex) => required > 0 && counts[rankIndex] > required,
    );

  const goalReached = (counts) =>
    requirements.every(
      (required, rankIndex) => required === 0 || counts[rankIndex] === required,
    );

  const lowerBoundRp = (counts, selectedIds) => {
    let bound = 0;

    for (let rankIndex = 0; rankIndex < requirements.length; rankIndex++) {
      const need = requirements[rankIndex] - counts[rankIndex];
      if (need <= 0) continue;

      const costs = (graph.byRank.get(rankIndex) || [])
        .filter((entry) => !selectedIds.has(entry.id))
        .map((entry) => entry.rp)
        .sort((a, b) => a - b);

      if (costs.length < need) return Infinity;

      for (let i = 0; i < need; i++) bound += costs[i];
    }

    return bound;
  };

  const firstOpenRank = (counts) =>
    requirements.findIndex(
      (required, rankIndex) => required > 0 && counts[rankIndex] < required,
    );

  const initialCounts = countRanks(initialSelected);

  if (!allowRankOverflow && overflows(initialCounts)) {
    return {
      ok: false,
      selectedIds: [...initialSelected],
      premiumIds: [...premiumIds],
      totalRp: costOf(initialSelected).rp,
      totalSp: costOf(initialSelected).sp,
      rankCounts: initialCounts,
      warnings: [
        ...warnings,
        "Target dependencies exceed one or more exact rank requirements.",
      ],
      graph,
      mode: searchMode,
    };
  }

  let iterations = 0;

  const makeKey = (selectedIds, rankIndex) =>
    `${rankIndex}|${[...selectedIds].sort().join(",")}`;

  if (priorityColumns.length > 0) {
    let priorityResult = null;
    const visited = new Set();
    const priorityColumnSet = new Set(priorityColumns);

    const priorityScoreOf = (selectedIds) => {
      let count = 0;

      for (const id of selectedIds) {
        const entry = graph.research.get(id);
        if (
          entry &&
          entry.rankIndex < targetRankIndex &&
          priorityColumnSet.has(entry.columnIndex)
        ) {
          count++;
        }
      }

      return count;
    };

    const isBetterPriorityResult = (selectedIds, counts) => {
      const cost = costOf(selectedIds);
      const score = priorityScoreOf(selectedIds);

      if (!priorityResult) {
        priorityResult = {
          selectedIds: new Set(selectedIds),
          rankCounts: [...counts],
          totalRp: cost.rp,
          totalSp: cost.sp,
          priorityScore: score,
        };
        return;
      }

      if (
        score > priorityResult.priorityScore ||
        (score === priorityResult.priorityScore &&
          (cost.rp < priorityResult.totalRp ||
            (cost.rp === priorityResult.totalRp &&
              cost.sp < priorityResult.totalSp)))
      ) {
        priorityResult = {
          selectedIds: new Set(selectedIds),
          rankCounts: [...counts],
          totalRp: cost.rp,
          totalSp: cost.sp,
          priorityScore: score,
        };
      }
    };

    const searchByPriority = (selectedIds, counts) => {
      iterations++;
      if (iterations > maxIterations) return false;

      const rankIndex = firstOpenRank(counts);

      if (rankIndex === -1) {
        if (allowRankOverflow) {
          const cost = costOf(selectedIds);
          priorityResult = {
            selectedIds: new Set(selectedIds),
            rankCounts: [...counts],
            totalRp: cost.rp,
            totalSp: cost.sp,
            priorityScore: priorityScoreOf(selectedIds),
          };
          return true;
        }

        isBetterPriorityResult(selectedIds, counts);
        return false;
      }

      const key = makeKey(selectedIds, rankIndex);
      if (visited.has(key)) return false;
      visited.add(key);

      const candidates = [...graph.research.values()]
        .filter((candidate) => candidate.rankIndex < targetRankIndex)
        .filter((candidate) => !selectedIds.has(candidate.id))
        .map((candidate) => {
          const packageIds = getClosure(candidate.id).filter(
            (id) => !selectedIds.has(id),
          );
          const packageCost = costOfIds(packageIds);
          const packageCounts = countRanks(new Set([...selectedIds, ...packageIds]));
          const addedInRank = packageCounts[rankIndex] - counts[rankIndex];

          return {
            candidate,
            packageIds,
            packageRp: packageCost.rp,
            packageSp: packageCost.sp,
            addedInRank,
          };
        })
        .filter((item) => item.packageIds.length)
        .filter((item) => item.addedInRank > 0)
        .sort((a, b) => {
          if (a.candidate.priority !== b.candidate.priority) {
            return a.candidate.priority - b.candidate.priority;
          }

          if (a.candidate.columnIndex !== b.candidate.columnIndex) {
            return a.candidate.columnIndex - b.candidate.columnIndex;
          }

          const aIsSpecified = a.candidate.priority !== 9999;
          const bIsSpecified = b.candidate.priority !== 9999;
          const hasFold =
            a.candidate.childIndex !== null || b.candidate.childIndex !== null;

          if (aIsSpecified && bIsSpecified) {
            if (a.packageRp !== b.packageRp) return a.packageRp - b.packageRp;
            if (a.packageSp !== b.packageSp) return a.packageSp - b.packageSp;
          }

          if (hasFold) {
            if (a.packageRp !== b.packageRp) return a.packageRp - b.packageRp;
            if (a.packageSp !== b.packageSp) return a.packageSp - b.packageSp;
          }

          if (a.candidate.rankIndex !== b.candidate.rankIndex) {
            return a.candidate.rankIndex - b.candidate.rankIndex;
          }

          if (a.candidate.rowIndex !== b.candidate.rowIndex) {
            return a.candidate.rowIndex - b.candidate.rowIndex;
          }

          return (
            (a.candidate.childIndex ?? -1) - (b.candidate.childIndex ?? -1)
          );
        });

      for (const { packageIds } of candidates) {
        const nextSelected = new Set(selectedIds);
        for (const id of packageIds) nextSelected.add(id);

        const nextCounts = countRanks(nextSelected);
        const addedInRank = nextCounts[rankIndex] - counts[rankIndex];
        const remaining = requirements[rankIndex] - counts[rankIndex];

        if (addedInRank <= 0) continue;
        if (!allowRankOverflow && addedInRank > remaining) continue;
        if (!allowRankOverflow && overflows(nextCounts)) continue;

        if (searchByPriority(nextSelected, nextCounts)) return true;
      }

      return false;
    };

    searchByPriority(initialSelected, initialCounts);

    if (!priorityResult) {
      return {
        ok: false,
        selectedIds: [...initialSelected],
        premiumIds: [...premiumIds],
        totalRp: costOf(initialSelected).rp,
        totalSp: costOf(initialSelected).sp,
        rankCounts: initialCounts,
        warnings: [
          ...warnings,
          iterations > maxIterations
            ? "Priority route search reached the iteration limit before finding a valid route."
            : "No valid priority route satisfies exact rank counts and dependencies.",
        ],
        graph,
        mode: searchMode,
      };
    }

    return {
      ok: true,
      selectedIds: [...priorityResult.selectedIds],
      premiumIds: [...premiumIds],
      totalRp: priorityResult.totalRp,
      totalSp: priorityResult.totalSp,
      rankCounts: priorityResult.rankCounts,
      warnings:
        !allowRankOverflow && priorityResult.priorityScore === 0
          ? [
              ...warnings,
              `No exact-count legal route could include priority columns: ${priorityColumns.join(", ")}`,
            ]
          : warnings,
      graph,
      mode: searchMode,
      priorityScore: priorityResult.priorityScore,
    };
  }

  let best = null;
  const memo = new Map();

  const search = (selectedIds, counts) => {
    iterations++;
    if (iterations > maxIterations) return;

    const cost = costOf(selectedIds);

    if (best && cost.rp >= best.totalRp) return;
    if (best && cost.rp + lowerBoundRp(counts, selectedIds) >= best.totalRp) {
      return;
    }

    const rankIndex = firstOpenRank(counts);

    if (rankIndex === -1) {
      if (!best || cost.rp < best.totalRp || (cost.rp === best.totalRp && cost.sp < best.totalSp)) {
        best = {
          selectedIds: new Set(selectedIds),
          rankCounts: [...counts],
          totalRp: cost.rp,
          totalSp: cost.sp,
        };
      }
      return;
    }

    const key = makeKey(selectedIds, rankIndex);
    const previousCost = memo.get(key);
    if (previousCost != null && previousCost <= cost.rp) return;
    memo.set(key, cost.rp);

    const remaining = requirements[rankIndex] - counts[rankIndex];
    const candidates = graph.byRank.get(rankIndex) || [];

    for (const candidate of candidates) {
      if (selectedIds.has(candidate.id)) continue;

      const packageIds = getClosure(candidate.id).filter(
        (id) => !selectedIds.has(id),
      );

      if (!packageIds.length) continue;

      const nextSelected = new Set(selectedIds);
      for (const id of packageIds) nextSelected.add(id);

      const nextCounts = countRanks(nextSelected);
      const addedInRank = nextCounts[rankIndex] - counts[rankIndex];

      if (addedInRank <= 0 || addedInRank > remaining) continue;
      if (overflows(nextCounts)) continue;

      search(nextSelected, nextCounts);
    }
  };

  search(initialSelected, initialCounts);

  if (!best) {
    return {
      ok: false,
      selectedIds: [...initialSelected],
      premiumIds: [...premiumIds],
      totalRp: costOf(initialSelected).rp,
      totalSp: costOf(initialSelected).sp,
      rankCounts: initialCounts,
      warnings: [
        ...warnings,
        iterations > maxIterations
          ? "Route search reached the iteration limit before finding a valid route."
          : "No valid route satisfies exact rank counts and dependencies.",
      ],
      graph,
      mode: "min-rp",
    };
  }

  return {
    ok: true,
    selectedIds: [...best.selectedIds],
    premiumIds: [...premiumIds],
    totalRp: best.totalRp,
    totalSp: best.totalSp,
    rankCounts: best.rankCounts,
    warnings,
    graph,
    mode: "min-rp",
    priorityScore: 0,
  };
}

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

function createClosureGetter(deps, warnings, ownedIds = new Set()) {
  const cache = new Map();

  const visit = (id, stack = new Set()) => {
    if (cache.has(id)) return cache.get(id);

    // 已拥有载具是规划依赖链的起点，不再继续回溯它之前的载具。
    if (ownedIds.has(id)) {
      const result = [id];
      cache.set(id, result);
      return result;
    }

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
  ownedResearchIds = [],
  unlockQuantityMap,
  terminalVehicles,
  countryCode,
  vehicleType,
  priorityColumns = [],
  priorityMode = "soft",
  ignoreMultiple = false,
  maxIterations = 120000,
}) {
  const warnings = [];
  const normalizedTargets = targetIds.map(toId).filter(Boolean);
  const normalizedPremiums = plannedPremiumIds.map(toId).filter(Boolean);
  const normalizedOwnedIds = ownedResearchIds.map(toId).filter(Boolean);
  const normalizedPriorityMode = priorityMode === "hard" ? "hard" : "soft";
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
  const ownedIds = new Set();
  for (const id of normalizedOwnedIds) {
    if (graph.research.has(id)) {
      ownedIds.add(id);
    } else {
      warnings.push(`Owned researchable vehicle was not found: ${id}`);
    }
  }
  const getClosure = createClosureGetter(graph.deps, warnings, ownedIds);
  const validTargetIds = normalizedTargets.filter((id) => {
    if (graph.research.has(id)) return true;
    warnings.push(`Target is not a researchable vehicle: ${id}`);
    return false;
  });

  if (!validTargetIds.length) {
    return {
      ok: false,
      selectedIds: [],
      premiumIds: [],
      totalRp: 0,
      totalSp: 0,
      rankCounts: new Array(treeData.length).fill(0),
      warnings: [...warnings, "No valid research target was provided."],
      graph,
      mode: searchMode,
      priorityScore: 0,
      searchComplete: true,
      ownedIds: [...ownedIds],
    };
  }

  const targetRankIndex = Math.max(
    -1,
    ...validTargetIds
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

  for (const id of ownedIds) initialSelected.add(id);

  for (const id of getInitialFreeResearchIds(graph)) {
    for (const depId of getClosure(id)) initialSelected.add(depId);
  }

  for (const id of validTargetIds) {
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
      if (ownedIds.has(id)) continue;
      rp += entry.rp;
      sp += entry.sp;
    }

    return { rp, sp };
  };

  const rpOfIds = (ids) => {
    let rp = 0;

    for (const id of ids) {
      const entry = graph.research.get(id);
      if (!entry) continue;
      if (ownedIds.has(id)) continue;
      rp += entry.rp;
    }

    return rp;
  };

  const firstOpenRank = (counts) =>
    requirements.findIndex(
      (required, rankIndex) => required > 0 && counts[rankIndex] < required,
    );

  const initialCounts = countRanks(initialSelected);
  const researchIdsOf = (ids) => [...ids].filter((id) => !ownedIds.has(id));
  const priorityColumnSet = new Set(priorityColumns);
  const priorityScoreOf = (selectedIds) => {
    let count = 0;

    for (const id of selectedIds) {
      const entry = graph.research.get(id);
      if (
        entry &&
        !ownedIds.has(id) &&
        entry.rankIndex < targetRankIndex &&
        priorityColumnSet.has(entry.columnIndex)
      ) {
        count++;
      }
    }

    return count;
  };
  const isIgnoredMultipleFiller = (entry) =>
    ignoreMultiple && entry?.childIndex != null && entry.childIndex > 0;

  let iterations = 0;

  const makeKey = (selectedIds, rankIndex) =>
    `${rankIndex}|${[...selectedIds].sort().join(",")}`;

  /**
   * 精确求解最少 RP 路线。
   *
   * 研发依赖图由 buildGraph 构造成列内森林：每个节点最多有一个前置
   * 节点，不同根节点之间没有依赖。对每棵依赖树枚举“选择/不选择”并按
   * 各 Rank 已满足数量压缩状态，再合并所有根节点。相同计数状态只保留
   * (RP, -priorityScore) 字典序最优解，因此不会丢弃潜在的全局最优解。
   */
  const solveExactMinimumRoute = () => {
    const entries = [...graph.research.values()];
    const entryIndex = new Map(
      entries.map((entry, index) => [entry.id, index]),
    );
    const children = new Map(entries.map((entry) => [entry.id, []]));
    const roots = [];

    for (const entry of entries) {
      const dependencyIds = graph.deps.get(entry.id) || [];
      if (dependencyIds.length > 1) {
        throw new Error(
          `Exact route search requires at most one dependency per vehicle: ${entry.id}`,
        );
      }

      // 已拥有载具是新的可用起点，其更早的依赖不属于本次规划。
      const parentId = ownedIds.has(entry.id) ? null : dependencyIds[0];
      if (parentId && children.has(parentId)) {
        children.get(parentId).push(entry.id);
      } else {
        roots.push(entry.id);
      }
    }

    const zeroCounts = () => new Array(requirements.length).fill(0);
    const capCounts = (counts) =>
      counts.map((count, rankIndex) =>
        Math.min(count, requirements[rankIndex]),
      );
    const countsKey = (counts) => counts.join(",");
    const isBetter = (candidate, current) => {
      if (!current) return true;
      if (candidate.rp !== current.rp) return candidate.rp < current.rp;
      if (candidate.priorityScore !== current.priorityScore) {
        return candidate.priorityScore > current.priorityScore;
      }
      return candidate.mask < current.mask;
    };
    const addState = (states, state) => {
      const key = countsKey(state.counts);
      if (isBetter(state, states.get(key))) states.set(key, state);
    };
    const mergeStates = (leftStates, rightStates) => {
      const merged = new Map();

      for (const left of leftStates.values()) {
        for (const right of rightStates.values()) {
          const counts = left.counts.map((count, rankIndex) =>
            Math.min(
              requirements[rankIndex],
              count + right.counts[rankIndex],
            ),
          );
          addState(merged, {
            counts,
            rp: left.rp + right.rp,
            priorityScore: left.priorityScore + right.priorityScore,
            mask: left.mask | right.mask,
          });
        }
      }

      return merged;
    };

    const forcedSubtreeCache = new Map();
    const hasForcedSubtree = (id) => {
      if (forcedSubtreeCache.has(id)) return forcedSubtreeCache.get(id);
      const forced =
        initialSelected.has(id) ||
        (children.get(id) || []).some(hasForcedSubtree);
      forcedSubtreeCache.set(id, forced);
      return forced;
    };

    const subtreeCache = new Map();
    const solveSubtree = (id) => {
      if (subtreeCache.has(id)) return subtreeCache.get(id);

      const entry = graph.research.get(id);
      if (isIgnoredMultipleFiller(entry) && !hasForcedSubtree(id)) {
        const skippedStates = new Map();
        addState(skippedStates, {
          counts: zeroCounts(),
          rp: 0,
          priorityScore: 0,
          mask: 0n,
        });
        subtreeCache.set(id, skippedStates);
        return skippedStates;
      }

      const nodeCounts = zeroCounts();
      nodeCounts[entry.rankIndex] = Math.min(
        1,
        requirements[entry.rankIndex],
      );
      const isOwned = ownedIds.has(id);
      let selectedStates = new Map();
      addState(selectedStates, {
        counts: nodeCounts,
        rp: isOwned ? 0 : entry.rp,
        priorityScore:
          !isOwned &&
          entry.rankIndex < targetRankIndex &&
          priorityColumnSet.has(entry.columnIndex)
            ? 1
            : 0,
        mask: 1n << BigInt(entryIndex.get(id)),
      });

      for (const childId of children.get(id) || []) {
        selectedStates = mergeStates(selectedStates, solveSubtree(childId));
      }

      if (!hasForcedSubtree(id)) {
        addState(selectedStates, {
          counts: zeroCounts(),
          rp: 0,
          priorityScore: 0,
          mask: 0n,
        });
      }

      subtreeCache.set(id, selectedStates);
      return selectedStates;
    };

    let states = new Map();
    const premiumBaseCounts = capCounts(premiumCounts);
    addState(states, {
      counts: premiumBaseCounts,
      rp: 0,
      priorityScore: 0,
      mask: 0n,
    });

    for (const rootId of roots) {
      states = mergeStates(states, solveSubtree(rootId));
    }

    const requiredKey = countsKey(requirements);
    const best = states.get(requiredKey);
    if (!best) {
      return {
        ok: false,
        selectedIds: researchIdsOf(initialSelected),
        premiumIds: [...premiumIds],
        totalRp: costOf(initialSelected).rp,
        totalSp: costOf(initialSelected).sp,
        rankCounts: initialCounts,
        warnings: [
          ...warnings,
          "No valid route satisfies rank requirements and dependencies.",
        ],
        graph,
        mode: searchMode,
        priorityScore: 0,
        searchComplete: true,
        ownedIds: [...ownedIds],
      };
    }

    const selectedIds = entries
      .filter((entry, index) => (best.mask & (1n << BigInt(index))) !== 0n)
      .map((entry) => entry.id);
    const selectedSet = new Set(selectedIds);
    const finalCounts = countRanks(selectedSet);
    const finalCost = costOf(selectedSet);

    return {
      ok: true,
      selectedIds: researchIdsOf(selectedSet),
      premiumIds: [...premiumIds],
      totalRp: best.rp,
      totalSp: finalCost.sp,
      rankCounts: finalCounts,
      warnings,
      graph,
      mode: searchMode,
      priorityScore: best.priorityScore,
      searchComplete: true,
      ownedIds: [...ownedIds],
    };
  };

  if (priorityColumns.length > 0 && normalizedPriorityMode === "soft") {
    return solveExactMinimumRoute();
  }

  if (priorityColumns.length > 0 && normalizedPriorityMode === "hard") {
    let priorityResult = null;
    let limitReached = false;
    const visited = new Set();

    const searchByPriority = (selectedIds, counts) => {
      if (iterations >= maxIterations) {
        limitReached = true;
        return false;
      }
      iterations++;

      const rankIndex = firstOpenRank(counts);

      if (rankIndex === -1) {
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

      const key = makeKey(selectedIds, rankIndex);
      if (visited.has(key)) return false;
      visited.add(key);

      const candidates = [...graph.research.values()]
        .filter((candidate) => candidate.rankIndex < targetRankIndex)
        .filter((candidate) => !selectedIds.has(candidate.id))
        .filter((candidate) => !isIgnoredMultipleFiller(candidate))
        .map((candidate) => {
          const packageIds = getClosure(candidate.id).filter(
            (id) => !selectedIds.has(id),
          );
          const packageRp = rpOfIds(packageIds);
          const packageCounts = countRanks(
            new Set([...selectedIds, ...packageIds]),
          );
          const addedInRank = packageCounts[rankIndex] - counts[rankIndex];

          return {
            candidate,
            packageIds,
            packageRp,
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
          }

          if (hasFold) {
            if (a.packageRp !== b.packageRp) return a.packageRp - b.packageRp;
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
        if (addedInRank <= 0) continue;
        if (searchByPriority(nextSelected, nextCounts)) return true;
      }

      return false;
    };

    searchByPriority(initialSelected, initialCounts);

    if (!priorityResult) {
      return {
        ok: false,
        selectedIds: researchIdsOf(initialSelected),
        premiumIds: [...premiumIds],
        totalRp: costOf(initialSelected).rp,
        totalSp: costOf(initialSelected).sp,
        rankCounts: initialCounts,
        warnings: [
          ...warnings,
          limitReached
            ? "Priority route search reached the iteration limit before finding a valid route."
            : "No valid priority route satisfies rank requirements and dependencies.",
        ],
        graph,
        mode: searchMode,
        searchComplete: !limitReached,
        ownedIds: [...ownedIds],
      };
    }

    return {
      ok: true,
      selectedIds: researchIdsOf(priorityResult.selectedIds),
      premiumIds: [...premiumIds],
      totalRp: priorityResult.totalRp,
      totalSp: priorityResult.totalSp,
      rankCounts: priorityResult.rankCounts,
      warnings: [
        ...warnings,
        ...(limitReached
          ? [
              "Priority route search reached the iteration limit; the returned route is valid but may not be optimal.",
            ]
          : []),
      ],
      graph,
      mode: searchMode,
      priorityScore: priorityResult.priorityScore,
      searchComplete: !limitReached,
      ownedIds: [...ownedIds],
    };
  }

  return solveExactMinimumRoute();
}

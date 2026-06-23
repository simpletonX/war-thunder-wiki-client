import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { unlock_quantitys } from "../src/utils/dict.js";
import { planShortestResearchPath } from "../src/utils/researchPathPlanner.js";
import { terminal_vehicles } from "../src/utils/terminal_vehicles.js";

const countries = [
  "usa",
  "germany",
  "ussr",
  "britain",
  "japan",
  "china",
  "italy",
  "france",
  "sweden",
  "israel",
];

const vehicleTypes = ["ground", "aviation"];

function loadTree(countryCode, vehicleType) {
  return JSON.parse(
    readFileSync(
      new URL(
        `../public/database/${countryCode}/${countryCode}_${vehicleType}.json`,
        import.meta.url,
      ),
      "utf8",
    ),
  );
}

function lastChild(item) {
  return item?.type === "multiple" ? item.items?.at(-1) : item;
}

function findRepresentativeTarget(treeData) {
  for (let rankIndex = treeData.length - 1; rankIndex >= 0; rankIndex--) {
    for (const column of treeData[rankIndex].researchable_vehicles || []) {
      const item = lastChild(column?.at(-1));
      if (item?.data_unit_id) return item.data_unit_id;
    }
  }

  throw new Error("No researchable target found.");
}

function findTopRankTargets(treeData) {
  for (let rankIndex = treeData.length - 1; rankIndex >= 0; rankIndex--) {
    const targets = (treeData[rankIndex].researchable_vehicles || [])
      .map((column) => lastChild(column?.at(-1)))
      .filter((item) => item?.data_unit_id)
      .map((item) => item.data_unit_id);
    if (targets.length) return [...new Set(targets)];
  }
  return [];
}

function findPremiumBelowTarget(treeData, targetRankIndex) {
  for (
    let rankIndex = Math.min(targetRankIndex - 1, treeData.length - 1);
    rankIndex >= 0;
    rankIndex--
  ) {
    for (const column of treeData[rankIndex].premium_vehicles || []) {
      const item = lastChild(column?.[0]);
      if (item?.data_unit_id) return item.data_unit_id;
    }
  }

  return null;
}

function assertValidPlan(plan, treeData, targetId, unlockQuantityMap) {
  assert.equal(plan.ok, true, plan.warnings.join("\n"));

  const selected = new Set(plan.selectedIds);
  const available = new Set([...selected, ...(plan.ownedIds || [])]);
  assert.equal(selected.has(targetId), true, "target must be selected");

  for (const id of selected) {
    assert.equal(plan.graph.research.has(id), true, `unknown selected id: ${id}`);
    for (const dependencyId of plan.graph.deps.get(id) || []) {
      assert.equal(
        available.has(dependencyId),
        true,
        `${id} is missing dependency ${dependencyId}`,
      );
    }
  }

  const targetRankIndex = plan.graph.research.get(targetId).rankIndex;
  for (let rankIndex = 0; rankIndex < targetRankIndex; rankIndex++) {
    const required = unlockQuantityMap[treeData[rankIndex].rank] || 0;
    assert.ok(
      plan.rankCounts[rankIndex] >= required,
      `${treeData[rankIndex].rank}: ${plan.rankCounts[rankIndex]} < ${required}`,
    );
  }

  const totals = plan.selectedIds.reduce(
    (sum, id) => {
      const entry = plan.graph.research.get(id);
      sum.rp += entry.rp;
      sum.sp += entry.sp;
      return sum;
    },
    { rp: 0, sp: 0 },
  );
  assert.equal(plan.totalRp, totals.rp);
  assert.equal(plan.totalSp, totals.sp);
}

for (const countryCode of countries) {
  for (const vehicleType of vehicleTypes) {
    test(`${countryCode} ${vehicleType}: plans a valid route to a top-rank vehicle`, () => {
      const treeData = loadTree(countryCode, vehicleType);
      const targetId = findRepresentativeTarget(treeData);
      const unlockQuantityMap = unlock_quantitys[countryCode][vehicleType];
      const plan = planShortestResearchPath({
        treeData,
        targetIds: [targetId],
        unlockQuantityMap,
        terminalVehicles: terminal_vehicles,
        countryCode,
        vehicleType,
      });

      assertValidPlan(plan, treeData, targetId, unlockQuantityMap);

      const targetColumn = plan.graph.research.get(targetId).columnIndex;
      const targetRankIndex = plan.graph.research.get(targetId).rankIndex;
      const plannedPremiumId = findPremiumBelowTarget(
        treeData,
        targetRankIndex,
      );
      const maxColumns = Math.max(
        ...treeData.map(
          (rank) => rank.researchable_vehicles?.length || 0,
        ),
      );
      const priorityColumn = Array.from(
        { length: maxColumns },
        (_, index) => index,
      ).find((index) => index !== targetColumn);

      if (priorityColumn != null) {
        for (const priorityMode of ["soft", "hard"]) {
          const priorityPlan = planShortestResearchPath({
            treeData,
            targetIds: [targetId],
            plannedPremiumIds: plannedPremiumId
              ? [plannedPremiumId]
              : [],
            unlockQuantityMap,
            terminalVehicles: terminal_vehicles,
            countryCode,
            vehicleType,
            priorityColumns: [priorityColumn],
            priorityMode,
            maxIterations: 2_000,
          });

          assertValidPlan(
            priorityPlan,
            treeData,
            targetId,
            unlockQuantityMap,
          );
          assert.equal(priorityPlan.mode, `priority-${priorityMode}`);
          if (plannedPremiumId) {
            assert.equal(
              priorityPlan.premiumIds.includes(plannedPremiumId),
              true,
            );
          }
        }

        const ownedResearchId = plan.selectedIds.find((id) => {
          const entry = plan.graph.research.get(id);
          return entry && entry.rankIndex > 0 && id !== targetId;
        });
        const multiTargets = findTopRankTargets(treeData).slice(0, 2);

        if (ownedResearchId && multiTargets.length > 1) {
          const ownedPlan = planShortestResearchPath({
            treeData,
            targetIds: multiTargets,
            ownedResearchIds: [ownedResearchId],
            plannedPremiumIds: plannedPremiumId
              ? [plannedPremiumId]
              : [],
            unlockQuantityMap,
            terminalVehicles: terminal_vehicles,
            countryCode,
            vehicleType,
            priorityColumns: [priorityColumn],
            priorityMode: "soft",
          });

          assertValidPlan(
            ownedPlan,
            treeData,
            multiTargets[0],
            unlockQuantityMap,
          );
          assert.equal(ownedPlan.selectedIds.includes(ownedResearchId), false);
        }
      }
    });
  }
}

test("rank unlock quantities are minimums, not exact counts", () => {
  const treeData = [
    {
      rank: "I",
      researchable_vehicles: [
        [
          { type: "single", data_unit_id: "a", rp: 10, sp: 1 },
          { type: "single", data_unit_id: "b", rp: 20, sp: 2 },
        ],
      ],
      premium_vehicles: [],
    },
    {
      rank: "II",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "target", rp: 30, sp: 3 }],
      ],
      premium_vehicles: [],
    },
  ];

  const plan = planShortestResearchPath({
    treeData,
    targetIds: ["target"],
    unlockQuantityMap: { I: 1, II: 0 },
    terminalVehicles: {},
    countryCode: "test",
    vehicleType: "ground",
  });

  assert.equal(plan.ok, true);
  assert.deepEqual(plan.selectedIds, ["a", "b", "target"]);
  assert.equal(plan.rankCounts[0], 2);
});

test("rejects a request without a valid research target", () => {
  const plan = planShortestResearchPath({
    treeData: [],
    targetIds: ["missing"],
  });

  assert.equal(plan.ok, false);
  assert.equal(plan.searchComplete, true);
  assert.match(plan.warnings.at(-1), /No valid research target/);
});

test("owned researchable vehicles cut dependencies and are excluded from output", () => {
  const treeData = [
    {
      rank: "I",
      researchable_vehicles: [
        [
          { type: "single", data_unit_id: "a", rp: 10, sp: 1 },
          { type: "single", data_unit_id: "b", rp: 20, sp: 2 },
        ],
      ],
      premium_vehicles: [],
    },
    {
      rank: "II",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "target", rp: 30, sp: 3 }],
      ],
      premium_vehicles: [],
    },
  ];

  const plan = planShortestResearchPath({
    treeData,
    targetIds: ["target"],
    ownedResearchIds: ["b"],
    unlockQuantityMap: { I: 1, II: 0 },
    terminalVehicles: {},
    countryCode: "test",
    vehicleType: "ground",
  });

  assert.equal(plan.ok, true);
  assert.deepEqual(plan.selectedIds, ["target"]);
  assert.deepEqual(plan.ownedIds, ["b"]);
  assert.equal(plan.rankCounts[0], 1);
  assert.equal(plan.totalRp, 30);
  assert.equal(plan.totalSp, 3);
});

test("china aviation soft priority does not extend an already unlocked rank", () => {
  const treeData = loadTree("china", "aviation");
  const plan = planShortestResearchPath({
    treeData,
    targetIds: ["j_15t"],
    plannedPremiumIds: ["jh_7a_prototype"],
    priorityColumns: [1],
    priorityMode: "soft",
    unlockQuantityMap: unlock_quantitys.china.aviation,
    terminalVehicles: terminal_vehicles,
    countryCode: "china",
    vehicleType: "aviation",
  });

  assertValidPlan(
    plan,
    treeData,
    "j_15t",
    unlock_quantitys.china.aviation,
  );

  const rankEightIndex = treeData.findIndex((rank) => rank.rank === "VIII");
  assert.equal(plan.rankCounts[rankEightIndex], 3);
  assert.equal(plan.selectedIds.includes("j_8f"), false);
  assert.equal(plan.selectedIds.includes("j_10a"), false);
  assert.equal(plan.premiumIds.includes("jh_7a_prototype"), true);
});

test("china ground soft planning matches the exact minimum-RP result", () => {
  const treeData = loadTree("china", "ground");
  const params = {
    treeData,
    targetIds: ["cn_m1a2t", "cn_zbd_04a"],
    ownedResearchIds: ["cn_zts_63_1980"],
    plannedPremiumIds: ["cn_ztz_96b", "cn_wma_301"],
    unlockQuantityMap: unlock_quantitys.china.ground,
    terminalVehicles: terminal_vehicles,
    countryCode: "china",
    vehicleType: "ground",
  };
  const plan = planShortestResearchPath({
    ...params,
    priorityColumns: [1],
    priorityMode: "soft",
  });
  const unprioritizedPlan = planShortestResearchPath(params);

  assert.equal(plan.ok, true, plan.warnings.join("\n"));
  assert.equal(plan.searchComplete, true);
  assert.equal(plan.totalRp, unprioritizedPlan.totalRp);
  assert.equal(plan.selectedIds.includes("cn_zts_63_1980"), false);
  assert.equal(plan.rankCounts[4], 5);
});

test("exact minimum-RP search matches exhaustive enumeration", () => {
  const treeData = [
    {
      rank: "I",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "a1", rp: 8, sp: 8 }],
        [{ type: "single", data_unit_id: "b1", rp: 3, sp: 5 }],
        [{ type: "single", data_unit_id: "c1", rp: 4, sp: 2 }],
      ],
      premium_vehicles: [],
    },
    {
      rank: "II",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "a2", rp: 9, sp: 9 }],
        [{ type: "single", data_unit_id: "b2", rp: 7, sp: 3 }],
        [{ type: "single", data_unit_id: "c2", rp: 4, sp: 6 }],
      ],
      premium_vehicles: [],
    },
    {
      rank: "III",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "target", rp: 20, sp: 10 }],
        [{ type: "single", data_unit_id: "b3", rp: 2, sp: 2 }],
        [{ type: "single", data_unit_id: "c3", rp: 2, sp: 2 }],
      ],
      premium_vehicles: [],
    },
  ];
  const requirements = { I: 2, II: 2, III: 0 };
  const plan = planShortestResearchPath({
    treeData,
    targetIds: ["target"],
    priorityColumns: [2],
    priorityMode: "soft",
    unlockQuantityMap: requirements,
    terminalVehicles: {},
    countryCode: "test",
    vehicleType: "ground",
    // 精确模式不能因为旧的迭代参数过小而返回未经证明的结果。
    maxIterations: 1,
  });

  const entries = [...plan.graph.research.values()];
  let exhaustiveBest = null;
  for (let mask = 0; mask < 1 << entries.length; mask++) {
    const selected = new Set(
      entries
        .filter((_, index) => mask & (1 << index))
        .map((entry) => entry.id),
    );
    if (!selected.has("target")) continue;

    const dependenciesSatisfied = [...selected].every((id) =>
      (plan.graph.deps.get(id) || []).every((depId) => selected.has(depId)),
    );
    if (!dependenciesSatisfied) continue;

    const counts = new Array(treeData.length).fill(0);
    let rp = 0;
    let priorityScore = 0;
    for (const id of selected) {
      const entry = plan.graph.research.get(id);
      counts[entry.rankIndex]++;
      rp += entry.rp;
      if (entry.rankIndex < 2 && entry.columnIndex === 2) priorityScore++;
    }
    if (counts[0] < requirements.I || counts[1] < requirements.II) continue;

    const candidate = { rp, priorityScore };
    if (
      !exhaustiveBest ||
      candidate.rp < exhaustiveBest.rp ||
      (candidate.rp === exhaustiveBest.rp &&
        candidate.priorityScore > exhaustiveBest.priorityScore)
    ) {
      exhaustiveBest = candidate;
    }
  }

  assert.equal(plan.ok, true);
  assert.equal(plan.searchComplete, true);
  assert.deepEqual(
    {
      rp: plan.totalRp,
      priorityScore: plan.priorityScore,
    },
    exhaustiveBest,
  );
  assert.equal(
    plan.warnings.some((warning) => /iteration limit/i.test(warning)),
    false,
  );
});

test("soft priority ignores SP when minimum-RP routes are tied", () => {
  const treeData = [
    {
      rank: "I",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "required", rp: 10, sp: 10 }],
        [{ type: "single", data_unit_id: "low_sp", rp: 5, sp: 1 }],
        [{ type: "single", data_unit_id: "preferred", rp: 5, sp: 999 }],
      ],
      premium_vehicles: [],
    },
    {
      rank: "II",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "target", rp: 20, sp: 20 }],
        [],
        [],
      ],
      premium_vehicles: [],
    },
  ];

  const plan = planShortestResearchPath({
    treeData,
    targetIds: ["target"],
    priorityColumns: [2],
    priorityMode: "soft",
    unlockQuantityMap: { I: 2, II: 0 },
    terminalVehicles: {},
    countryCode: "test",
    vehicleType: "ground",
  });

  assert.equal(plan.ok, true);
  assert.equal(plan.totalRp, 35);
  assert.equal(plan.selectedIds.includes("preferred"), true);
  assert.equal(plan.selectedIds.includes("low_sp"), false);
  assert.equal(plan.totalSp, 1029);
});

test("ignore multiple uses only the first folded vehicle as a filler", () => {
  const treeData = [
    {
      rank: "I",
      researchable_vehicles: [
        [
          {
            type: "multiple",
            data_unit_id: "a1",
            items: [
              { type: "single", data_unit_id: "a1", rp: 10, sp: 10 },
              { type: "single", data_unit_id: "a1_extra", rp: 1, sp: 1 },
            ],
          },
        ],
        [{ type: "single", data_unit_id: "b1", rp: 5, sp: 5 }],
      ],
      premium_vehicles: [],
    },
    {
      rank: "II",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "target", rp: 20, sp: 20 }],
        [],
      ],
      premium_vehicles: [],
    },
  ];
  const params = {
    treeData,
    targetIds: ["target"],
    unlockQuantityMap: { I: 2, II: 0 },
    terminalVehicles: {},
    countryCode: "test",
    vehicleType: "ground",
  };

  const normalPlan = planShortestResearchPath(params);
  const ignoredPlan = planShortestResearchPath({
    ...params,
    ignoreMultiple: true,
  });
  const ignoredHardPlan = planShortestResearchPath({
    ...params,
    priorityColumns: [1],
    priorityMode: "hard",
    ignoreMultiple: true,
  });

  assert.equal(normalPlan.selectedIds.includes("a1_extra"), true);
  assert.equal(normalPlan.selectedIds.includes("b1"), false);
  assert.equal(ignoredPlan.selectedIds.includes("a1_extra"), false);
  assert.equal(ignoredPlan.selectedIds.includes("b1"), true);
  assert.equal(ignoredPlan.searchComplete, true);
  assert.equal(ignoredHardPlan.selectedIds.includes("a1_extra"), false);
  assert.equal(ignoredHardPlan.selectedIds.includes("b1"), true);
});

test("ignore multiple keeps every initial Rank-I zero-RP folded vehicle", () => {
  const treeData = [
    {
      rank: "I",
      researchable_vehicles: [
        [
          {
            type: "multiple",
            data_unit_id: "free1",
            items: [
              { type: "single", data_unit_id: "free1", rp: 0, sp: 0 },
              { type: "single", data_unit_id: "free2", rp: 0, sp: 0 },
            ],
          },
        ],
      ],
      premium_vehicles: [],
    },
    {
      rank: "II",
      researchable_vehicles: [
        [{ type: "single", data_unit_id: "target", rp: 20, sp: 20 }],
      ],
      premium_vehicles: [],
    },
  ];

  const plan = planShortestResearchPath({
    treeData,
    targetIds: ["target"],
    ignoreMultiple: true,
    unlockQuantityMap: { I: 1, II: 0 },
    terminalVehicles: {},
    countryCode: "test",
    vehicleType: "ground",
  });

  assert.equal(plan.ok, true);
  assert.equal(plan.selectedIds.includes("free1"), true);
  assert.equal(plan.selectedIds.includes("free2"), true);
  assert.equal(plan.rankCounts[0], 2);
});

test("large ground and aviation matrix has valid and irreducible soft routes", () => {
  let scenarioCount = 0;

  for (const countryCode of countries) {
    for (const vehicleType of vehicleTypes) {
      const treeData = loadTree(countryCode, vehicleType);
      const unlockQuantityMap = unlock_quantitys[countryCode][vehicleType];
      const topTargets = findTopRankTargets(treeData);
      if (!topTargets.length) continue;

      const baseline = planShortestResearchPath({
        treeData,
        targetIds: [topTargets[0]],
        unlockQuantityMap,
        terminalVehicles: terminal_vehicles,
        countryCode,
        vehicleType,
      });
      assert.equal(baseline.ok, true, `${countryCode} ${vehicleType}`);

      const targetRankIndex = baseline.graph.research.get(
        topTargets[0],
      ).rankIndex;
      const ownedResearchIds = baseline.selectedIds.filter((id) => {
        const entry = baseline.graph.research.get(id);
        return entry && entry.rankIndex <= Math.floor(targetRankIndex / 2);
      });
      const plannedPremiumId = findPremiumBelowTarget(
        treeData,
        targetRankIndex,
      );
      const maxColumns = Math.max(
        ...treeData.map(
          (rank) => rank.researchable_vehicles?.length || 0,
        ),
      );
      const targetSets = topTargets.map((id) => [id]);
      if (topTargets.length > 1) {
        targetSets.push([topTargets[0], topTargets.at(-1)]);
      }

      for (const targetIds of targetSets) {
        const targetColumns = new Set(
          targetIds.map(
            (id) => baseline.graph.research.get(id).columnIndex,
          ),
        );
        const priorityColumns = Array.from(
          { length: maxColumns },
          (_, index) => index,
        )
          .filter((index) => !targetColumns.has(index))
          .slice(0, 2);

        for (const priorityColumn of priorityColumns) {
          const plan = planShortestResearchPath({
            treeData,
            targetIds,
            ownedResearchIds,
            plannedPremiumIds: plannedPremiumId
              ? [plannedPremiumId]
              : [],
            priorityColumns: [priorityColumn],
            priorityMode: "soft",
            unlockQuantityMap,
            terminalVehicles: terminal_vehicles,
            countryCode,
            vehicleType,
          });
          const label = `${countryCode} ${vehicleType} targets=${targetIds.join(",")} priority=${priorityColumn}`;

          assertValidPlan(
            plan,
            treeData,
            targetIds[0],
            unlockQuantityMap,
          );
          assert.equal(plan.mode, "priority-soft", label);
          for (const ownedId of ownedResearchIds) {
            assert.equal(plan.selectedIds.includes(ownedId), false, label);
          }

          const selected = new Set(plan.selectedIds);
          const protectedIds = new Set([
            ...targetIds,
            ...ownedResearchIds,
            ...[...plan.graph.research.values()]
              .filter((entry) => entry.rankIndex === 0 && entry.rp === 0)
              .map((entry) => entry.id),
          ]);
          const requiredAsDependency = new Set();
          for (const id of selected) {
            for (const dependencyId of plan.graph.deps.get(id) || []) {
              if (selected.has(dependencyId)) {
                requiredAsDependency.add(dependencyId);
              }
            }
          }

          for (const id of selected) {
            const entry = plan.graph.research.get(id);
            if (
              !protectedIds.has(id) &&
              !requiredAsDependency.has(id)
            ) {
              const required =
                unlockQuantityMap[treeData[entry.rankIndex].rank] || 0;
              assert.ok(
                plan.rankCounts[entry.rankIndex] <= required,
                `${label}: redundant ${id} remains in rank ${entry.rank}`,
              );
            }
          }

          scenarioCount++;
        }
      }
    }
  }

  assert.ok(scenarioCount >= 100, `only ran ${scenarioCount} scenarios`);
});

import { planShortestResearchPath } from "@/utils/researchPathPlanner";

function serializePlan(plan) {
  return {
    ok: plan.ok,
    selectedIds: plan.selectedIds || [],
    premiumIds: plan.premiumIds || [],
    totalRp: plan.totalRp || 0,
    totalSp: plan.totalSp || 0,
    rankCounts: plan.rankCounts || [],
    warnings: plan.warnings || [],
    mode: plan.mode,
    priorityScore: plan.priorityScore || 0,
  };
}

self.onmessage = (event) => {
  const { requestId, payload } = event.data || {};

  try {
    const plan = planShortestResearchPath(payload);
    self.postMessage({
      requestId,
      ok: true,
      result: serializePlan(plan),
    });
  } catch (error) {
    self.postMessage({
      requestId,
      ok: false,
      error: error?.message || String(error),
    });
  }
};

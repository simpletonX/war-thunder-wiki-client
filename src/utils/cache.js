/** 处理tree_data的本地化 */
import { getUnitDetails } from "@/api/tree_data";
import { useTreeDataStore } from "@/stores/tree_data";
import { usePublicMessageDialogStore } from "@/stores/public_message_dialog";
import { country_code, vehicle_type } from "./dict";

let current_task_id = null;
let current_controllers = [];
let sleep_time = 300;
let concurrency = 4; // 并发请求数，可自行配置

/** 中断函数：当用户切换国家或军种时调用 */
export function abort_batch_request() {
  console.warn("🛑 正在中断当前请求...");
  current_task_id = null;
  for (const controller of current_controllers) {
    controller.abort();
  }
  current_controllers = [];
}

/** 延迟函数（支持中断） */
function sleep(ms, task_id) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      if (task_id !== current_task_id) {
        reject(new Error("❌ sleep期间任务已被废弃"));
        return;
      }
      if (Date.now() - start >= ms) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    }
    requestAnimationFrame(check);
  });
}

/** multiple 类型 item 的BR拼接计算 */
function calculate_group_br(items) {
  const valid_brs = items.map((i) => parseFloat(i.br)).filter((n) => !isNaN(n));
  if (valid_brs.length === 0) return "";
  const min = Math.min(...valid_brs);
  const max = Math.max(...valid_brs);
  return min === max ? min.toFixed(1) : `${min.toFixed(1)}-${max.toFixed(1)}`;
}

/** 主函数：并发请求载具详情（带中断 + 间隔 + 缓存 + 防竞态） */
export async function batch_request_details(tree_data, t_c, type) {
  const store = useTreeDataStore();
  const instantCaching = store.instantCaching;

  const task_id = Symbol(`batch-${t_c}-${type}`);
  current_task_id = task_id;

  // 深拷贝避免污染原数据
  const local_tree_data = JSON.parse(JSON.stringify(tree_data));

  const messageStore = usePublicMessageDialogStore();
  messageStore.show(`🚀 开始批量请求载具详情 (${t_c}-${type})...`, 2000);

  try {
    /** ========= 收集所有需要请求的 single item ========= */
    const all_singles = [];
    const all_groups = []; // 记录 multiple 类型节点，稍后更新details状态和br

    for (const rank of local_tree_data) {
      for (const column of [
        ...rank.researchable_vehicles,
        ...rank.premium_vehicles,
      ]) {
        for (const item of column) {
          if (item.type === "multiple") {
            all_groups.push(item);
            for (const sub of item.items) {
              all_singles.push({
                parent: item,
                ref: sub,
              });
            }
          } else if (item.type === "single") {
            all_singles.push({ parent: null, ref: item });
          }
        }
      }
    }

    /** ========= 并发请求逻辑 ========= */
    let index = 0;

    while (index < all_singles.length) {
      if (task_id !== current_task_id) throw new Error("❌ 任务已被废弃");

      const batch = all_singles.slice(index, index + concurrency);
      index += concurrency;

      const promises = batch.map(async ({ parent, ref }) => {
        if (task_id !== current_task_id) throw new Error("❌ 任务已被废弃");
        if (ref.details) return; // 已获取详情则跳过

        const controller = new AbortController();
        current_controllers.push(controller);

        try {
          const res = await getUnitDetails(ref.data_unit_id, {
            signal: controller.signal,
          });

          if (res?.success) {
            ref.br = res.data.br;
            ref.rp = res.data.rp;
            ref.sp = res.data.sp;
            ref.main_role = res.data.main_role;
            ref.details = true;

            // 更新父组状态
            if (parent) {
              const all_done = parent.items.every((s) => s.details === true);
              if (all_done) {
                parent.br = calculate_group_br(parent.items);
                parent.details = true;
              }
            }

            // ✅ 有效任务才缓存
            if (task_id === current_task_id) {
              instantCaching(local_tree_data, t_c, type);
            }
          }
        } catch (err) {
          if (err.name !== "AbortError")
            console.warn(`⚠️ 请求失败: ${ref.title || ref.data_unit_id}`, err);
        } finally {
          const i = current_controllers.indexOf(controller);
          if (i !== -1) current_controllers.splice(i, 1);
        }
      });

      await Promise.allSettled(promises);
      await sleep(sleep_time, task_id);
    }

    /** ========= 收尾检查：处理可能遗漏的group状态 ========= */
    for (const group of all_groups) {
      const all_done = group.items.every((s) => s.details === true);
      if (all_done) {
        group.br = calculate_group_br(group.items);
        group.details = true;
      }
    }

    if (task_id === current_task_id) {
      messageStore.show(`🎯 (${t_c}-${type}) 所有详情请求完成！`, 2000);
    }
  } catch (err) {
    if (
      err.name === "AbortError" ||
      err.message.includes("废弃") ||
      err.message.includes("中断")
    ) {
      console.warn(`🛑 (${t_c}-${type}) 批量请求被中断！`);
    } else {
      console.error("❌ 发生错误：", err);
    }
  } finally {
    if (task_id === current_task_id) {
      current_controllers = [];
      current_task_id = null;
    }
  }
}

/** 清除本地存储中所有的tree_data */
export function clearTreeDataCache() {
  for (let i = 0; i < country_code.length; i++) {
    for (let j = 0; j < vehicle_type.length; j++) {
      localStorage.removeItem(`${country_code[i]}_${vehicle_type[j]}`);
    }
  }
}
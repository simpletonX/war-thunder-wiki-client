import request from "@/utils/request";

/**
 * 获取科技树数据
 * @param {string} type - 军种类型 ("ground" | "aviation" | "helicopters")
 * @param {string} t_c - 国家代号 ("germany", "usa", "japan" 等)
 * @returns {Promise<Object>} 后端返回的数据对象
 */
export async function getTreeDataAPI(type, t_c) {
  try {
    const res = await request.get(`/${type}`, {
      params: { t_c },
    });
    return res;
  } catch (err) {
    console.error(`❌ 获取科技树失败: ${type} - ${t_c}`, err);
    throw err;
  }
}

/** 获取载具详情 */
export async function getUnitDetails(data_unit_id) {
  try {
    const res = await request.get(`/unit/${data_unit_id}`);
    return res;
  } catch (err) {
    console.error(`❌ 获取载具详情失败: ${type} - ${t_c}`, err);
    throw err;
  }
}

/** 清除jsdelivr cdn缓存 */
export async function clearJsdelivrCache(t_c, type) {
  try {
    const res =
      await request.get(`https://purge.jsdelivr.net/gh/simpletonX/war-thunder-treedata-api/database/${t_c}/${t_c}_${type}.json
    `);
    return res;
  } catch (err) {
    console.error(`刷新jsdelivr cdn缓存失败: ${t_c}_${type}.json`, err);
    throw err;
  }
}

/** 从远程仓库加载json数据 */
export async function getTreeDataJsdelivr({ country_code, vehicle_type }) {
  const url = `https://cdn.jsdelivr.net/gh/simpletonX/war-thunder-wiki-db@main/database/${country_code}/${country_code}_${vehicle_type}.json`;

  try {
    const res = await request.get(url);
    return res;
  } catch (err) {
    alert("科技树数据请求失败");
    throw err;
  }
}

/** 从本地 public/database 加载 json 数据 */
export async function getTreeDataLocal({ country_code, vehicle_type }) {
  const url = `/database/${country_code}/${country_code}_${vehicle_type}.json`;

  try {
    const res = await request.get(url);
    return res;
  } catch (err) {
    alert("科技树数据请求失败");
    throw err;
  }
}

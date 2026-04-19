/** 读取本地database目录下的json文件 */
export async function loadLocalJSON(t_c, type) {
  const url = `/database/${t_c.value}/${t_c.value}_${type.value}.json`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`加载本地资源失败: ${url}`);
  return await res.json();
}

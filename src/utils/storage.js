export function getStorage(key, defaultValue, transform = (value) => value) {
  const raw = localStorage.getItem(key);

  if (raw === null) {
    setStorage(key, defaultValue);
    return defaultValue;
  }

  try {
    // 优先尝试 JSON（对象 / 数组 / 数字 / boolean）
    const parsed = JSON.parse(raw);
    return transform(parsed);
  } catch {
    // 如果 JSON 解析失败，说明是纯字符串
    return transform(raw);
  }
}

export function setStorage(key, value) {
  if (typeof value === "object") {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }

  localStorage.setItem(key, String(value));
}

export function getStorage(key, defaultValue, transform = (value) => value) {
  const raw = localStorage.getItem(key);

  if (raw === null) {
    setStorage(key, defaultValue);
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(raw);
    return transform(parsed);
  } catch {
    return defaultValue;
  }
}

export function setStorage(key, value) {
  if (typeof value === "object") {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }

  localStorage.setItem(key, String(value));
}

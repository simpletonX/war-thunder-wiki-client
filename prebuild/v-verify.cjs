/**
 * 打包前更新 v-verify.json
 * 同时记录 build-log.json
 */

const fs = require("fs");
const path = require("path");

const verify_path = path.resolve(__dirname, "../public/v-verify.json");
const log_path = path.resolve(__dirname, "./build-log.json");

const version_timestamp = String(Date.now()); // ✅ 字符串
const pad = (n) => String(n).padStart(2, "0");

const now = new Date();
const update_date =
  [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join("-") +
  " " +
  [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(":");

const verify_data = {
  version_timestamp,
  update_date,
};

let build_log = [];

if (fs.existsSync(log_path)) {
  try {
    build_log = JSON.parse(fs.readFileSync(log_path, "utf-8"));
    if (!Array.isArray(build_log)) {
      build_log = [];
    }
  } catch {
    build_log = [];
  }
}

build_log.push({
  version_timestamp,
  update_date,
});

try {
  // 写 v-verify.json（覆盖）
  fs.writeFileSync(verify_path, JSON.stringify(verify_data, null, 2), "utf-8");

  // 写 build-log.json（累计）
  fs.writeFileSync(log_path, JSON.stringify(build_log, null, 2), "utf-8");

  console.log("[v-verify] updated:", verify_data);
  console.log("[build-log] appended:", build_log[build_log.length - 1]);
} catch (err) {
  console.error("[build] update failed:", err);
  process.exit(1);
}

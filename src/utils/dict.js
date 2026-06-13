// 军种类型
export const vehicle_type = [
  "ground",
  "aviation",
  "helicopters",
  "ships",
  "boats",
];
// 军种类型对应中文
export const vehicle_type_texts = {
  ground: "陆军",
  aviation: "空军",
  helicopters: "直升机",
  ships: "远洋海军",
  boats: "近岸海军",
};
// 国家代号
export const country_code = [
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
// 国家代号对应中文
export const country_code_texts = {
  usa: "美国",
  germany: "德国",
  ussr: "苏联",
  britain: "英国",
  japan: "日本",
  china: "中国",
  italy: "意大利",
  france: "法国",
  sweden: "瑞典",
  israel: "以色列",
};
// 载具类别
export const main_role = [
  "Fighter", // 战斗机
  "Strike aircraft", // 攻击机
  "Bomber", // 轰炸机

  "Attack helicopter", // 攻击直升机
  "Utility helicopter", // 通用直升机

  "Medium tank", // 中型坦克
  "Light tank", // 轻型坦克
  "Heavy tank", // 重型坦克
  "SPAA", // 自行防空炮
  "Tank destroyer", // 坦克歼击车

  "Battleship", // 战列舰
  "Heavy cruiser", // 重巡洋舰
  "Light cruiser", // 轻巡洋舰
  "Destroyer", // 驱逐舰
  "Battlecruiser", // 战列巡洋舰

  "Boat", // 鱼雷艇/炮艇/布雷艇...
  "Heavy boat", // 鱼雷炮艇/猎潜艇/装甲炮艇...
  "Barge", // 海军驳渡船/防空渡船...
  "Frigate", // 护卫舰...
];
// 等级解锁所需载具数量
export const unlock_quantitys = {
  usa: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {
      I: 3,
      II: 3,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 0,
    },
    boats: {
      I: 4,
      II: 4,
      III: 5,
      IV: 5,
      V: 0,
    },
  },
  germany: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {
      I: 4,
      II: 4,
      III: 4,
      IV: 4,
      V: 5,
      VI: 4,
      VII: 0,
    },
    boats: {
      I: 1,
      II: 4,
      III: 4,
      IV: 6,
      V: 0,
    },
  },
  ussr: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {
      I: 4,
      II: 4,
      III: 5,
      IV: 3,
      V: 4,
      VI: 3,
      VII: 0,
    },
    boats: {
      I: 4,
      II: 5,
      III: 5,
      IV: 6,
      V: 0,
    },
  },
  britain: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {
      I: 4,
      II: 5,
      III: 5,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 0,
    },
    boats: {
      I: 6,
      II: 4,
      III: 6,
      IV: 5,
      V: 0,
    },
  },
  japan: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 4,
      VI: 5,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {
      I: 3,
      II: 6,
      III: 5,
      IV: 4,
      V: 5,
      VI: 5,
      VII: 0,
    },
    boats: {
      I: 4,
      II: 5,
      III: 6,
      IV: 3,
      V: 0,
    },
  },
  china: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 5,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {},
    boats: {},
  },
  italy: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {
      I: 4,
      II: 4,
      III: 4,
      IV: 4,
      V: 5,
      VI: 2,
      VII: 0,
    },
    boats: {
      I: 3,
      II: 4,
      III: 3,
      IV: 4,
      V: 0,
    },
  },
  france: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {
      I: 4,
      II: 6,
      III: 4,
      IV: 4,
      V: 3,
      VI: 1,
      VII: 0,
    },
    boats: {
      I: 4,
      II: 3,
      III: 4,
      IV: 3,
      V: 0,
    },
  },
  sweden: {
    ground: {
      I: 6,
      II: 6,
      III: 6,
      IV: 6,
      V: 5,
      VI: 5,
      VII: 5,
      VIII: 0,
    },
    aviation: {
      I: 6,
      II: 6,
      III: 6,
      IV: 3,
      V: 5,
      VI: 4,
      VII: 5,
      VIII: 3,
      IX: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {},
    boats: {},
  },
  israel: {
    ground: {
      IV: 6,
      V: 5,
      VI: 5,
      VII: 4,
      VIII: 0,
    },
    aviation: {
      IV: 5,
      V: 3,
      VI: 5,
      VII: 4,
      VIII: 0,
    },
    helicopters: {
      V: 1,
      VI: 1,
      VII: 0,
    },
    ships: {},
    boats: {},
  },
};
// 壁纸预设值
export const preset_wallpapers = [
  {
    value: "default",
    url: `/static/wallpapers/default.mp4`,
    label: "[默认] reel-2023.mp4",
    type: "video",
  },
  {
    value: "hs_su_30sm",
    url: `/static/wallpapers/hs_su_30sm.jpg`,
    label: "hs_su_30sm.jpg",
    type: "image",
  },
  {
    value: "s_leopard2_a4m",
    url: `/static/wallpapers/s_leopard2_a4m.jpg`,
    label: "s_leopard2_a4m.jpg",
    type: "image",
  },
  { value: "0e1113", color: "#0e1113", label: "纯色 #0e1113", type: "color" },
  { value: "20303a", color: "#20303a", label: "纯色 #20303a", type: "color" },
  { value: "08382a", color: "#08382a", label: "纯色 #08382a", type: "color" },
];

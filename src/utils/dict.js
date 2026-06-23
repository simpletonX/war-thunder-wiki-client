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
    url: "https://staticfiles.warthunder.com/upload/image/media/bg/reel-2023.mp4",
    label: "reel-2023.mp4",
    type: "video",
  },
  {
    value: "victory_day_2026",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Other/1920x1080_victory_day_2026_logo_602e1a54af7fac44271a481f0fb798ea.jpg",
    label: "victory_day_2026",
    type: "image",
  },
  {
    value: "aircraft_marathon_sky_farmer",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Aircraft/1920x1080_aircraft_marathon_sky_farmer_logo_e62991d39285b1f56f480ee5e3e86001.jpg",
    label: "aircraft_marathon_sky_farmer",
    type: "image",
  },
  {
    value: "spitfire_lf_mk9c_cw_greece",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Aircraft/1920x1080_spitfire_lf_mk9c_cw_greece_logo_dc1ebf0983fbb16aa7b7fed086198fa8.jpg",
    label: "spitfire_lf_mk9c_cw_greece",
    type: "image",
  },
  {
    value: "ninth_wave",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/1920x1080_ninth_wave_logo_eng_1ec685a725112eee99ae28dc8e9fb71b.jpg",
    label: "ninth_wave",
    type: "image",
  },
  {
    value: "aircraft_marathon_workhorse",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Aircraft/1920x1080_aircraft_marathon_workhorse_logo_b7847b1ca7ad2c67625fd9559c71e6ce.jpg",
    label: "aircraft_marathon_workhorse",
    type: "image",
  },
  {
    value: "senrai_maidens_maria",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Other/1920x1080_senrai_maidens_maria_logo_a46deb0bcbc38d1ae17c34e0a0b1a3dd.jpg",
    label: "senrai_maidens_maria",
    type: "image",
  },
  {
    value: "senrai_maidens_kate",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Other/1920x1080_senrai_maidens_kate_logo_04ae1ba410bdb1f221138d96a3738477.jpg",
    label: "senrai_maidens_kate",
    type: "image",
  },
  {
    value: "senrai_maidens_elsa",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Other/_thumbs/999x562/1920x1080_senrai_maidens_elsa_logo_c656f3e8945d6caf4e54fe5985c3235b_999x562_e9ab4cba5d4642573af3091327f7eb7e.jpg",
    label: "senrai_maidens_elsa",
    type: "image",
  },
  {
    value: "vlt2",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Navy/1920x1080_vlt2_logo_ec12209225b48b0aab11e98b49e71a4c.jpg",
    label: "vlt2",
    type: "image",
  },
  {
    value: "uk_shir_2",
    url: "https://staticfiles.warthunder.com/upload/image/0_Wallpaper_Renders/Ground_Forces/1920x1080_uk_shir_2_logo_f42fd17c7917d9eab0127ee643798d4c.jpg",
    label: "uk_shir_2",
    type: "image",
  },
  { value: "0e1113", color: "#0e1113", label: "纯色 #0e1113", type: "color" },
  { value: "20303a", color: "#20303a", label: "纯色 #20303a", type: "color" },
  { value: "24212C", color: "#24212C", label: "纯色 #24212C", type: "color" },
  { value: "1A312C", color: "#1A312C", label: "纯色 #1A312C", type: "color" },
  { value: "273338", color: "#273338", label: "纯色 #273338", type: "color" },
  { value: "750E21", color: "#750E21", label: "纯色 #750E21", type: "color" },
];

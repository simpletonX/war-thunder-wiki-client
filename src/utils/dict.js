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

// ground/aviation/ships/boats指向箭头无向下联动的item
// helicopters指向箭头联动规则元数据
export const terminal_vehicles = {
  usa: {
    ground: {
      us_m3a1_stuart: true,
      us_m2_medium: true,
      us_m22_locust: true,
      us_halftrack_m15: true,
      us_halftrack_m3_75mm_gmc: true,
    },
    aviation: {
      "p-26_group": true,
      "p-36c": true,
      "f2a-1": true,
      os2u_group: true,
      tbf_group: true,
      pbm_1: true,
    },
    helicopters: {
      ah_1g: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      uh_1b: {
        cross_level: 1,
        placeholder_item: 0,
        has_next_left_item: true,
        has_right_item: true,
      },
      uh_1c: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
        move_bottom: 1,
      },
      ah_1f: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
        has_next_left_item: true,
      },
      ah_6m: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      oh_58d: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
      },
      ah_64a: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
        move_bottom: 1,
      },
      ah_1w: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
      },
      ah_64d: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
    },
    ships: {},
    boats: {},
  },
  germany: {
    ground: {
      germ_garford_putilov: true,
      germ_pzkpfw_38t_group: true,
      germ_beutepanzer_mk_iv: true,
      germ_pzkpfw_iii_ausf_j_l42: true,
      germ_a7v: true,
      germ_pzkpfw_4_early_group: true,
      germ_sdkfz_6_2_flak36: true,
      germ_marder_stug_a_group: true,
    },
    aviation: {
      "bf-109c_1": true,
      he_100d_1: true,
      do_217j_group: true,
      "ju-87g_group": true,
      "he-111h-2": true,
    },
    helicopters: {
      sa_313b: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
        has_next_left_item: true,
      },
      uh_1d: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
        move_bottom: 1,
      },
      mi_8tb: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
      },
      mi_24p_german: {
        move_bottom: 1,
      },
      bo_105pah1: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      bo_105pah1_a1: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      }
    },
    ships: {},
    boats: {
      germ_ls_class: true,
    },
  },
  ussr: {
    ground: {
      ussr_bt_7_m: true,
      ussr_t_28: true,
      ussr_t_70_1942: true,
      ussr_garford_putilov: true,
      ussr_su_76m_1943: true,
      ussr_gaz_dshk: true,
    },
    aviation: {
      "i-16_group": true,
      "i-153_group": true,
      "po-2": true,
      yak_2_kabb: true,
      ar_group: true,
    },
    helicopters: {
      mi_4av: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
        has_next_left_item: true,
      },
      mi_8tv: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
        move_bottom: 1,
      },
      mi_24a: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      mi_24v: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      mi_24p: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
        has_next_right_item: true,
      },
      mi_8amtsh: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
        move_bottom: 1,
      },
      mi_35m: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      ka_29: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
        move_bottom: 2,
      },
      mi_28n: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
    },
    ships: {},
    boats: {
      ussr_g5_mtb: true,
    },
  },
  britain: {
    ground: {
      uk_a_13_mk2: true,
      uk_m3a1_stuart: true,
      uk_daimler_mk_2: true,
      uk_t17e2: true,
      uk_mark_v: true,
      uk_sarc_mk4_a: true,
    },
    aviation: {
      fury_group: true,
      gladiator_mk2_france: true,
      gladiator_mk2_silver: true,
      gladiator_mk2: true,
      gladiator_mk2_navy: true,
      blenheim_group: true,
      hp_12: true,
      hampden_group: true,
    },
    helicopters: {
      scout_ah_mk1: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      wasp_has_mk1: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      wessex_mk5: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      lynx_ah_mk1: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 2,
      },
      ah_mk1: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
    },
    ships: {
      uk_destroyer_clemson_churchill: true,
    },
    boats: {
      uk_mtb_1series: true,
    },
  },
  japan: {
    ground: {
      jp_type_95_ha_go: true,
      jp_type_2_ka_mi: true,
      jp_type_2_ho_i: true,
      jp_hiro_sha: true,
      jp_type_98_ta_se: true,
    },
    aviation: {
      a5m4: true,
      "ki-43_group": true,
      ki_109: true,
      b6n1: true,
      h6k4: true,
    },
    helicopters: {
      uh_1b_japan: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      ah_1s_early: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
        has_next_right_item: true,
      },
      mi_35p_indonesia: {
        move_bottom: 1,
      },
      ah_1s_late: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      ah_64d_japan: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
    },
    ships: {},
    boats: {
      jp_t14_class: true,
    },
  },
  china: {
    ground: {
      cn_m8_greyhound: true,
      cn_type_97_chi_ha: true,
      cn_sdkfz_222_early: true,
      cn_su_76m_1943: true,
    },
    aviation: {
      cw_21: true,
      "i-153_m62_china": true,
      v_12d: true,
      martin_139wc: true,
    },
    helicopters: {
      z_11wa: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
        has_next_right_item: true,
      },
      sa_342l_china: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
        move_bottom: 1,
      },
      z_9w: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      oh_58d_china: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      z_9wa: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      ah_1w_china: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
      },
      z_19: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      z_10: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
    },
    ships: {},
    boats: {},
  },
  italy: {
    ground: {
      it_as_42_47: true,
      it_m14_41: true,
      it_as_42_metropolitana: true,
      it_lancia3ro_100: true,
      it_39m_csaba: true,
    },
    aviation: {
      re_2000_group: true,
      fiat_g50_italy_group: true,
      fc_20_bis: true,
      sm_79_italy_group: true,
      re_2000_heja_2: true,
    },
    helicopters: {
      ab_205a_1: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      mi_24d_hungary: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      a_109_eoa2: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      mi_24v_hungary: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
      },
      a_129_cbt: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
    },
    ships: {},
    boats: {},
  },
  france: {
    ground: {
      fr_hotchkiss_fcm_group: true,
      fr_amc_35: true,
      fr_saint_chamond: true,
      fr_somua_s35: true,
      fr_renault_d2: true,
      fr_citroen_kegresse_p4t: true,
      fr_somua_sau40: true,
    },
    aviation: {
      ms_405_406_group: true,
      "h-75_france_group": true,
      br_693_ab2: true,
      maryland_group: true,
      fokker_d21_netherlands: true,
    },
    helicopters: {
      h_34_france: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
        has_next_right_item: true,
      },
      sa_316b: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
        move_bottom: 1,
      },
      sa_341f: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      sa_342m: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      tiger_group: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
        has_next_left_item: true,
      },
      ah_64e_netherlands: {
        move_bottom: 1,
      },
    },
    ships: {},
    boats: {
      fr_vtb_group: true,
    },
  },
  sweden: {
    ground: {
      sw_bt_42: true,
      sw_strv_m40l: true,
      sw_pvlvv_fm42: true,
      sw_sav_m43_1944: true,
      sw_t_28: true,
    },
    aviation: {
      fiat_cr42_j11: true,
      saab_b17a_group: true,
      saab_b3c: true,
      fokker_d21_serie3_finland: true,
    },
    helicopters: {
      hkp3c: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      hkp2: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
      hkp9a_cb2: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      hkp9a_cb3_fc: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
    },
    ships: {},
    boats: {},
  },
  israel: {
    ground: {},
    aviation: {},
    helicopters: {
      ah_1g_iaf: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 1,
        has_next_right_item: true,
      },
      md_500_tow_late: {
        cross_level: 2,
        has_next_item: true,
        placeholder_item: 3,
        move_bottom: 1,
      },
      ah_1q_iaf: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      ah_1f_iaf: {
        cross_level: 0,
        has_next_item: true,
        placeholder_item: 0,
      },
      ah_64a_iaf: {
        cross_level: 1,
        has_next_item: true,
        placeholder_item: 0,
      },
    },
    ships: {},
    boats: {},
  },
};

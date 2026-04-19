介绍中的便捷标识：

r_v：researchable_vehicles

p_v：premium_vehicles



tree_data的数据结构模型：

- tree_data下的第一级为rank对象，可能包含I-VIII
- r_v和p_v包含了rank对象中的所有item
- rank对象本身表示行，如果同时存在I-VIII，那就是8行
- r_v位于HTML视图的左边，p_v位于右边。r_v和p_v都是二维数组，其下第一级表示列
- 而列是会跨行的，例如tree_data[0].researchable_vehicles[0]和tree_data[1].researchable_vehicles[0]都属于第一列
- 在视图中从左往右数，例如：
  - researchable_vehicles[0]表示第一列
  - researchable_vehicles[1]表示第二列
  - researchable_vehicles[2]表示第三列（假设这是researchable_vehicles中的最后一列）
  - premium_vehicles[0]表示第四列
  - ...以此类推

```javascript
const tree_data = [
  {
    rank: "VII", // 当前等级
    researchable_vehicles: [ // 普通载具
      [
        {
          type: "single", // item类型：single表示一个载具单位
          title: "Garford-Beute", // 载具名称
          vehicle_icon: "https://....png", // 载具图标
          br: null, // 载具权重，默认为空（表示数据未获取）
          rp: -1, // 载具所需研发点，为0时表示该载具无需研发，为-1时表示数据未获取，默认为-1
          sp: -1, // 载具所需银狮，为0时表示该载具无需用银狮购买，为-1时表示数据未获取，默认为-1
          data_unit_id: "germ_garford_putilov", // 载具唯一标识
          selected: false, // 载具位于视图中的选中状态，默认为false
          class_name: "", // 载具的额外class标识（用于区分普通载具/联队载具/高级载具的底色）squad表示联队，prem表示高级，普通则为空字符串
          main_role: "SPAA", // 载具担任的角色，如自行防空炮"SPAA"或者战斗机"Fighter"...
          details: false, // 当前载具是否已获取详情
          "arrow_points": { // 计算到达同列下一个item指向箭头长度的必要信息
            placeholder_item: 2, // 与同列中下一个item之间相隔的占位符item数量
            cross_level: 1, // 与同列中下一个item之间的等级跨度
            has_next_item: true, // 同列下方是否还有item
          }
        },
      ],
      [
        {
          type: "multiple", // multiple表示一个载具组
          title: "Garford-Beute-1/2", // 载具组名称
          vehicle_icon: "...", // 载具组图标
          selected: false, // ，载具组下（items下）已选中的载具数量>=1时为true，默认为false
          br: "", // 载具组权重，包含items下所出现的权重范围（如9.0-9.3）
          data_unit_id: "il_magach_6a_5_group", // 载具组唯一标识
          class_name: "", // 载具组的额外class标识（同上）
          main_role: "SPAA", // 当前载具组下（items下）第一个item所担任的角色
          details: false, // 当前载具组下（items下）所有的item是否已全部获取详情
          items: [
            // 若干个type为"single"的item
            // items下的item不用计算箭头，因此不包含"arrow_points"字段
          ],
          "arrow_points": { // 计算到达同列下一个item指向箭头长度的必要信息
            placeholder_item: 2, // 与同列中下一个item之间相隔的占位符item数量
            cross_level: 1, // 与同列中下一个item之间的等级跨度
            has_next_item: true, // 同列下方是否还有item
          }
        },
      ],
    ],
    premium_vehicles: [
      // 高级载具
      // 详见researchable_vehicles
      // 高级载具不用计算箭头，因此不包含"arrow_points"字段
    ],
    selected: [
      { data_unit_id, rp, sp }, // 仅包含item的data_unit_id、rp、sp信息
      { data_unit_id, rp, sp },
    ], // 当前等级下已选中的载具（包括researchable_vehicles和premium_vehicles）
    unlock_quantity: 6, // 解锁下一级的前置条件，到达下一级前需要选中本级多少个type为single的item，0表示已经是最后一级
  },
];
```


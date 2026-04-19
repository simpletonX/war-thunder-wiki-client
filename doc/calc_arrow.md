### 占位符 item（placeholder_item）

同等级下不同列为了列长度保持统一而为短的列填充的空 item 就称之为占位符 item，本质上这只是在计算指向箭头的过程中衍生出来的一种概念和临时的数据，在实际的 tree_data 中并不存在。

```javascript
// 这是一个实体占位符 item 的数据格式
{
	type: "placeholder"
}
```

```javascript
const test_1 = [
  {
    rank: "IV",
    researchable_vehicles: [
      [
        {
          type: "single",
          data_unit_id: "a-1",
        },
        {
          type: "multiple",
          items: [],
          data_unit_id: "a-2",
        },
        {
          type: "single",
          data_unit_id: "a-3",
        },
      ],
      [
        {
          type: "single",
          data_unit_id: "b-1",
        },
        {
          type: "multiple",
          items: [],
          data_unit_id: "b-2",
        },
      ],
    ],
    premium_vehicles: [
      [
        {
          type: "single",
          data_unit_id: "c-1",
        },
        {
          type: "single",
          data_unit_id: "c-2",
        },
      ],
    ],
  },
  {
    rank: "V",
    researchable_vehicles: [
      [
        {
          type: "single",
          data_unit_id: "a-4",
        },
        {
          type: "single",
          data_unit_id: "a-5",
        },
      ],
      [],
    ],
    premium_vehicles: [
      [
        {
          type: "single",
          data_unit_id: "c-3",
        },
      ],
    ],
  },
  {
    rank: "VI",
    researchable_vehicles: [
      [
        {
          type: "single",
          data_unit_id: "a-6",
        },
        {
          type: "single",
          data_unit_id: "a-7",
        },
      ],
      [
        {
          type: "single",
          data_unit_id: "b-3",
        },
      ],
    ],
    premium_vehicles: [
      [
        {
          type: "single",
          data_unit_id: "c-4",
        },
      ],
    ],
  },
];
```

以示例数据test_1为例，首先为了能让列的概念更加清晰和直观，在data_unit_id字段中通过a-、b-、c-前缀分别表示第一列、第二列、第三列。

从data_unit_id字段可以看出，列是跨等级的，也就是说，每个等级对象下researchable_vehicles数组中的第一个子数组全部拼起来就是完整的第一列，其它列以此类推。



什么时候需要占位符item，又需要多少个，首先需要确定当前等级对象下最长的一列在哪？根据示例数据test_1中的rank IV，分别从researchable_vehicles和premium_vehicles下寻找并最终找到长度为3的第一列为最长的一列，也就是前缀为a-的一列。

现在同等级下其它所有的列必须要向a-的第一列看齐，通过填充占位符item，将自身的长度与前缀为a-的列同步，至少看起来像这个样子：

```javascript
{
  rank: "IV",
  researchable_vehicles: [
    [
      {
        type: "single",
        data_unit_id: "a-1",
      },
      {
        type: "multiple",
        items: [],
        data_unit_id: "a-2",
      },
      {
        type: "single",
        data_unit_id: "a-3",
      },
    ],
    [
      {
        type: "single",
        data_unit_id: "b-1",
      },
      {
        type: "multiple",
        items: [],
        data_unit_id: "b-2",
      },
      {
        type: "placeholder",
      }
    ],
  ],
  premium_vehicles: [
    [
      {
        type: "single",
        data_unit_id: "c-1",
      },
      {
        type: "single",
        data_unit_id: "c-2",
      },
      {
        type: "placeholder",
      }
    ],
  ],
}
```

这样rank IV的所有列长度都是3了。placeholder_item的填充不会污染tree_data本体，tree_data在进入遍历前会深拷贝一个副本copy_tree_data，{ type: "placeholder" }至始至终也没有插入到任何一个tree_data，它只是内部循环上下文中的一个临时变量而已。



### 等级跨度（cross level）

在计算指向箭头长度时的另一个重要概念是等级跨度。因为在最终的HTML渲染时每个等级之间存在一定的垂直外边距，只有确定了同一列中上下两个相邻的item中间的等级跨度才能精确得出箭头真正的长度是多少。

以示例数据test_1为例，可以看到同列中data_unit_id为"b-2"的item与其下一个item（data_unit_id为"b-3"）之间相隔了rank V和rank VI两个等级，中间的rank V第二列是一个空数组。

因此data_unit_id为"b-2"的item等级跨度为2。



### 最后节点标识 has_next_item

这是最后一个重要的字段，它明确定义了当前item位于同列正下方是否还有载具存在，如果存在它表示为true，否则表示为false。这是用于区分一个item是否为当前列的最后一个节点。



### 数据点挂载

确定了占位符item和等级跨度信息之后，就可以通过下面这种格式挂载到tree_data的每个item节点中。最后在item组件中会通过这两个信息计算出指向箭头的长度。

```javascript
arrow_points: {
  /**
   * 占位符item个数：同列中下方的空item数量为多少个
   */
  placeholder_item: 0,
  /**
   * 等级跨度：同列中的下一辆载具是否跨等级，等级跨度为多少（示例：数字2表示跨2级）
   * - 0表示无跨级，说明下一辆载具位于同级
   */
  cross_level: 0,
  /**
   * 最后节点标识：同列下方是否还有载具？
   * - true表示有，false表示没有
   */
  has_next_item: true,
}
```

最后完成挂载的完整item以下面代码为例：

```javascript
{
  rank: "V",
  researchable_vehicles: [
    [
      {
        "type": "single",
        "title": "Hovet",
        "vehicle_icon": "https://static.encyclopedia.warthunder.com/slots/il_m163_vulcan.png",
        "br": "7.3",
        "rp": "82,000",
        "sp": "240,000",
        "data_unit_id": "il_m163_vulcan",
        "selected": false,
        "class_name": "",
        "details": true,
        "main_role": "SPAA",
        "arrow_points": {
          placeholder_item: 2, // 与同列中下一辆载具之间相隔两个空item
          cross_level: 1, // 与同列中下一辆载具之间跨了一级（V-VI）
          has_next_item: true, // 同列下方还有载具
        }
      }
    ]
  ],
  premium_vehicles: [/** 略 */],
}
```



### 特别注意事项

在寻找最长的列时，它可以是researchable_vehicles中的列，也可以是premium_vehicles中的列。但premium_vehicles中的item是不需要进行指向箭头长度计算的，因此不具备placeholder_item和cross_level，也就不需要arrow_points字段了。

无需关心item的type是"single"还是"multiple"，只要是researchable_vehicles中的item，就都需要挂载arrow_points。但是items下的item是不需要挂载arrow_points的，items详见tree_data的数据结构。

> ⚠️ premium_vehicles中的所有item以及items下的item不需要挂载arrow_points



### 函数设计规范

```javascript
export async function mountArrowPoints({ tree_data, _t_c, _type, instantCaching }) {
	// 传入的tree_data是一个vue3的响应式数据，需要通过.value的形式访问
  // 处理完成后的tree_data通过即时缓存同步更新到本地存储
	await instantCaching(copy_tree_data, _t_c, _type, instantCaching)
}
```

